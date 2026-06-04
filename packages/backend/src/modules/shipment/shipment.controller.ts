import { Controller, Get, Post, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ShipmentService } from './shipment.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('物流追踪')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('shipments')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Get()
  @RequirePermission(PERMISSIONS.SHIPMENT_VIEW)
  @ApiOperation({ summary: '物流列表' })
  findAll(@Query() query: QueryShipmentDto) {
    return this.shipmentService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.SHIPMENT_VIEW)
  @ApiOperation({ summary: '物流详情' })
  findOne(@Param('id') id: number) {
    return this.shipmentService.findOne(id);
  }

  @Get('order/:orderId')
  @RequirePermission(PERMISSIONS.SHIPMENT_VIEW)
  @ApiOperation({ summary: '根据订单ID查询物流' })
  findByOrderId(@Param('orderId') orderId: number) {
    return this.shipmentService.findByOrderId(orderId);
  }

  @Post()
  @RequirePermission(PERMISSIONS.SHIPMENT_CREATE)
  @OperationLogMeta('shipment', 'create')
  @ApiOperation({ summary: '创建物流' })
  create(@Body() dto: CreateShipmentDto) {
    return this.shipmentService.create(dto);
  }

  @Put(':id/tracking')
  @RequirePermission(PERMISSIONS.SHIPMENT_UPDATE)
  @OperationLogMeta('shipment', 'updateTracking')
  @ApiOperation({ summary: '更新物流状态' })
  updateTracking(@Param('id') id: number, @Body() dto: UpdateTrackingDto) {
    return this.shipmentService.updateTracking(id, dto);
  }
}
