import axios from 'axios';

const FALLBACK_API_BASE = 'https://backendseguros-production.up.railway.app/api';
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
    const requestUrl = error?.config?.url || '';

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

    if (status === 401 && /agentes|clientes|administrador|bitacoras/i.test(requestUrl)) {
      message = 'Sesion expirada o invalida. Inicia sesion nuevamente.';
    } else if (status === 403) {
      message = 'No tienes permisos para realizar esta accion.';
    } else if (status === 405) {
      message = 'Metodo HTTP no permitido para este endpoint.';
    }

    const apiError = new Error(message);
    apiError.status = status;
    apiError.data = data;
    apiError.url = requestUrl;

    return Promise.reject(apiError);
  }
);

export default apiClient;