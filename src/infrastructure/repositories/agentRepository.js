import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const agentRepository = {
  // Listar agentes con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.agentes, {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  // Obtener agente por ID
  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.agentes}${id}/`);
    return data;
  },

  // Crear agente
  async create(payload) {
    const { data } = await apiClient.post(ENDPOINTS.agentes, payload);
    return data;
  },

  // Actualizar agente
  async update(id, payload) {
    const { data } = await apiClient.put(`${ENDPOINTS.agentes}${id}/`, payload);
    return data;
  },

  // Eliminar agente
  async delete(id) {
    await apiClient.delete(`${ENDPOINTS.agentes}${id}/`);
  },

  // Buscar/filtrar agentes
  async search(query) {
    const { data } = await apiClient.get(ENDPOINTS.agentes, {
      params: { search: query },
    });
    return data;
  },
};
