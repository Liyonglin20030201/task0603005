import request from './request';

export const authApi = {
  login: (data: { username: string; password: string }) => request.post('/auth/login', data),
  getProfile: () => request.get('/auth/profile'),
  refreshToken: (refreshToken: string) => request.post('/auth/refresh', { refreshToken }),
};

export const adminApi = {
  list: (params: any) => request.get('/admins', { params }),
  detail: (id: number) => request.get(`/admins/${id}`),
  create: (data: any) => request.post('/admins', data),
  update: (id: number, data: any) => request.put(`/admins/${id}`, data),
  delete: (id: number) => request.delete(`/admins/${id}`),
};

export const roleApi = {
  list: (params: any) => request.get('/roles', { params }),
  detail: (id: number) => request.get(`/roles/${id}`),
  create: (data: any) => request.post('/roles', data),
  update: (id: number, data: any) => request.put(`/roles/${id}`, data),
  delete: (id: number) => request.delete(`/roles/${id}`),
};

export const productApi = {
  list: (params: any) => request.get('/products', { params }),
  detail: (id: number) => request.get(`/products/${id}`),
  create: (data: any) => request.post('/products', data),
  update: (id: number, data: any) => request.put(`/products/${id}`, data),
  delete: (id: number) => request.delete(`/products/${id}`),
};

export const categoryApi = {
  list: (params?: any) => request.get('/categories', { params }),
  tree: () => request.get('/categories', { params: { tree: true } }),
  detail: (id: number) => request.get(`/categories/${id}`),
  create: (data: any) => request.post('/categories', data),
  update: (id: number, data: any) => request.put(`/categories/${id}`, data),
  delete: (id: number) => request.delete(`/categories/${id}`),
};

export const inventoryApi = {
  list: (params: any) => request.get('/inventory', { params }),
  detail: (productId: number) => request.get(`/inventory/${productId}`),
  adjust: (data: any) => request.put('/inventory/adjust', data),
  updateWarning: (productId: number, threshold: number) =>
    request.put(`/inventory/${productId}/warning`, { threshold }),
  logs: (productId: number, params?: any) =>
    request.get(`/inventory/${productId}/logs`, { params }),
};

export const orderApi = {
  list: (params: any) => request.get('/orders', { params }),
  detail: (id: number) => request.get(`/orders/${id}`),
  create: (data: any) => request.post('/orders', data),
  updateStatus: (id: number, data: { status: string; reason?: string }) =>
    request.put(`/orders/${id}/status`, data),
  getTransitions: (id: number) => request.get(`/orders/${id}/transitions`),
};

export const userApi = {
  list: (params: any) => request.get('/users', { params }),
  detail: (id: number) => request.get(`/users/${id}`),
  create: (data: any) => request.post('/users', data),
  update: (id: number, data: any) => request.put(`/users/${id}`, data),
  delete: (id: number) => request.delete(`/users/${id}`),
};

export const couponApi = {
  list: (params: any) => request.get('/coupons', { params }),
  detail: (id: number) => request.get(`/coupons/${id}`),
  create: (data: any) => request.post('/coupons', data),
  update: (id: number, data: any) => request.put(`/coupons/${id}`, data),
  delete: (id: number) => request.delete(`/coupons/${id}`),
  distribute: (data: { couponId: number; userIds: number[] }) =>
    request.post('/coupons/distribute', data),
  getUserCoupons: (userId: number) => request.get(`/coupons/user/${userId}`),
};

export const reportApi = {
  dashboard: () => request.get('/reports/dashboard'),
  sales: (startDate: string, endDate: string) =>
    request.get('/reports/sales', { params: { startDate, endDate } }),
  orderStatus: () => request.get('/reports/order-status'),
  topProducts: (limit?: number) => request.get('/reports/top-products', { params: { limit } }),
  inventory: () => request.get('/reports/inventory'),
};

export const logApi = {
  list: (params: any) => request.get('/logs', { params }),
};

export const importExportApi = {
  exportProducts: () => request.get('/import-export/products/export', { responseType: 'blob' }),
  importProducts: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/import-export/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportOrders: (status?: string) =>
    request.get('/import-export/orders/export', { params: { status }, responseType: 'blob' }),
  exportUsers: () => request.get('/import-export/users/export', { responseType: 'blob' }),
};

export const notificationApi = {
  list: (params: any) => request.get('/notifications', { params }),
  unreadCount: () => request.get('/notifications/unread-count'),
  markRead: (ids: number[]) => request.put('/notifications/mark-read', { ids }),
  markAllRead: () => request.put('/notifications/mark-all-read'),
  create: (data: any) => request.post('/notifications', data),
  delete: (id: number) => request.delete(`/notifications/${id}`),
};

export const shipmentApi = {
  list: (params: any) => request.get('/shipments', { params }),
  detail: (id: number) => request.get(`/shipments/${id}`),
  byOrder: (orderId: number) => request.get(`/shipments/order/${orderId}`),
  create: (data: any) => request.post('/shipments', data),
  updateTracking: (id: number, data: any) => request.put(`/shipments/${id}/tracking`, data),
};

export const forecastApi = {
  list: (params: any) => request.get('/forecast', { params }),
  detail: (productId: number, params?: any) => request.get(`/forecast/${productId}`, { params }),
  summary: (leadTime?: number) => request.get('/forecast/summary', { params: { leadTime } }),
};

export const campaignApi = {
  list: (params: any) => request.get('/campaigns', { params }),
  detail: (id: number) => request.get(`/campaigns/${id}`),
  create: (data: any) => request.post('/campaigns', data),
  update: (id: number, data: any) => request.put(`/campaigns/${id}`, data),
  delete: (id: number) => request.delete(`/campaigns/${id}`),
  addProducts: (id: number, data: any) => request.post(`/campaigns/${id}/products`, data),
  removeProduct: (id: number, productId: number) => request.delete(`/campaigns/${id}/products/${productId}`),
  activate: (id: number) => request.put(`/campaigns/${id}/activate`),
  pause: (id: number) => request.put(`/campaigns/${id}/pause`),
  end: (id: number) => request.put(`/campaigns/${id}/end`),
};

export const lifecycleApi = {
  list: (params: any) => request.get('/lifecycles', { params }),
  detail: (productId: number) => request.get(`/lifecycles/${productId}`),
  transition: (productId: number, data: { stage: string; remark?: string }) =>
    request.put(`/lifecycles/${productId}/transition`, data),
};

export const batchApi = {
  list: (params: any) => request.get('/batches', { params }),
  detail: (id: number) => request.get(`/batches/${id}`),
  create: (data: any) => request.post('/batches', data),
  update: (id: number, data: any) => request.put(`/batches/${id}`, data),
  trace: (traceCode: string) => request.get(`/batches/trace/${traceCode}`),
};

export const qualityApi = {
  list: (params: any) => request.get('/quality-records', { params }),
  detail: (id: number) => request.get(`/quality-records/${id}`),
  create: (data: any) => request.post('/quality-records', data),
};

export const channelApi = {
  list: (params?: any) => request.get('/channels', { params }),
  detail: (id: number) => request.get(`/channels/${id}`),
  create: (data: any) => request.post('/channels', data),
  update: (id: number, data: any) => request.put(`/channels/${id}`, data),
  delete: (id: number) => request.delete(`/channels/${id}`),
  sync: (id: number) => request.post(`/channels/${id}/sync`),
  syncAll: () => request.post('/channels/sync-all'),
};

export const channelOrderApi = {
  list: (params: any) => request.get('/channel-orders', { params }),
  match: (id: number) => request.post(`/channel-orders/${id}/match`),
};

export const reconciliationApi = {
  list: (params: any) => request.get('/reconciliations', { params }),
  detail: (id: number) => request.get(`/reconciliations/${id}`),
  create: (data: any) => request.post('/reconciliations', data),
  execute: (id: number) => request.post(`/reconciliations/${id}/execute`),
  resolveDetail: (detailId: number, data: any) => request.put(`/reconciliations/details/${detailId}/resolve`, data),
  dashboard: () => request.get('/reconciliations/dashboard'),
};

export const settlementApi = {
  list: (params: any) => request.get('/settlements', { params }),
  detail: (id: number) => request.get(`/settlements/${id}`),
  create: (data: any) => request.post('/settlements', data),
  update: (id: number, data: any) => request.put(`/settlements/${id}`, data),
};

export const feeRuleApi = {
  list: (params?: any) => request.get('/fee-rules', { params }),
  create: (data: any) => request.post('/fee-rules', data),
  update: (id: number, data: any) => request.put(`/fee-rules/${id}`, data),
};

export const abTestApi = {
  list: (params: any) => request.get('/ab-tests', { params }),
  detail: (id: number) => request.get(`/ab-tests/${id}`),
  create: (data: any) => request.post('/ab-tests', data),
  update: (id: number, data: any) => request.put(`/ab-tests/${id}`, data),
  delete: (id: number) => request.delete(`/ab-tests/${id}`),
  start: (id: number) => request.post(`/ab-tests/${id}/start`),
  pause: (id: number) => request.post(`/ab-tests/${id}/pause`),
  complete: (id: number) => request.post(`/ab-tests/${id}/complete`),
  archive: (id: number) => request.post(`/ab-tests/${id}/archive`),
  recordEvent: (data: any) => request.post('/ab-tests/events', data),
  report: (id: number) => request.get(`/ab-tests/${id}/report`),
  dashboard: () => request.get('/ab-tests/dashboard/summary'),
};
