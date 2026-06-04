import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('订单管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @RequirePermission(PERMISSIONS.ORDER_UPDATE)
  @OperationLogMeta('order', 'create')
  @ApiOperation({ summary: '创建订单（模拟下单）' })
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  @RequirePermission(PERMISSIONS.ORDER_VIEW)
  @ApiOperation({ summary: '订单列表' })
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.ORDER_VIEW)
  @ApiOperation({ summary: '订单详情' })
  findOne(@Param('id') id: number) {
    return this.orderService.findOne(id);
  }

  @Put(':id/status')
  @RequirePermission(PERMISSIONS.ORDER_UPDATE)
  @OperationLogMeta('order', 'updateStatus')
  @ApiOperation({ summary: '更新订单状态' })
  updateStatus(@Param('id') id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, dto);
  }

  @Get(':id/transitions')
  @RequirePermission(PERMISSIONS.ORDER_VIEW)
  @ApiOperation({ summary: '获取订单可用状态转换' })
  getTransitions(@Param('id') id: number) {
    return this.orderService.getStatusTransitions(id);
  }
}
