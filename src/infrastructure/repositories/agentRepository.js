import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const agentRepository = {
  // Listar agentes con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.agentes, {
      params: { page, page_size: pageSize, _ts: Date.now() },
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
    console.log('📤 [agentRepository.create] Enviando payload limpio al backend:', payload);
    
    try {
      const { data } = await apiClient.post(ENDPOINTS.agentes, payload);
      console.log('✅ [agentRepository.create] Respuesta del backend:', data);
      return data;
    } catch (err) {
      console.error('❌ [agentRepository.create] Error del backend:', err.response?.data || err.message);
      throw err;
    }
  },

  // Actualizar agente
  async update(id, payload) {
    console.log('� [agentRepository.update] ID:', id, 'Payload limpio:', payload);
    
    try {
      const { data } = await apiClient.patch(`${ENDPOINTS.agentes}${id}/`, payload);
      console.log('✅ [agentRepository.update] Respuesta del backend:', data);
      return data;
    } catch (err) {
      console.error('❌ [agentRepository.update] Error del backend:', err.response?.data || err.message);
      throw err;
    }
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
