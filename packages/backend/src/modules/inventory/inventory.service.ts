import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { InventoryLog } from './entities/inventory-log.entity';
import { Product } from '../product/entities/product.entity';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(InventoryLog)
    private logRepo: Repository<InventoryLog>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async findAll(query: QueryInventoryDto) {
    const { page, pageSize, sortBy, sortOrder, productName, belowWarning } = query;
    const qb = this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoin(Product, 'product', 'product.id = inv.productId')
      .addSelect(['product.name', 'product.sku']);

    if (productName) {
      qb.andWhere('product.name LIKE :name', { name: `%${productName}%` });
    }
    if (belowWarning) {
      qb.andWhere('inv.quantity <= inv.warningThreshold');
    }

    qb.orderBy(`inv.${sortBy || 'updatedAt'}`, sortOrder || 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    const enriched = await Promise.all(
      items.map(async (inv) => {
        const product = await this.productRepo.findOne({ where: { id: inv.productId } });
        return {
          ...inv,
          productName: product?.name,
          productSku: product?.sku,
          availableQuantity: inv.quantity - inv.lockedQuantity,
        };
      }),
    );

    return { items: enriched, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findByProductId(productId: number) {
    const inventory = await this.inventoryRepo.findOne({ where: { productId } });
    if (!inventory) throw new NotFoundException('库存记录不存在');
    return inventory;
  }

  async adjust(dto: AdjustInventoryDto, operatorId: number) {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const inventory = await this.inventoryRepo.findOne({
        where: { productId: dto.productId },
      });
      if (!inventory) throw new NotFoundException('库存记录不存在');

      const newQuantity = inventory.quantity + dto.quantity;
      if (newQuantity < 0) {
        throw new BusinessException('调整后库存不能为负数');
      }
      if (newQuantity < inventory.lockedQuantity) {
        throw new BusinessException('调整后库存不能小于锁定数量');
      }

      const result = await this.inventoryRepo.update(
        { id: inventory.id, version: inventory.version },
        { quantity: newQuantity, version: inventory.version + 1 },
      );

      if (result.affected === 1) {
        await this.logRepo.save(
          this.logRepo.create({
            productId: dto.productId,
            type: 'adjust',
            quantity: dto.quantity,
            beforeQuantity: inventory.quantity,
            afterQuantity: newQuantity,
            operatorId,
            remark: dto.remark || '手动调整',
          }),
        );
        return this.inventoryRepo.findOne({ where: { productId: dto.productId } });
      }
    }

    throw new BusinessException('库存更新冲突，请重试');
  }

  async deductStock(productId: number, quantity: number, orderId: number): Promise<void> {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const inventory = await this.inventoryRepo.findOne({ where: { productId } });
      if (!inventory) throw new NotFoundException('库存记录不存在');

      const available = inventory.quantity - inventory.lockedQuantity;
      if (available < quantity) {
        throw new BusinessException('库存不足');
      }

      const result = await this.inventoryRepo.update(
        { id: inventory.id, version: inventory.version },
        {
          quantity: inventory.quantity - quantity,
          version: inventory.version + 1,
        },
      );

      if (result.affected === 1) {
        await this.logRepo.save(
          this.logRepo.create({
            productId,
            type: 'out',
            quantity: -quantity,
            beforeQuantity: inventory.quantity,
            afterQuantity: inventory.quantity - quantity,
            orderId,
            remark: `订单扣减`,
          }),
        );
        return;
      }
    }

    throw new BusinessException('库存更新冲突，请重试');
  }

  async lockStock(productId: number, quantity: number, orderId: number): Promise<void> {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const inventory = await this.inventoryRepo.findOne({ where: { productId } });
      if (!inventory) throw new NotFoundException('库存记录不存在');

      const available = inventory.quantity - inventory.lockedQuantity;
      if (available < quantity) {
        throw new BusinessException('可用库存不足');
      }

      const result = await this.inventoryRepo.update(
        { id: inventory.id, version: inventory.version },
        {
          lockedQuantity: inventory.lockedQuantity + quantity,
          version: inventory.version + 1,
        },
      );

      if (result.affected === 1) {
        await this.logRepo.save(
          this.logRepo.create({
            productId,
            type: 'lock',
            quantity,
            beforeQuantity: inventory.quantity,
            afterQuantity: inventory.quantity,
            orderId,
            remark: '订单锁定库存',
          }),
        );
        return;
      }
    }

    throw new BusinessException('库存锁定冲突，请重试');
  }

  async unlockStock(productId: number, quantity: number, orderId: number): Promise<void> {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const inventory = await this.inventoryRepo.findOne({ where: { productId } });
      if (!inventory) throw new NotFoundException('库存记录不存在');

      const result = await this.inventoryRepo.update(
        { id: inventory.id, version: inventory.version },
        {
          lockedQuantity: Math.max(0, inventory.lockedQuantity - quantity),
          version: inventory.version + 1,
        },
      );

      if (result.affected === 1) {
        await this.logRepo.save(
          this.logRepo.create({
            productId,
            type: 'unlock',
            quantity: -quantity,
            beforeQuantity: inventory.quantity,
            afterQuantity: inventory.quantity,
            orderId,
            remark: '订单释放锁定库存',
          }),
        );
        return;
      }
    }

    throw new BusinessException('库存释放冲突，请重试');
  }

  async restoreStock(productId: number, quantity: number, orderId: number): Promise<void> {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const inventory = await this.inventoryRepo.findOne({ where: { productId } });
      if (!inventory) throw new NotFoundException('库存记录不存在');

      const result = await this.inventoryRepo.update(
        { id: inventory.id, version: inventory.version },
        {
          quantity: inventory.quantity + quantity,
          version: inventory.version + 1,
        },
      );

      if (result.affected === 1) {
        await this.logRepo.save(
          this.logRepo.create({
            productId,
            type: 'in',
            quantity,
            beforeQuantity: inventory.quantity,
            afterQuantity: inventory.quantity + quantity,
            orderId,
            remark: '订单取消/退款归还',
          }),
        );
        return;
      }
    }

    throw new BusinessException('库存归还冲突，请重试');
  }

  async getLogs(productId: number, page: number = 1, pageSize: number = 20) {
    const [items, total] = await this.logRepo.findAndCount({
      where: { productId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async updateWarningThreshold(productId: number, threshold: number) {
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const inventory = await this.inventoryRepo.findOne({ where: { productId } });
      if (!inventory) throw new NotFoundException('库存记录不存在');

      const result = await this.inventoryRepo.update(
        { id: inventory.id, version: inventory.version },
        { warningThreshold: threshold, version: inventory.version + 1 },
      );

      if (result.affected === 1) {
        return this.inventoryRepo.findOne({ where: { productId } });
      }
    }

    throw new BusinessException('预警阈值更新冲突，请重试');
  }
}
