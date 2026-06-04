export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: AdminInfo;
}

export interface AdminInfo {
  id: number;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  role: RoleInfo;
}

export interface RoleInfo {
  id: number;
  name: string;
  code: string;
  permissions: string[];
}

export interface ProductInfo {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  categoryName?: string;
  price: number;
  costPrice: number;
  description: string;
  images: string[];
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryInfo {
  id: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  lockedQuantity: number;
  availableQuantity?: number;
  warningThreshold: number;
  version: number;
  updatedAt: string;
}

export interface OrderInfo {
  id: number;
  orderNo: string;
  userId: number;
  userName?: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  payAmount: number;
  couponId: number | null;
  address: object;
  remark: string;
  items?: OrderItemInfo[];
  paidAt: string | null;
  shippedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemInfo {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CategoryInfo {
  id: number;
  name: string;
  parentId: number;
  sort: number;
  icon: string;
  status: number;
  children?: CategoryInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponInfo {
  id: number;
  name: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  totalCount: number;
  usedCount: number;
  startTime: string;
  endTime: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface OperationLogInfo {
  id: number;
  adminId: number;
  adminName?: string;
  module: string;
  action: string;
  targetId: number | null;
  detail: object;
  ip: string;
  userAgent: string;
  createdAt: string;
}
