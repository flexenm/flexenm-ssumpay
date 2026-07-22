import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100'

export const api = axios.create({ baseURL: BASE_URL })
export const adminApi = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const handle = (promise) => promise.then((r) => r.data).catch((e) => { throw e.response?.data || e })

// Auth
export const authApi = {
  checkUsername: (username) => handle(api.get('/api/auth/check-username', { params: { username } })),
  register: (data) => handle(api.post('/api/auth/register', data)),
  login: (data) => handle(api.post('/api/auth/login', data)),
  resetPassword: (data) => handle(api.post('/api/auth/password/reset', data)),
  confirmResetPassword: (data) => handle(api.post('/api/auth/password/reset/confirm', data)),
}

// Products
export const productsApi = {
  list: (params) => handle(api.get('/api/products', { params })),
  get: (id) => handle(api.get(`/api/products/${id}`)),
}

// Orders
export const ordersApi = {
  create: (data) => handle(api.post('/api/orders', data)),
  my: (params) => handle(api.get('/api/orders/my', { params })),
  get: (orderNo) => handle(api.get(`/api/orders/${orderNo}`)),
}

// Mypage
export const mypageApi = {
  get: () => handle(api.get('/api/mypage')),
  update: (data) => handle(api.patch('/api/mypage', data)),
  changePassword: (data) => handle(api.patch('/api/mypage/password', data)),
}

// Notices
export const noticesApi = {
  list: (params) => handle(api.get('/api/notices', { params })),
  get: (id) => handle(api.get(`/api/notices/${id}`)),
}

// Inquiries
export const inquiriesApi = {
  list: (params) => handle(api.get('/api/inquiries', { params })),
  get: (id) => handle(api.get(`/api/inquiries/${id}`)),
  create: (data) => handle(api.post('/api/inquiries', data)),
  update: (id, data) => handle(api.put(`/api/inquiries/${id}`, data)),
  delete: (id) => handle(api.delete(`/api/inquiries/${id}`)),
}

// Admin
export const adminAuthApi = {
  login: (data) => handle(adminApi.post('/admin/auth/login', data)),
}

export const adminDashboardApi = {
  get: () => handle(adminApi.get('/admin/dashboard')),
}

export const adminOrdersApi = {
  list: (params) => handle(adminApi.get('/admin/orders', { params })),
  get: (id) => handle(adminApi.get(`/admin/orders/${id}`)),
  updateChargeStatus: (id, data) => handle(adminApi.patch(`/admin/orders/${id}/charge-status`, data)),
  updateMemo: (id, data) => handle(adminApi.patch(`/admin/orders/${id}/memo`, data)),
}

export const adminProductsApi = {
  list: (params) => handle(adminApi.get('/admin/products', { params })),
  create: (data) => handle(adminApi.post('/admin/products', data)),
  update: (id, data) => handle(adminApi.put(`/admin/products/${id}`, data)),
  delete: (id) => handle(adminApi.delete(`/admin/products/${id}`)),
}

export const adminMembersApi = {
  list: (params) => handle(adminApi.get('/admin/members', { params })),
  get: (id) => handle(adminApi.get(`/admin/members/${id}`)),
  updateStatus: (id, data) => handle(adminApi.patch(`/admin/members/${id}/status`, data)),
}

export const adminNoticesApi = {
  list: (params) => handle(adminApi.get('/admin/notices', { params })),
  get: (id) => handle(adminApi.get(`/admin/notices/${id}`)),
  create: (data) => handle(adminApi.post('/admin/notices', data)),
  update: (id, data) => handle(adminApi.put(`/admin/notices/${id}`, data)),
  delete: (id) => handle(adminApi.delete(`/admin/notices/${id}`)),
}

export const adminInquiriesApi = {
  list: (params) => handle(adminApi.get('/admin/inquiries', { params })),
  get: (id) => handle(adminApi.get(`/admin/inquiries/${id}`)),
  answer: (id, data) => handle(adminApi.post(`/admin/inquiries/${id}/answer`, data)),
}
