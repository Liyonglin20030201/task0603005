export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  SHIPPING = 'shipping',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING_PAYMENT]: '待付款',
  [OrderStatus.PAID]: '已付款',
  [OrderStatus.SHIPPING]: '备货中',
  [OrderStatus.SHIPPED]: '已发货',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.REFUNDED]: '已退款',
};

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPING, OrderStatus.REFUNDED],
  [OrderStatus.SHIPPING]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export enum InventoryChangeType {
  IN = 'in',
  OUT = 'out',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  ADJUST = 'adjust',
}

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum CouponStatus {
  UNUSED = 'unused',
  USED = 'used',
  EXPIRED = 'expired',
}

export enum RoleCode {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export const PERMISSIONS = {
  ADMIN_VIEW: 'admin:view',
  ADMIN_CREATE: 'admin:create',
  ADMIN_UPDATE: 'admin:update',
  ADMIN_DELETE: 'admin:delete',

  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  CATEGORY_VIEW: 'category:view',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_UPDATE: 'category:update',
  CATEGORY_DELETE: 'category:delete',

  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',

  ORDER_VIEW: 'order:view',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',

  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  COUPON_VIEW: 'coupon:view',
  COUPON_CREATE: 'coupon:create',
  COUPON_UPDATE: 'coupon:update',
  COUPON_DELETE: 'coupon:delete',

  REPORT_VIEW: 'report:view',

  LOG_VIEW: 'log:view',

  IMPORT_EXPORT: 'import_export:execute',

  FORECAST_VIEW: 'forecast:view',

  SHIPMENT_VIEW: 'shipment:view',
  SHIPMENT_CREATE: 'shipment:create',
  SHIPMENT_UPDATE: 'shipment:update',

  CAMPAIGN_VIEW: 'campaign:view',
  CAMPAIGN_CREATE: 'campaign:create',
  CAMPAIGN_UPDATE: 'campaign:update',
  CAMPAIGN_DELETE: 'campaign:delete',

  NOTIFICATION_VIEW: 'notification:view',
  NOTIFICATION_MANAGE: 'notification:manage',
} as const;

export enum ShipmentStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: '待揽收',
  [ShipmentStatus.PICKED_UP]: '已揽收',
  [ShipmentStatus.IN_TRANSIT]: '运输中',
  [ShipmentStatus.OUT_FOR_DELIVERY]: '派送中',
  [ShipmentStatus.DELIVERED]: '已签收',
  [ShipmentStatus.FAILED]: '签收失败',
};

export enum CampaignType {
  FLASH_SALE = 'flash_sale',
  BUNDLE = 'bundle',
  DISCOUNT = 'discount',
  FREE_SHIPPING = 'free_shipping',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

export const CAMPAIGN_TYPE_LABEL: Record<CampaignType, string> = {
  [CampaignType.FLASH_SALE]: '限时秒杀',
  [CampaignType.BUNDLE]: '组合优惠',
  [CampaignType.DISCOUNT]: '折扣促销',
  [CampaignType.FREE_SHIPPING]: '满额包邮',
};

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  [CampaignStatus.DRAFT]: '草稿',
  [CampaignStatus.ACTIVE]: '进行中',
  [CampaignStatus.PAUSED]: '已暂停',
  [CampaignStatus.ENDED]: '已结束',
};

export enum NotificationType {
  SYSTEM = 'system',
  INVENTORY_WARNING = 'inventory_warning',
  ORDER = 'order',
  CAMPAIGN = 'campaign',
}

export enum NotificationLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  [NotificationType.SYSTEM]: '系统通知',
  [NotificationType.INVENTORY_WARNING]: '库存预警',
  [NotificationType.ORDER]: '订单通知',
  [NotificationType.CAMPAIGN]: '活动通知',
};

export const NOTIFICATION_LEVEL_LABEL: Record<NotificationLevel, string> = {
  [NotificationLevel.INFO]: '信息',
  [NotificationLevel.WARNING]: '警告',
  [NotificationLevel.ERROR]: '错误',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [RoleCode.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [RoleCode.ADMIN]: Object.values(PERMISSIONS).filter(
    (p) => !p.startsWith('admin:') && !p.startsWith('role:'),
  ),
  [RoleCode.OPERATOR]: Object.values(PERMISSIONS).filter((p) =>
    ['product:', 'category:', 'inventory:', 'order:', 'coupon:', 'import_export:', 'forecast:', 'shipment:', 'campaign:', 'notification:'].some((prefix) =>
      p.startsWith(prefix),
    ),
  ),
  [RoleCode.VIEWER]: Object.values(PERMISSIONS).filter((p) => p.endsWith(':view')),
};
