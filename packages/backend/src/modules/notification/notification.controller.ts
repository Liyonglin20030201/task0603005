import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { PERMISSIONS } from '@ecommerce/shared';

@ApiTags('通知管理')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @RequirePermission(PERMISSIONS.NOTIFICATION_VIEW)
  @ApiOperation({ summary: '获取通知列表' })
  findAll(@CurrentAdmin('id') adminId: number, @Query() query: QueryNotificationDto) {
    return this.notificationService.findAll(adminId, query);
  }

  @Get('unread-count')
  @RequirePermission(PERMISSIONS.NOTIFICATION_VIEW)
  @ApiOperation({ summary: '获取未读数量' })
  getUnreadCount(@CurrentAdmin('id') adminId: number) {
    return this.notificationService.getUnreadCount(adminId);
  }

  @Put('mark-read')
  @RequirePermission(PERMISSIONS.NOTIFICATION_VIEW)
  @ApiOperation({ summary: '标记已读' })
  markRead(@CurrentAdmin('id') adminId: number, @Body() dto: MarkReadDto) {
    return this.notificationService.markRead(adminId, dto);
  }

  @Put('mark-all-read')
  @RequirePermission(PERMISSIONS.NOTIFICATION_VIEW)
  @ApiOperation({ summary: '标记全部已读' })
  markAllRead(@CurrentAdmin('id') adminId: number) {
    return this.notificationService.markAllRead(adminId);
  }

  @Post()
  @RequirePermission(PERMISSIONS.NOTIFICATION_MANAGE)
  @ApiOperation({ summary: '创建通知' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.NOTIFICATION_MANAGE)
  @ApiOperation({ summary: '删除通知' })
  remove(@Param('id') id: number) {
    return this.notificationService.remove(id);
  }
}
