import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const adminRepository = {
  // Listar administradores con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.admin, {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  // Obtener administrador por ID
  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.admin}${id}/`);
    return data;
  },

  // Crear administrador
  async create(payload) {
    const { data } = await apiClient.post(ENDPOINTS.admin, payload);
    return data;
  },

  // Actualizar administrador
  async update(id, payload) {
    const { data } = await apiClient.put(`${ENDPOINTS.admin}${id}/`, payload);
    return data;
  },

  // Eliminar administrador
  async delete(id) {
    await apiClient.delete(`${ENDPOINTS.admin}${id}/`);
  },

  // Buscar/filtrar administradores
  async search(query) {
    const { data } = await apiClient.get(ENDPOINTS.admin, {
      params: { search: query },
    });
    return data;
  },
};
