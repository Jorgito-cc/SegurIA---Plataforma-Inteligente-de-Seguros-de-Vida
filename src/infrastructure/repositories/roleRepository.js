import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const roleRepository = {
  // Listar roles con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.roles, {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  // Obtener rol por ID
  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.roles}${id}/`);
    return data;
  },

  // Crear rol con permisos
  async create(payload) {
    const { data } = await apiClient.post(ENDPOINTS.roles, payload);
    return data;
  },

  // Actualizar rol
  async update(id, payload) {
    const { data } = await apiClient.put(`${ENDPOINTS.roles}${id}/`, payload);
    return data;
  },

  // Eliminar rol
  async delete(id) {
    await apiClient.delete(`${ENDPOINTS.roles}${id}/`);
  },

  // Obtener lista de permisos disponibles
  async getPermissions() {
    const { data } = await apiClient.get(ENDPOINTS.permisos);
    return data;
  },

  // Buscar roles por nombre
  async search(query) {
    const { data } = await apiClient.get(ENDPOINTS.roles, {
      params: { search: query },
    });
    return data;
  },
};
