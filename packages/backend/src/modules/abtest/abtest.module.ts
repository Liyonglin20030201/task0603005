import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ABTest } from './entities/ab-test.entity';
import { ABTestVariant } from './entities/ab-test-variant.entity';
import { ABTestEvent } from './entities/ab-test-event.entity';
import { ABTestService } from './abtest.service';
import { ABTestController } from './abtest.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ABTest, ABTestVariant, ABTestEvent])],
  controllers: [ABTestController],
  providers: [ABTestService],
  exports: [ABTestService],
})
export class ABTestModule {}
