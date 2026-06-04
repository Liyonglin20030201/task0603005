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
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [RoleCode.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [RoleCode.ADMIN]: Object.values(PERMISSIONS).filter(
    (p) => !p.startsWith('admin:') && !p.startsWith('role:'),
  ),
  [RoleCode.OPERATOR]: Object.values(PERMISSIONS).filter((p) =>
    ['product:', 'category:', 'inventory:', 'order:', 'coupon:', 'import_export:'].some((prefix) =>
      p.startsWith(prefix),
    ),
  ),
  [RoleCode.VIEWER]: Object.values(PERMISSIONS).filter((p) => p.endsWith(':view')),
};
