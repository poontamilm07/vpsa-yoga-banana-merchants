import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const vendorApi = {
  getAll: (search) => api.get('/vendors', { params: { search } }),
  getById: (id) => api.get(`/vendors/${id}`),
  getLedger: (id) => api.get(`/vendors/${id}/ledger`),
  getRepeatTemplate: (id) => api.get(`/vendors/${id}/last-purchase-template`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  toggleFavorite: (id) => api.post(`/vendors/${id}/favorite`),
};

export const purchaseApi = {
  create: (data) => api.post('/purchases', data),
  getAll: (params) => api.get('/purchases', { params }),
};

export const paymentApi = {
  create: (data) => api.post('/supplier-payments', data),
  getAll: (params) => api.get('/supplier-payments', { params }),
};

export const transactionApi = {
  getAll: (params) => api.get('/transactions', { params }),
};

export const reportApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getDaily: (date) => api.get('/reports/daily', { params: { date } }),
  getMonthly: (year, month) => api.get('/reports/monthly', { params: { year, month } }),
};

export default api;
