export const NOTIFICATION_EVENTS = {
  INVENTORY_LOW_STOCK: 'notification.inventory.lowStock',
  ORDER_STATUS_CHANGED: 'notification.order.statusChanged',
  CAMPAIGN_STATUS_CHANGED: 'notification.campaign.statusChanged',
  RECONCILIATION_RESOLVED: 'notification.reconciliation.resolved',
};

export interface InventoryLowStockEvent {
  productId: number;
  productName: string;
  quantity: number;
  warningThreshold: number;
}

export interface OrderStatusChangedEvent {
  orderId: number;
  orderNo: string;
  oldStatus: string;
  newStatus: string;
}

export interface CampaignStatusChangedEvent {
  campaignId: number;
  campaignName: string;
  status: string;
}

export interface ReconciliationResolvedEvent {
  detailId: number;
  reconciliationId: number;
  platformOrderNo: string;
  operatorId: number;
  operatorName: string;
  remark: string | null;
}
