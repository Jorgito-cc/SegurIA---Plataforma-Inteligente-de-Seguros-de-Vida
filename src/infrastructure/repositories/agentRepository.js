import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const agentRepository = {
  // Listar agentes con paginación
  async list(page = 1, pageSize = 20) {
    console.log(`[agentRepository.list] Requesting page=${page}, pageSize=${pageSize}, endpoint=${ENDPOINTS.agentes}`);
    const { data } = await apiClient.get(ENDPOINTS.agentes, {
      params: { page, page_size: pageSize },
    });
    console.log(`[agentRepository.list] Response data:`, data);
    if (data.results) {
      console.log(`[agentRepository.list] Returning ${data.results.length} results`);
    } else if (Array.isArray(data)) {
      console.log(`[agentRepository.list] Returning ${data.length} items`);
    }
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
    const updatePayload = { ...payload };
    if (!updatePayload.password) {
      delete updatePayload.password;
    }
    const { data } = await apiClient.patch(`${ENDPOINTS.agentes}${id}/`, updatePayload);
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
