import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LifecycleService } from './lifecycle.service';
import { TransitionLifecycleDto } from './dto/transition-lifecycle.dto';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { CreateQualityRecordDto } from './dto/create-quality-record.dto';
import { QueryLifecycleDto, QueryBatchDto, QueryQualityRecordDto } from './dto/query-lifecycle.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('产品生命周期')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller()
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  // ====== Lifecycle ======

  @Get('lifecycles')
  @RequirePermission(PERMISSIONS.LIFECYCLE_VIEW)
  @ApiOperation({ summary: '生命周期列表' })
  listLifecycles(@Query() query: QueryLifecycleDto) {
    return this.lifecycleService.listLifecycles(query);
  }

  @Get('lifecycles/:productId')
  @RequirePermission(PERMISSIONS.LIFECYCLE_VIEW)
  @ApiOperation({ summary: '获取商品生命周期' })
  getLifecycle(@Param('productId') productId: number) {
    return this.lifecycleService.getLifecycle(productId);
  }

  @Put('lifecycles/:productId/transition')
  @RequirePermission(PERMISSIONS.LIFECYCLE_UPDATE)
  @OperationLogMeta('lifecycle', 'transition')
  @ApiOperation({ summary: '切换生命周期阶段' })
  transitionStage(
    @Param('productId') productId: number,
    @Body() dto: TransitionLifecycleDto,
    @CurrentAdmin('id') adminId: number,
  ) {
    return this.lifecycleService.transitionStage(productId, dto, adminId);
  }

  // ====== Batches ======

  @Get('batches')
  @RequirePermission(PERMISSIONS.BATCH_VIEW)
  @ApiOperation({ summary: '批次列表' })
  listBatches(@Query() query: QueryBatchDto) {
    return this.lifecycleService.listBatches(query);
  }

  @Get('batches/trace/:traceCode')
  @RequirePermission(PERMISSIONS.BATCH_VIEW)
  @ApiOperation({ summary: '追溯码查询' })
  getTraceInfo(@Param('traceCode') traceCode: string) {
    return this.lifecycleService.getTraceInfo(traceCode);
  }

  @Get('batches/:id')
  @RequirePermission(PERMISSIONS.BATCH_VIEW)
  @ApiOperation({ summary: '批次详情' })
  getBatch(@Param('id') id: number) {
    return this.lifecycleService.getBatch(id);
  }

  @Post('batches')
  @RequirePermission(PERMISSIONS.BATCH_CREATE)
  @OperationLogMeta('batch', 'create')
  @ApiOperation({ summary: '创建批次' })
  createBatch(@Body() dto: CreateBatchDto) {
    return this.lifecycleService.createBatch(dto);
  }

  @Put('batches/:id')
  @RequirePermission(PERMISSIONS.BATCH_UPDATE)
  @OperationLogMeta('batch', 'update')
  @ApiOperation({ summary: '更新批次' })
  updateBatch(@Param('id') id: number, @Body() dto: UpdateBatchDto) {
    return this.lifecycleService.updateBatch(id, dto);
  }

  // ====== Quality Records ======

  @Get('quality-records')
  @RequirePermission(PERMISSIONS.QUALITY_VIEW)
  @ApiOperation({ summary: '质量记录列表' })
  listQualityRecords(@Query() query: QueryQualityRecordDto) {
    return this.lifecycleService.listQualityRecords(query);
  }

  @Get('quality-records/:id')
  @RequirePermission(PERMISSIONS.QUALITY_VIEW)
  @ApiOperation({ summary: '质量记录详情' })
  getQualityRecord(@Param('id') id: number) {
    return this.lifecycleService.getQualityRecord(id);
  }

  @Post('quality-records')
  @RequirePermission(PERMISSIONS.QUALITY_CREATE)
  @OperationLogMeta('quality', 'create')
  @ApiOperation({ summary: '创建质量记录' })
  createQualityRecord(@Body() dto: CreateQualityRecordDto) {
    return this.lifecycleService.createQualityRecord(dto);
  }
}
