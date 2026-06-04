import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reconciliation } from './entities/reconciliation.entity';
import { ReconciliationDetail } from './entities/reconciliation-detail.entity';
import { Settlement } from './entities/settlement.entity';
import { FeeRule } from './entities/fee-rule.entity';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController, SettlementController, FeeRuleController } from './reconciliation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reconciliation, ReconciliationDetail, Settlement, FeeRule])],
  controllers: [ReconciliationController, SettlementController, FeeRuleController],
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
