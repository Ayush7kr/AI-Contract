/**
 * Axios API client with JWT auth interceptor.
 * All API calls go through this client which auto-attaches the token.
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min timeout for AI calls
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
      timeout: 180000, // 3 min for upload + AI analysis
    }),
  list: () => apiClient.get('/contracts/'),
  get: (id) => apiClient.get(`/contracts/${id}`),
  delete: (id) => apiClient.delete(`/contracts/${id}`),
};

// ─── Analysis API ────────────────────────────────────────────────────────────
export const analysisAPI = {
  analyze: (contractId) => apiClient.post(`/analysis/${contractId}/analyze`),
};

// ─── AI API ─────────────────────────────────────────────────────────────────
export const aiAPI = {
  suggest: (data) => apiClient.post('/ai/suggest', data),
  negotiate: (data) => apiClient.post('/ai/negotiate', data),
  chat: (data) => apiClient.post('/ai/chat', data),
  legalNews: () => apiClient.get('/ai/legal-news'),
  contractNews: (contractId) => apiClient.get(`/ai/legal-news/${contractId}`),
  compare: (data) => apiClient.post('/ai/compare', data),
  getTemplate: (type) => apiClient.get(`/ai/template/${type}`),
  simulate: (data) => apiClient.post('/ai/simulate', data),
};

// ─── Feature APIs ────────────────────────────────────────────────────────────
export const complianceAPI = {
  scan: (contractId) => apiClient.post(`/compliance/${contractId}`),
};

export const vendorAPI = {
  analyze: (data) => apiClient.post('/vendor/analyze', data),
};

export default apiClient;
