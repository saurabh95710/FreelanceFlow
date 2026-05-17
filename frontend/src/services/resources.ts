import { api } from './api';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; businessName?: string }) =>
    api.post('/auth/register', data).then(r => r.data.data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data).then(r => r.data.data),
  me: () => api.get('/auth/me').then(r => r.data.data),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then(r => r.data.data),
};

// ─── Clients ─────────────────────────────────────────────────────────────────
export const clientsApi = {
  list: () => api.get('/clients').then(r => r.data.data),
  get: (id: string) => api.get(`/clients/${id}`).then(r => r.data.data),
  create: (data: unknown) => api.post('/clients', data).then(r => r.data.data),
  update: (id: string, data: unknown) => api.put(`/clients/${id}`, data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

// ─── Invoices ────────────────────────────────────────────────────────────────
export const invoicesApi = {
  list: (status?: string) =>
    api.get('/invoices', { params: status ? { status } : {} }).then(r => r.data.data),
  get: (id: string) => api.get(`/invoices/${id}`).then(r => r.data.data),
  create: (data: unknown) => api.post('/invoices', data).then(r => r.data.data),
  update: (id: string, data: unknown) => api.put(`/invoices/${id}`, data).then(r => r.data.data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/invoices/${id}/status`, { status }).then(r => r.data.data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentsApi = {
  list: () => api.get('/payments').then(r => r.data.data),
  create: (data: unknown) => api.post('/payments', data).then(r => r.data.data),
  delete: (id: string) => api.delete(`/payments/${id}`),
};

// ─── User ────────────────────────────────────────────────────────────────────
export const userApi = {
  updateProfile: (data: unknown) => api.put('/users/profile', data).then(r => r.data.data),
};