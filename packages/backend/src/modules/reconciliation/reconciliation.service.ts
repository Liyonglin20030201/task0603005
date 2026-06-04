import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reconciliation } from './entities/reconciliation.entity';
import { ReconciliationDetail } from './entities/reconciliation-detail.entity';
import { Settlement } from './entities/settlement.entity';
import { FeeRule } from './entities/fee-rule.entity';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { QueryReconciliationDto } from './dto/query-reconciliation.dto';
import { ResolveDetailDto } from './dto/resolve-detail.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { QuerySettlementDto } from './dto/query-settlement.dto';
import { CreateFeeRuleDto } from './dto/create-fee-rule.dto';

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectRepository(Reconciliation)
    private readonly reconciliationRepo: Repository<Reconciliation>,
    @InjectRepository(ReconciliationDetail)
    private readonly detailRepo: Repository<ReconciliationDetail>,
    @InjectRepository(Settlement)
    private readonly settlementRepo: Repository<Settlement>,
    @InjectRepository(FeeRule)
    private readonly feeRuleRepo: Repository<FeeRule>,
  ) {}

  async createReconciliation(dto: CreateReconciliationDto, operatorId: number) {
    const reconciliation = this.reconciliationRepo.create({
      platform: dto.platform,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      operatorId,
      status: 'pending',
    });
    const saved = await this.reconciliationRepo.save(reconciliation);

    // Auto-generate mock detail records for demonstration
    const mockCount = Math.floor(Math.random() * 15) + 5;
    const details: ReconciliationDetail[] = [];
    for (let i = 0; i < mockCount; i++) {
      const platformAmount = +(Math.random() * 500 + 50).toFixed(2);
      const hasDiscrepancy = Math.random() < 0.3;
      const localAmount = hasDiscrepancy
        ? +(platformAmount + (Math.random() * 20 - 10)).toFixed(2)
        : platformAmount;
      const detail = this.detailRepo.create({
        reconciliationId: saved.id,
        platformOrderNo: `PLT${Date.now()}${i.toString().padStart(3, '0')}`,
        localOrderNo: Math.random() > 0.1 ? `ORD${Date.now()}${i.toString().padStart(3, '0')}` : null,
        platformAmount,
        localAmount,
        differenceAmount: +(platformAmount - localAmount).toFixed(2),
        status: 'pending',
      });
      details.push(detail);
    }
    await this.detailRepo.save(details);

    // Update summary
    saved.totalOrders = mockCount;
    saved.platformAmount = +details.reduce((s, d) => s + +d.platformAmount, 0).toFixed(2);
    saved.localAmount = +details.reduce((s, d) => s + +d.localAmount, 0).toFixed(2);
    saved.differenceAmount = +(saved.platformAmount - saved.localAmount).toFixed(2);
    await this.reconciliationRepo.save(saved);

    return saved;
  }

  async listReconciliations(query: QueryReconciliationDto) {
    const { page = 1, pageSize = 20, platform, status, startDate, endDate } = query;
    const qb = this.reconciliationRepo.createQueryBuilder('r');

    if (platform) {
      qb.andWhere('r.platform = :platform', { platform });
    }
    if (status) {
      qb.andWhere('r.status = :status', { status });
    }
    if (startDate) {
      qb.andWhere('r.period_start >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('r.period_end <= :endDate', { endDate });
    }

    qb.orderBy('r.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getReconciliationDetail(id: number) {
    const reconciliation = await this.reconciliationRepo.findOne({
      where: { id },
      relations: ['details'],
    });
    if (!reconciliation) {
      throw new NotFoundException('对账记录不存在');
    }
    return reconciliation;
  }

  async executeReconciliation(id: number) {
    const reconciliation = await this.reconciliationRepo.findOne({
      where: { id },
      relations: ['details'],
    });
    if (!reconciliation) {
      throw new NotFoundException('对账记录不存在');
    }
    if (reconciliation.status !== 'pending') {
      throw new BadRequestException('只能执行待对账的记录');
    }

    let matchedCount = 0;
    let discrepancyCount = 0;

    for (const detail of reconciliation.details) {
      const diff = Math.abs(+detail.platformAmount - +detail.localAmount);
      if (diff < 0.01 && detail.localOrderNo) {
        detail.status = 'matched';
        matchedCount++;
      } else {
        detail.status = 'discrepancy';
        detail.differenceReason = !detail.localOrderNo
          ? '本地无对应订单'
          : '金额不一致';
        discrepancyCount++;
      }
    }

    await this.detailRepo.save(reconciliation.details);

    reconciliation.matchedOrders = matchedCount;
    reconciliation.discrepancyOrders = discrepancyCount;
    reconciliation.status = discrepancyCount > 0 ? 'discrepancy' : 'matched';
    reconciliation.reconciledAt = new Date();
    await this.reconciliationRepo.save(reconciliation);

    return reconciliation;
  }

  async resolveDetail(detailId: number, dto: ResolveDetailDto, operatorId: number, operatorName: string) {
    const detail = await this.detailRepo.findOne({ where: { id: detailId } });
    if (!detail) {
      throw new NotFoundException('对账明细不存在');
    }
    if (detail.status !== 'discrepancy') {
      throw new BadRequestException('只能处理有差异的明细');
    }

    detail.status = dto.status || 'resolved';
    detail.remark = dto.remark || null;
    detail.resolvedAt = new Date();
    detail.operatorId = operatorId;
    detail.operatorName = operatorName;
    await this.detailRepo.save(detail);

    // Check if all details of the reconciliation are resolved
    const reconciliation = await this.reconciliationRepo.findOne({
      where: { id: detail.reconciliationId },
      relations: ['details'],
    });
    if (reconciliation) {
      const allResolved = reconciliation.details.every(
        (d) => d.status === 'matched' || d.status === 'resolved',
      );
      if (allResolved) {
        reconciliation.status = 'resolved';
        await this.reconciliationRepo.save(reconciliation);
      }
    }

    return detail;
  }

  async createSettlement(dto: CreateSettlementDto) {
    // Generate settlement number
    const settlementNo = `STL${Date.now()}`;

    // Get active fee rules for the platform
    const feeRules = await this.feeRuleRepo.find({
      where: { platform: dto.platform, status: 1 },
    });

    // Calculate fees
    const feeBreakdown: { type: string; amount: number; rate?: number }[] = [];
    let totalFees = 0;

    for (const rule of feeRules) {
      let feeAmount = 0;
      if (+rule.rate > 0) {
        feeAmount = +(dto.grossAmount * +rule.rate).toFixed(2);
      }
      if (+rule.fixedAmount > 0) {
        feeAmount += +rule.fixedAmount;
      }
      // Apply min/max constraints
      feeAmount = Math.max(+rule.minAmount, Math.min(+rule.maxAmount, feeAmount));
      feeBreakdown.push({
        type: rule.feeType,
        amount: +feeAmount.toFixed(2),
        rate: +rule.rate,
      });
      totalFees += feeAmount;
    }

    totalFees = +totalFees.toFixed(2);
    const netAmount = +(dto.grossAmount - totalFees - (dto.refundAmount || 0)).toFixed(2);

    const settlement = this.settlementRepo.create({
      platform: dto.platform,
      settlementNo,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      grossAmount: dto.grossAmount,
      totalFees,
      netAmount,
      orderCount: dto.orderCount,
      refundCount: dto.refundCount || 0,
      refundAmount: dto.refundAmount || 0,
      feeBreakdown,
      status: 'unsettled',
    });

    return this.settlementRepo.save(settlement);
  }

  async listSettlements(query: QuerySettlementDto) {
    const { page = 1, pageSize = 20, platform, status, startDate, endDate } = query;
    const qb = this.settlementRepo.createQueryBuilder('s');

    if (platform) {
      qb.andWhere('s.platform = :platform', { platform });
    }
    if (status) {
      qb.andWhere('s.status = :status', { status });
    }
    if (startDate) {
      qb.andWhere('s.period_start >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('s.period_end <= :endDate', { endDate });
    }

    qb.orderBy('s.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page: +page,
      pageSize: +pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getSettlement(id: number) {
    const settlement = await this.settlementRepo.findOne({ where: { id } });
    if (!settlement) {
      throw new NotFoundException('结算记录不存在');
    }
    return settlement;
  }

  async updateSettlement(id: number, dto: UpdateSettlementDto) {
    const settlement = await this.getSettlement(id);
    if (dto.status) {
      settlement.status = dto.status;
    }
    if (dto.bankAccount) {
      settlement.bankAccount = dto.bankAccount;
    }
    if (dto.settledAt) {
      settlement.settledAt = new Date(dto.settledAt);
    }
    if (dto.status === 'settled' && !settlement.settledAt) {
      settlement.settledAt = new Date();
    }
    return this.settlementRepo.save(settlement);
  }

  async listFeeRules(platform?: string) {
    const where: any = { status: 1 };
    if (platform) {
      where.platform = platform;
    }
    return this.feeRuleRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async createFeeRule(dto: CreateFeeRuleDto) {
    const rule = this.feeRuleRepo.create({
      platform: dto.platform,
      feeType: dto.feeType,
      rate: dto.rate,
      fixedAmount: dto.fixedAmount || 0,
      minAmount: dto.minAmount || 0,
      maxAmount: dto.maxAmount || 99999,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      status: 1,
    });
    return this.feeRuleRepo.save(rule);
  }

  async updateFeeRule(id: number, dto: Partial<CreateFeeRuleDto> & { status?: number }) {
    const rule = await this.feeRuleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException('费率规则不存在');
    }
    if (dto.platform !== undefined) rule.platform = dto.platform;
    if (dto.feeType !== undefined) rule.feeType = dto.feeType;
    if (dto.rate !== undefined) rule.rate = dto.rate;
    if (dto.fixedAmount !== undefined) rule.fixedAmount = dto.fixedAmount;
    if (dto.minAmount !== undefined) rule.minAmount = dto.minAmount;
    if (dto.maxAmount !== undefined) rule.maxAmount = dto.maxAmount;
    if (dto.effectiveFrom) rule.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.effectiveTo !== undefined) rule.effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;
    if (dto.status !== undefined) rule.status = dto.status;
    return this.feeRuleRepo.save(rule);
  }

  async getDashboard() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total settlements this month
    const settlementsThisMonth = await this.settlementRepo
      .createQueryBuilder('s')
      .where('s.created_at >= :monthStart', { monthStart })
      .getMany();

    const totalSettledAmount = settlementsThisMonth
      .filter((s) => s.status === 'settled')
      .reduce((sum, s) => sum + +s.netAmount, 0);

    // Pending reconciliations
    const pendingReconciliations = await this.reconciliationRepo.count({
      where: { status: 'pending' },
    });

    // Total discrepancies
    const discrepancyReconciliations = await this.reconciliationRepo.count({
      where: { status: 'discrepancy' },
    });

    // Net revenue this month
    const netRevenue = settlementsThisMonth.reduce((sum, s) => sum + +s.netAmount, 0);

    return {
      totalSettledAmount: +totalSettledAmount.toFixed(2),
      pendingReconciliations,
      discrepancyReconciliations,
      netRevenue: +netRevenue.toFixed(2),
      settlementsCount: settlementsThisMonth.length,
    };
  }
}
