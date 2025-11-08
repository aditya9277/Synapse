/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
};

// Content API
export const contentAPI = {
  getAll: (params?: any) => api.get('/content', { params }),
  getById: (id: string) => api.get(`/content/${id}`),
  create: (data: any) => api.post('/content', data),
  update: (id: string, data: any) => api.patch(`/content/${id}`, data),
  delete: (id: string) => api.delete(`/content/${id}`),
  upload: (formData: FormData) =>
    api.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Search API
export const searchAPI = {
  search: (query: string, limit?: number) =>
    api.get('/search', { params: { q: query, limit } }),
  getSuggestions: (query: string) =>
    api.get('/search/suggestions', { params: { q: query } }),
};

// Collections API
export const collectionsAPI = {
  getAll: () => api.get('/collections'),
  getById: (id: string) => api.get(`/collections/${id}`),
  create: (data: any) => api.post('/collections', data),
  update: (id: string, data: any) => api.patch(`/collections/${id}`, data),
  delete: (id: string) => api.delete(`/collections/${id}`),
  addItem: (id: string, contentId: string) =>
    api.post(`/collections/${id}/items`, { contentId }),
  removeItem: (id: string, contentId: string) =>
    api.delete(`/collections/${id}/items/${contentId}`),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data: { name: string; color?: string }) => api.post('/tags', data),
  update: (id: string, data: any) => api.patch(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};
