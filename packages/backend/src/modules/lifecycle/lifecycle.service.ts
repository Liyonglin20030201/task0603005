import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductLifecycle } from './entities/product-lifecycle.entity';
import { ProductBatch } from './entities/product-batch.entity';
import { QualityRecord } from './entities/quality-record.entity';
import { TransitionLifecycleDto } from './dto/transition-lifecycle.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CreateQualityRecordDto } from './dto/create-quality-record.dto';
import { QueryLifecycleDto, QueryBatchDto, QueryQualityRecordDto } from './dto/query-lifecycle.dto';
import { PRODUCT_LIFECYCLE_TRANSITIONS, ProductLifecycleStage, PRODUCT_LIFECYCLE_STAGE_LABEL } from '@ecommerce/shared';

@Injectable()
export class LifecycleService {
  constructor(
    @InjectRepository(ProductLifecycle)
    private readonly lifecycleRepo: Repository<ProductLifecycle>,
    @InjectRepository(ProductBatch)
    private readonly batchRepo: Repository<ProductBatch>,
    @InjectRepository(QualityRecord)
    private readonly qualityRepo: Repository<QualityRecord>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getLifecycle(productId: number): Promise<ProductLifecycle> {
    let lifecycle = await this.lifecycleRepo.findOne({ where: { productId } });
    if (!lifecycle) {
      const productRepo = this.dataSource.getRepository('Product');
      const product = await productRepo.findOne({ where: { id: productId } });
      if (!product) {
        throw new NotFoundException('商品不存在');
      }
      const now = new Date().toISOString();
      lifecycle = this.lifecycleRepo.create({
        productId,
        currentStage: ProductLifecycleStage.DEVELOPMENT,
        stageHistory: [{ stage: ProductLifecycleStage.DEVELOPMENT, enteredAt: now, operatorId: 0, remark: '初始化' }],
      });
      lifecycle = await this.lifecycleRepo.save(lifecycle);
    }
    return lifecycle;
  }

  async transitionStage(productId: number, dto: TransitionLifecycleDto, operatorId: number): Promise<ProductLifecycle> {
    const lifecycle = await this.getLifecycle(productId);
    const currentStage = lifecycle.currentStage as ProductLifecycleStage;
    const targetStage = dto.stage as ProductLifecycleStage;

    const allowedTransitions = PRODUCT_LIFECYCLE_TRANSITIONS[currentStage];
    if (!allowedTransitions || !allowedTransitions.includes(targetStage)) {
      const currentLabel = PRODUCT_LIFECYCLE_STAGE_LABEL[currentStage] || currentStage;
      const targetLabel = PRODUCT_LIFECYCLE_STAGE_LABEL[targetStage] || targetStage;
      throw new BadRequestException(`不允许从「${currentLabel}」转换到「${targetLabel}」`);
    }

    lifecycle.currentStage = targetStage;
    lifecycle.stageHistory.push({
      stage: targetStage,
      enteredAt: new Date().toISOString(),
      operatorId,
      remark: dto.remark,
    });

    return this.lifecycleRepo.save(lifecycle);
  }

  async listLifecycles(query: QueryLifecycleDto) {
    const { page = 1, pageSize = 10, productId, currentStage } = query;

    const qb = this.lifecycleRepo.createQueryBuilder('l');

    if (productId) {
      qb.andWhere('l.product_id = :productId', { productId });
    }
    if (currentStage) {
      qb.andWhere('l.current_stage = :currentStage', { currentStage });
    }

    qb.orderBy('l.updated_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    // Attach product info
    if (items.length > 0) {
      const productIds = items.map((i) => i.productId);
      const productRepo = this.dataSource.getRepository('Product');
      const products = await productRepo
        .createQueryBuilder('p')
        .whereInIds(productIds)
        .getMany();
      const productMap = new Map(products.map((p: any) => [p.id, p]));
      (items as any[]).forEach((item) => {
        const product = productMap.get(item.productId) as any;
        if (product) {
          item.productName = product.name;
          item.productSku = product.sku;
        }
      });
    }

    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // ====== Batch Management ======

  async createBatch(dto: CreateBatchDto): Promise<ProductBatch> {
    const productRepo = this.dataSource.getRepository('Product');
    const product = await productRepo.findOne({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    const existing = await this.batchRepo.findOne({ where: { batchNo: dto.batchNo } });
    if (existing) {
      throw new BadRequestException('批次号已存在');
    }

    const traceCode = `TC${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const batch = this.batchRepo.create({
      ...dto,
      remainingQuantity: dto.quantity,
      traceCode,
      metadata: {},
    });
    return this.batchRepo.save(batch);
  }

  async updateBatch(id: number, dto: UpdateBatchDto): Promise<ProductBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException('批次不存在');
    }

    if (dto.status !== undefined) {
      batch.status = dto.status;
    }
    if (dto.remainingQuantity !== undefined) {
      if (dto.remainingQuantity > batch.quantity) {
        throw new BadRequestException('剩余数量不能超过总数量');
      }
      batch.remainingQuantity = dto.remainingQuantity;
      if (batch.remainingQuantity === 0) {
        batch.status = 'depleted';
      }
    }

    return this.batchRepo.save(batch);
  }

  async listBatches(query: QueryBatchDto) {
    const { page = 1, pageSize = 10, productId, status } = query;

    const qb = this.batchRepo.createQueryBuilder('b');

    if (productId) {
      qb.andWhere('b.product_id = :productId', { productId });
    }
    if (status) {
      qb.andWhere('b.status = :status', { status });
    }

    qb.orderBy('b.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    // Attach product info
    if (items.length > 0) {
      const productIds = [...new Set(items.map((i) => i.productId))];
      const productRepo = this.dataSource.getRepository('Product');
      const products = await productRepo
        .createQueryBuilder('p')
        .whereInIds(productIds)
        .getMany();
      const productMap = new Map(products.map((p: any) => [p.id, p]));
      (items as any[]).forEach((item) => {
        const product = productMap.get(item.productId) as any;
        if (product) {
          item.productName = product.name;
        }
      });
    }

    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getBatch(id: number): Promise<ProductBatch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException('批次不存在');
    }
    return batch;
  }

  async getTraceInfo(traceCode: string) {
    const batch = await this.batchRepo.findOne({ where: { traceCode } });
    if (!batch) {
      throw new NotFoundException('追溯码无效');
    }

    const qualityRecords = await this.qualityRepo.find({
      where: { batchId: batch.id },
      order: { checkedAt: 'DESC' },
    });

    const lifecycle = await this.lifecycleRepo.findOne({ where: { productId: batch.productId } });

    // Get product info
    const productRepo = this.dataSource.getRepository('Product');
    const product = await productRepo.findOne({ where: { id: batch.productId } }) as any;

    return {
      batch,
      qualityRecords,
      lifecycle,
      product: product ? { id: product.id, name: product.name, sku: product.sku } : null,
    };
  }

  // ====== Quality Records ======

  async createQualityRecord(dto: CreateQualityRecordDto): Promise<QualityRecord> {
    const productRepo = this.dataSource.getRepository('Product');
    const product = await productRepo.findOne({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    if (dto.batchId) {
      const batch = await this.batchRepo.findOne({ where: { id: dto.batchId } });
      if (!batch) {
        throw new NotFoundException('批次不存在');
      }
      // Update batch quality score
      batch.qualityScore = dto.score;
      await this.batchRepo.save(batch);
    }

    const record = this.qualityRepo.create({
      ...dto,
      checkedAt: dto.checkedAt ? new Date(dto.checkedAt) : new Date(),
      attachments: dto.attachments || [],
      remark: dto.remark || '',
    });
    return this.qualityRepo.save(record);
  }

  async listQualityRecords(query: QueryQualityRecordDto) {
    const { page = 1, pageSize = 10, productId, batchId, result } = query;

    const qb = this.qualityRepo.createQueryBuilder('q');

    if (productId) {
      qb.andWhere('q.product_id = :productId', { productId });
    }
    if (batchId) {
      qb.andWhere('q.batch_id = :batchId', { batchId });
    }
    if (result) {
      qb.andWhere('q.result = :result', { result });
    }

    qb.orderBy('q.checked_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    // Attach product info
    if (items.length > 0) {
      const productIds = [...new Set(items.map((i) => i.productId))];
      const productRepo = this.dataSource.getRepository('Product');
      const products = await productRepo
        .createQueryBuilder('p')
        .whereInIds(productIds)
        .getMany();
      const productMap = new Map(products.map((p: any) => [p.id, p]));
      (items as any[]).forEach((item) => {
        const product = productMap.get(item.productId) as any;
        if (product) {
          item.productName = product.name;
        }
      });
    }

    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getQualityRecord(id: number): Promise<QualityRecord> {
    const record = await this.qualityRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException('质量记录不存在');
    }
    return record;
  }
}
