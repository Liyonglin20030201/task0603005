import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { QueryChannelOrderDto } from './dto/query-channel-order.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { OperationLogMeta } from '../../common/decorators/operation-log.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('渠道管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller()
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get('channels')
  @RequirePermission(PERMISSIONS.CHANNEL_VIEW)
  @ApiOperation({ summary: '渠道列表' })
  listChannels() {
    return this.channelService.listChannels();
  }

  @Get('channels/:id')
  @RequirePermission(PERMISSIONS.CHANNEL_VIEW)
  @ApiOperation({ summary: '渠道详情' })
  getChannel(@Param('id') id: number) {
    return this.channelService.getChannel(id);
  }

  @Post('channels')
  @RequirePermission(PERMISSIONS.CHANNEL_CREATE)
  @OperationLogMeta('channel', 'create')
  @ApiOperation({ summary: '创建渠道' })
  createChannel(@Body() dto: CreateChannelDto) {
    return this.channelService.createChannel(dto);
  }

  @Put('channels/:id')
  @RequirePermission(PERMISSIONS.CHANNEL_UPDATE)
  @OperationLogMeta('channel', 'update')
  @ApiOperation({ summary: '更新渠道' })
  updateChannel(@Param('id') id: number, @Body() dto: UpdateChannelDto) {
    return this.channelService.updateChannel(id, dto);
  }

  @Delete('channels/:id')
  @RequirePermission(PERMISSIONS.CHANNEL_DELETE)
  @OperationLogMeta('channel', 'delete')
  @ApiOperation({ summary: '删除渠道' })
  deleteChannel(@Param('id') id: number) {
    return this.channelService.deleteChannel(id);
  }

  @Post('channels/:id/sync')
  @RequirePermission(PERMISSIONS.CHANNEL_ORDER_SYNC)
  @OperationLogMeta('channel', 'sync')
  @ApiOperation({ summary: '同步渠道订单' })
  syncOrders(@Param('id') id: number) {
    return this.channelService.syncOrders(id);
  }

  @Post('channels/sync-all')
  @RequirePermission(PERMISSIONS.CHANNEL_ORDER_SYNC)
  @OperationLogMeta('channel', 'batchSync')
  @ApiOperation({ summary: '批量同步所有渠道' })
  batchSync() {
    return this.channelService.batchSync();
  }

  @Get('channel-orders')
  @RequirePermission(PERMISSIONS.CHANNEL_ORDER_VIEW)
  @ApiOperation({ summary: '渠道订单列表' })
  listChannelOrders(@Query() query: QueryChannelOrderDto) {
    return this.channelService.listChannelOrders(query);
  }

  @Post('channel-orders/:id/match')
  @RequirePermission(PERMISSIONS.CHANNEL_ORDER_SYNC)
  @OperationLogMeta('channel_order', 'match')
  @ApiOperation({ summary: '匹配本地订单' })
  matchOrder(@Param('id') id: number) {
    return this.channelService.matchOrder(id);
  }
}
