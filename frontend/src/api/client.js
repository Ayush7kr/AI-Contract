/**
 * Axios API client with JWT auth interceptor.
 * All API calls go through this client which auto-attaches the token.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

// ─── Request Interceptor: attach JWT token ─────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lexisure_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: handle 401 ──────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lexisure_token');
      localStorage.removeItem('lexisure_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

// ─── Contracts API ───────────────────────────────────────────────────────────
export const contractsAPI = {
  upload: (formData, onProgress) =>
    apiClient.post('/contracts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  list: () => apiClient.get('/contracts/'),
  get: (id) => apiClient.get(`/contracts/${id}`),
  delete: (id) => apiClient.delete(`/contracts/${id}`),
};

// ─── Analysis API ────────────────────────────────────────────────────────────
export const analysisAPI = {
  analyze: (contractId) => apiClient.post(`/analysis/${contractId}/analyze`),
  compare: (id1, id2) => apiClient.post('/analysis/compare', { contract_id_1: id1, contract_id_2: id2 }),
};

// ─── AI API ─────────────────────────────────────────────────────────────────
export const aiAPI = {
  suggest: (data) => apiClient.post('/ai/suggest', data),
  negotiate: (data) => apiClient.post('/ai/negotiate', data),
  chat: (data) => apiClient.post('/ai/chat', data),
};

// ─── Feature APIs ────────────────────────────────────────────────────────────
export const complianceAPI = {
  scan: (contractId) => apiClient.post(`/compliance/${contractId}`),
};

export const litigationAPI = {
  predict: (contractId) => apiClient.post(`/litigation/${contractId}`),
};

export const obligationsAPI = {
  get: (contractId) => apiClient.get(`/obligations/${contractId}`),
};

export const vendorAPI = {
  analyze: (data) => apiClient.post('/vendor/analyze', data),
};

export const monitoringAPI = {
  getAlerts: () => apiClient.get('/monitoring/alerts'),
};

export default apiClient;
