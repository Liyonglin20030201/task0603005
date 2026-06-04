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
