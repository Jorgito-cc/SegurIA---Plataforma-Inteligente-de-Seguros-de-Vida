import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

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

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      'Error de red o servidor';

    return Promise.reject(new Error(message));
  }
);

export default apiClient;