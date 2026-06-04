import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLifecycle } from './entities/product-lifecycle.entity';
import { ProductBatch } from './entities/product-batch.entity';
import { QualityRecord } from './entities/quality-record.entity';
import { LifecycleService } from './lifecycle.service';
import { LifecycleController } from './lifecycle.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductLifecycle, ProductBatch, QualityRecord])],
  controllers: [LifecycleController],
  providers: [LifecycleService],
  exports: [LifecycleService],
})
export class LifecycleModule {}
