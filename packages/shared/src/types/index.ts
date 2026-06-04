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
  batchId?: number | null;
  batchNo?: string;
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

export interface ShipmentEvent {
  status: string;
  location: string;
  time: string;
  description?: string;
  operatorId?: number | null;
}

export interface ShipmentInfo {
  id: number;
  orderId: number;
  orderNo?: string;
  trackingNo: string;
  carrier: string;
  status: string;
  estimatedDelivery: string | null;
  statusHistory: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignInfo {
  id: number;
  name: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  rules: object;
  budget: number;
  usedBudget: number;
  description: string;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignProductInfo {
  id: number;
  campaignId: number;
  productId: number;
  productName?: string;
  campaignPrice: number;
  stock: number;
  soldCount: number;
}

export interface NotificationInfo {
  id: number;
  type: string;
  title: string;
  content: string;
  level: string;
  recipientId: number | null;
  recipientRole: string | null;
  isRead: boolean;
  metadata: object | null;
  createdAt: string;
}

export interface ForecastInfo {
  productId: number;
  productName: string;
  productSku: string;
  currentStock: number;
  avgDailySales7: number;
  avgDailySales14: number;
  avgDailySales30: number;
  predictedDemand: number;
  daysOfStockLeft: number;
  recommendedReorder: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface ProductLifecycleInfo {
  id: number;
  productId: number;
  productName?: string;
  productSku?: string;
  currentStage: string;
  stageHistory: { stage: string; enteredAt: string; operatorId: number; remark?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductBatchInfo {
  id: number;
  productId: number;
  productName?: string;
  batchNo: string;
  quantity: number;
  remainingQuantity: number;
  costPrice: number;
  supplier: string;
  productionDate: string;
  expirationDate: string | null;
  status: string;
  qualityScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface QualityRecordInfo {
  id: number;
  productId: number;
  productName?: string;
  batchId: number | null;
  batchNo?: string;
  checkType: string;
  result: string;
  score: number;
  inspector: string;
  checkItems: { item: string; standard: string; actual: string; passed: boolean }[];
  remark: string;
  attachments: string[];
  checkedAt: string;
  createdAt: string;
}

export interface ReconciliationInfo {
  id: number;
  platform: string;
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  matchedOrders: number;
  discrepancyOrders: number;
  platformAmount: number;
  localAmount: number;
  differenceAmount: number;
  status: string;
  reconciledAt: string | null;
  operatorId: number | null;
  operatorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationDetailInfo {
  id: number;
  reconciliationId: number;
  platformOrderNo: string;
  localOrderNo: string | null;
  platformAmount: number;
  localAmount: number;
  differenceAmount: number;
  differenceReason: string | null;
  status: string;
  resolvedAt: string | null;
  remark: string | null;
  operatorId?: number | null;
  operatorName?: string | null;
}

export interface SettlementInfo {
  id: number;
  platform: string;
  settlementNo: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  totalFees: number;
  netAmount: number;
  orderCount: number;
  refundCount: number;
  refundAmount: number;
  feeBreakdown: { type: string; amount: number; rate?: number }[];
  status: string;
  settledAt: string | null;
  bankAccount: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeeRuleInfo {
  id: number;
  platform: string;
  feeType: string;
  rate: number;
  fixedAmount: number;
  minAmount: number;
  maxAmount: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: number;
  createdAt: string;
}

export interface ChannelInfo {
  id: number;
  name: string;
  platform: string;
  appKey: string;
  status: number;
  syncEnabled: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelOrderInfo {
  id: number;
  channelId: number;
  channelName?: string;
  platform: string;
  platformOrderNo: string;
  localOrderId: number | null;
  localOrderNo: string | null;
  buyerNickname: string;
  totalAmount: number;
  payAmount: number;
  itemCount: number;
  platformStatus: string;
  syncStatus: string;
  syncedAt: string | null;
  failReason: string | null;
  platformCreatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestInfo {
  id: number;
  name: string;
  type: string;
  status: string;
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  startDate: string | null;
  endDate: string | null;
  targetSampleSize: number;
  currentSampleSize: number;
  confidenceLevel: number;
  variants: ABTestVariantInfo[];
  winnerVariantId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariantInfo {
  id: number;
  testId: number;
  name: string;
  description: string;
  trafficPercent: number;
  isControl: boolean;
  config: object;
  impressions: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  confidenceInterval: { lower: number; upper: number } | null;
}

export interface ABTestEventInfo {
  id: number;
  testId: number;
  variantId: number;
  eventType: string;
  userId: string;
  sessionId: string;
  value: number | null;
  metadata: object | null;
  createdAt: string;
}

export interface ABTestReportInfo {
  testId: number;
  testName: string;
  status: string;
  duration: number;
  totalSampleSize: number;
  variants: {
    id: number;
    name: string;
    isControl: boolean;
    impressions: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    avgOrderValue: number;
    improvement: number;
    pValue: number;
    isSignificant: boolean;
    confidenceInterval: { lower: number; upper: number };
  }[];
  recommendation: string;
  dailyData: { date: string; variantId: number; variantName: string; impressions: number; conversions: number; conversionRate: number }[];
}
