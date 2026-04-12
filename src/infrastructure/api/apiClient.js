import axios from 'axios';

const FALLBACK_API_BASE = 'https://backend-seguros-de-vida-production.up.railway.app/api';
const rawApiBase = import.meta.env.VITE_API_URL || FALLBACK_API_BASE;
const API_BASE = rawApiBase.replace(/\/+$/, '');

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    }

    const data = error?.response?.data;

    let message = 'Error de red o servidor';

    if (typeof data === 'string' && data.trim()) {
      message = data;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.error) {
      message = data.error;
    } else if (data && typeof data === 'object') {
      const fieldErrors = Object.entries(data)
        .map(([field, value]) => {
          const text = Array.isArray(value) ? value.join(', ') : String(value);
          return `${field}: ${text}`;
        })
        .join(' | ');

      if (fieldErrors) {
        message = fieldErrors;
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default apiClient;