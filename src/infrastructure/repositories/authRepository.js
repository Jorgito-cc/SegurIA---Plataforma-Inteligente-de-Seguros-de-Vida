import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const authRepository = {
  async login(payload) {
    const loginPayload = {
      email: (payload?.email || '').trim().toLowerCase(),
      password: payload?.password || '',
    };
    const { data } = await apiClient.post(ENDPOINTS.auth.login, loginPayload);
    return data;
  },

  async registerClient(payload) {
    const { data } = await apiClient.post(ENDPOINTS.auth.registerClient, payload);
    return data;
  },

  async registerGeneric(payload) {
    const { data } = await apiClient.post(ENDPOINTS.auth.register, payload);
    return data;
  },

  async logout(refresh) {
    const { data } = await apiClient.post(ENDPOINTS.auth.logout, { refresh });
    return data;
  },

  async requestPasswordReset(email) {
    const { data } = await apiClient.post(ENDPOINTS.auth.passwordResetRequest, { email });
    return data;
  },

  async confirmPasswordReset(payload) {
    const { data } = await apiClient.post(ENDPOINTS.auth.passwordResetConfirm, payload);
    return data;
  },
};