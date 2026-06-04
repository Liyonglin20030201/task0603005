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

  RECONCILIATION_VIEW: 'reconciliation:view',
  RECONCILIATION_CREATE: 'reconciliation:create',
  RECONCILIATION_UPDATE: 'reconciliation:update',
  SETTLEMENT_VIEW: 'settlement:view',
  SETTLEMENT_UPDATE: 'settlement:update',
  FEE_RULE_VIEW: 'fee_rule:view',
  FEE_RULE_UPDATE: 'fee_rule:update',

  LIFECYCLE_VIEW: 'lifecycle:view',
  LIFECYCLE_UPDATE: 'lifecycle:update',
  BATCH_VIEW: 'batch:view',
  BATCH_CREATE: 'batch:create',
  BATCH_UPDATE: 'batch:update',
  QUALITY_VIEW: 'quality:view',
  QUALITY_CREATE: 'quality:create',

  CHANNEL_VIEW: 'channel:view',
  CHANNEL_CREATE: 'channel:create',
  CHANNEL_UPDATE: 'channel:update',
  CHANNEL_DELETE: 'channel:delete',
  CHANNEL_ORDER_VIEW: 'channel_order:view',
  CHANNEL_ORDER_SYNC: 'channel_order:sync',

  ABTEST_VIEW: 'abtest:view',
  ABTEST_CREATE: 'abtest:create',
  ABTEST_UPDATE: 'abtest:update',
  ABTEST_DELETE: 'abtest:delete',
} as const;

export enum ABTestStatus {
  DRAFT = 'draft',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export const AB_TEST_STATUS_LABEL: Record<ABTestStatus, string> = {
  [ABTestStatus.DRAFT]: '草稿',
  [ABTestStatus.RUNNING]: '运行中',
  [ABTestStatus.PAUSED]: '已暂停',
  [ABTestStatus.COMPLETED]: '已完成',
  [ABTestStatus.ARCHIVED]: '已归档',
};

export enum ABTestMetricType {
  CONVERSION_RATE = 'conversion_rate',
  CLICK_RATE = 'click_rate',
  REVENUE = 'revenue',
  AOV = 'aov',
  BOUNCE_RATE = 'bounce_rate',
  ENGAGEMENT = 'engagement',
}

export const AB_TEST_METRIC_LABEL: Record<ABTestMetricType, string> = {
  [ABTestMetricType.CONVERSION_RATE]: '转化率',
  [ABTestMetricType.CLICK_RATE]: '点击率',
  [ABTestMetricType.REVENUE]: '收入',
  [ABTestMetricType.AOV]: '客单价',
  [ABTestMetricType.BOUNCE_RATE]: '跳出率',
  [ABTestMetricType.ENGAGEMENT]: '参与度',
};

export enum ABTestType {
  PRICE = 'price',
  PAGE_LAYOUT = 'page_layout',
  PROMOTION = 'promotion',
  COPY = 'copy',
  IMAGE = 'image',
  RECOMMENDATION = 'recommendation',
}

export const AB_TEST_TYPE_LABEL: Record<ABTestType, string> = {
  [ABTestType.PRICE]: '价格测试',
  [ABTestType.PAGE_LAYOUT]: '页面布局',
  [ABTestType.PROMOTION]: '促销策略',
  [ABTestType.COPY]: '文案测试',
  [ABTestType.IMAGE]: '图片测试',
  [ABTestType.RECOMMENDATION]: '推荐算法',
};

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

export enum ProductLifecycleStage {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  PRE_SALE = 'pre_sale',
  ON_SALE = 'on_sale',
  PROMOTION = 'promotion',
  CLEARANCE = 'clearance',
  DISCONTINUED = 'discontinued',
}

export const PRODUCT_LIFECYCLE_STAGE_LABEL: Record<ProductLifecycleStage, string> = {
  [ProductLifecycleStage.DEVELOPMENT]: '开发中',
  [ProductLifecycleStage.TESTING]: '测试中',
  [ProductLifecycleStage.PRE_SALE]: '预售',
  [ProductLifecycleStage.ON_SALE]: '在售',
  [ProductLifecycleStage.PROMOTION]: '促销中',
  [ProductLifecycleStage.CLEARANCE]: '清仓',
  [ProductLifecycleStage.DISCONTINUED]: '已停产',
};

export const PRODUCT_LIFECYCLE_TRANSITIONS: Record<ProductLifecycleStage, ProductLifecycleStage[]> = {
  [ProductLifecycleStage.DEVELOPMENT]: [ProductLifecycleStage.TESTING, ProductLifecycleStage.DISCONTINUED],
  [ProductLifecycleStage.TESTING]: [ProductLifecycleStage.PRE_SALE, ProductLifecycleStage.ON_SALE, ProductLifecycleStage.DEVELOPMENT],
  [ProductLifecycleStage.PRE_SALE]: [ProductLifecycleStage.ON_SALE, ProductLifecycleStage.DISCONTINUED],
  [ProductLifecycleStage.ON_SALE]: [ProductLifecycleStage.PROMOTION, ProductLifecycleStage.CLEARANCE, ProductLifecycleStage.DISCONTINUED],
  [ProductLifecycleStage.PROMOTION]: [ProductLifecycleStage.ON_SALE, ProductLifecycleStage.CLEARANCE],
  [ProductLifecycleStage.CLEARANCE]: [ProductLifecycleStage.DISCONTINUED],
  [ProductLifecycleStage.DISCONTINUED]: [],
};

export enum BatchStatus {
  ACTIVE = 'active',
  QUARANTINE = 'quarantine',
  RECALLED = 'recalled',
  EXPIRED = 'expired',
  DEPLETED = 'depleted',
}

export const BATCH_STATUS_LABEL: Record<BatchStatus, string> = {
  [BatchStatus.ACTIVE]: '正常',
  [BatchStatus.QUARANTINE]: '隔离',
  [BatchStatus.RECALLED]: '召回',
  [BatchStatus.EXPIRED]: '过期',
  [BatchStatus.DEPLETED]: '已耗尽',
};

export enum QualityCheckResult {
  PASSED = 'passed',
  FAILED = 'failed',
  CONDITIONAL = 'conditional',
}

export const QUALITY_CHECK_RESULT_LABEL: Record<QualityCheckResult, string> = {
  [QualityCheckResult.PASSED]: '合格',
  [QualityCheckResult.FAILED]: '不合格',
  [QualityCheckResult.CONDITIONAL]: '有条件放行',
};

export enum ReconciliationStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  DISCREPANCY = 'discrepancy',
  RESOLVED = 'resolved',
}

export const RECONCILIATION_STATUS_LABEL: Record<ReconciliationStatus, string> = {
  [ReconciliationStatus.PENDING]: '待对账',
  [ReconciliationStatus.MATCHED]: '已匹配',
  [ReconciliationStatus.DISCREPANCY]: '有差异',
  [ReconciliationStatus.RESOLVED]: '已处理',
};

export enum SettlementStatus {
  UNSETTLED = 'unsettled',
  SETTLING = 'settling',
  SETTLED = 'settled',
  DISPUTED = 'disputed',
}

export const SETTLEMENT_STATUS_LABEL: Record<SettlementStatus, string> = {
  [SettlementStatus.UNSETTLED]: '未结算',
  [SettlementStatus.SETTLING]: '结算中',
  [SettlementStatus.SETTLED]: '已结算',
  [SettlementStatus.DISPUTED]: '有争议',
};

export enum FeeType {
  PLATFORM_COMMISSION = 'platform_commission',
  PAYMENT_FEE = 'payment_fee',
  SHIPPING_FEE = 'shipping_fee',
  REFUND_FEE = 'refund_fee',
  PROMOTION_FEE = 'promotion_fee',
  SERVICE_FEE = 'service_fee',
}

export const FEE_TYPE_LABEL: Record<FeeType, string> = {
  [FeeType.PLATFORM_COMMISSION]: '平台佣金',
  [FeeType.PAYMENT_FEE]: '支付手续费',
  [FeeType.SHIPPING_FEE]: '运费',
  [FeeType.REFUND_FEE]: '退款手续费',
  [FeeType.PROMOTION_FEE]: '推广费',
  [FeeType.SERVICE_FEE]: '服务费',
};

export enum ChannelPlatform {
  TAOBAO = 'taobao',
  JD = 'jd',
  PDD = 'pdd',
  DOUYIN = 'douyin',
  WEIXIN = 'weixin',
  SELF = 'self',
}

export const CHANNEL_PLATFORM_LABEL: Record<ChannelPlatform, string> = {
  [ChannelPlatform.TAOBAO]: '淘宝/天猫',
  [ChannelPlatform.JD]: '京东',
  [ChannelPlatform.PDD]: '拼多多',
  [ChannelPlatform.DOUYIN]: '抖音',
  [ChannelPlatform.WEIXIN]: '微信小店',
  [ChannelPlatform.SELF]: '自营商城',
};

export enum ChannelOrderSyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
}

export const CHANNEL_ORDER_SYNC_STATUS_LABEL: Record<ChannelOrderSyncStatus, string> = {
  [ChannelOrderSyncStatus.PENDING]: '待同步',
  [ChannelOrderSyncStatus.SYNCED]: '已同步',
  [ChannelOrderSyncStatus.FAILED]: '同步失败',
};

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [RoleCode.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [RoleCode.ADMIN]: Object.values(PERMISSIONS).filter(
    (p) => !p.startsWith('admin:') && !p.startsWith('role:'),
  ),
  [RoleCode.OPERATOR]: Object.values(PERMISSIONS).filter((p) =>
    ['product:', 'category:', 'inventory:', 'order:', 'coupon:', 'import_export:', 'forecast:', 'shipment:', 'campaign:', 'notification:', 'lifecycle:', 'batch:', 'quality:', 'reconciliation:', 'settlement:', 'fee_rule:', 'channel:', 'channel_order:', 'abtest:'].some((prefix) =>
      p.startsWith(prefix),
    ),
  ),
  [RoleCode.VIEWER]: Object.values(PERMISSIONS).filter((p) => p.endsWith(':view')),
};
