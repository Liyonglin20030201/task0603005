import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { CreateReconciliationDto } from './dto/create-reconciliation.dto';
import { QueryReconciliationDto } from './dto/query-reconciliation.dto';
import { ResolveDetailDto } from './dto/resolve-detail.dto';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { QuerySettlementDto } from './dto/query-settlement.dto';
import { CreateFeeRuleDto } from './dto/create-fee-rule.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('财务对账结算')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('reconciliations')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get('dashboard')
  @RequirePermission(PERMISSIONS.RECONCILIATION_VIEW)
  @ApiOperation({ summary: '对账结算概览' })
  getDashboard() {
    return this.reconciliationService.getDashboard();
  }

  @Get()
  @RequirePermission(PERMISSIONS.RECONCILIATION_VIEW)
  @ApiOperation({ summary: '对账列表' })
  findAll(@Query() query: QueryReconciliationDto) {
    return this.reconciliationService.listReconciliations(query);
  }

  @Post()
  @RequirePermission(PERMISSIONS.RECONCILIATION_CREATE)
  @OperationLogMeta('reconciliation', 'create')
  @ApiOperation({ summary: '创建对账' })
  create(@Body() dto: CreateReconciliationDto, @CurrentAdmin('id') adminId: number) {
    return this.reconciliationService.createReconciliation(dto, adminId);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.RECONCILIATION_VIEW)
  @ApiOperation({ summary: '对账详情' })
  findOne(@Param('id') id: number) {
    return this.reconciliationService.getReconciliationDetail(id);
  }

  @Post(':id/execute')
  @RequirePermission(PERMISSIONS.RECONCILIATION_UPDATE)
  @OperationLogMeta('reconciliation', 'execute')
  @ApiOperation({ summary: '执行对账' })
  execute(@Param('id') id: number) {
    return this.reconciliationService.executeReconciliation(id);
  }

  @Put('details/:detailId/resolve')
  @RequirePermission(PERMISSIONS.RECONCILIATION_UPDATE)
  @OperationLogMeta('reconciliation', 'resolveDetail')
  @ApiOperation({ summary: '处理差异明细' })
  resolveDetail(@Param('detailId') detailId: number, @Body() dto: ResolveDetailDto) {
    return this.reconciliationService.resolveDetail(detailId, dto);
  }
}

@ApiTags('结算管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('settlements')
export class SettlementController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get()
  @RequirePermission(PERMISSIONS.SETTLEMENT_VIEW)
  @ApiOperation({ summary: '结算列表' })
  findAll(@Query() query: QuerySettlementDto) {
    return this.reconciliationService.listSettlements(query);
  }

  @Post()
  @RequirePermission(PERMISSIONS.SETTLEMENT_UPDATE)
  @OperationLogMeta('settlement', 'create')
  @ApiOperation({ summary: '创建结算' })
  create(@Body() dto: CreateSettlementDto) {
    return this.reconciliationService.createSettlement(dto);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.SETTLEMENT_VIEW)
  @ApiOperation({ summary: '结算详情' })
  findOne(@Param('id') id: number) {
    return this.reconciliationService.getSettlement(id);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.SETTLEMENT_UPDATE)
  @OperationLogMeta('settlement', 'update')
  @ApiOperation({ summary: '更新结算' })
  update(@Param('id') id: number, @Body() dto: UpdateSettlementDto) {
    return this.reconciliationService.updateSettlement(id, dto);
  }
}

@ApiTags('费率配置')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('fee-rules')
export class FeeRuleController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get()
  @RequirePermission(PERMISSIONS.FEE_RULE_VIEW)
  @ApiOperation({ summary: '费率列表' })
  findAll(@Query('platform') platform?: string) {
    return this.reconciliationService.listFeeRules(platform);
  }

  @Post()
  @RequirePermission(PERMISSIONS.FEE_RULE_UPDATE)
  @OperationLogMeta('fee_rule', 'create')
  @ApiOperation({ summary: '创建费率规则' })
  create(@Body() dto: CreateFeeRuleDto) {
    return this.reconciliationService.createFeeRule(dto);
  }

  @Put(':id')
  @RequirePermission(PERMISSIONS.FEE_RULE_UPDATE)
  @OperationLogMeta('fee_rule', 'update')
  @ApiOperation({ summary: '更新费率规则' })
  update(@Param('id') id: number, @Body() dto: CreateFeeRuleDto) {
    return this.reconciliationService.updateFeeRule(id, dto);
  }
}
