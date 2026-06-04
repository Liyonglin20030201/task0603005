import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from './notification.service';
import {
  NOTIFICATION_EVENTS,
  InventoryLowStockEvent,
  OrderStatusChangedEvent,
  CampaignStatusChangedEvent,
} from './notification.events';

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(NOTIFICATION_EVENTS.INVENTORY_LOW_STOCK, { async: true })
  async handleInventoryLowStock(event: InventoryLowStockEvent) {
    await this.notificationService.create({
      type: 'inventory_warning',
      title: '库存预警',
      content: `商品「${event.productName}」库存不足，当前库存${event.quantity}，预警阈值${event.warningThreshold}`,
      level: 'warning',
      recipientRole: 'operator',
      metadata: { productId: event.productId },
    });
  }

  @OnEvent(NOTIFICATION_EVENTS.ORDER_STATUS_CHANGED, { async: true })
  async handleOrderStatusChanged(event: OrderStatusChangedEvent) {
    await this.notificationService.create({
      type: 'order',
      title: '订单状态变更',
      content: `订单 ${event.orderNo} 状态已从「${event.oldStatus}」变更为「${event.newStatus}」`,
      level: 'info',
      recipientRole: 'operator',
      metadata: { orderId: event.orderId },
    });
  }

  @OnEvent(NOTIFICATION_EVENTS.CAMPAIGN_STATUS_CHANGED, { async: true })
  async handleCampaignStatusChanged(event: CampaignStatusChangedEvent) {
    await this.notificationService.create({
      type: 'campaign',
      title: '活动状态变更',
      content: `营销活动「${event.campaignName}」状态已变更为「${event.status}」`,
      level: 'info',
      recipientRole: 'admin',
      metadata: { campaignId: event.campaignId },
    });
  }
}
