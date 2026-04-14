import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const clientRepository = {
  // Listar clientes con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.clientes, {
      params: { page, page_size: pageSize, _ts: Date.now() },
    });
    return data;
  },

  // Obtener cliente por ID
  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.clientes}${id}/`);
    return data;
  },

  // Crear cliente (CRUD)
  async create(payload) {
    console.log('� [clientRepository.create] Enviando payload limpio al backend:', payload);
    
    try {
      const { data } = await apiClient.post(ENDPOINTS.auth.registerClient, payload);
      console.log('✅ [clientRepository.create] Respuesta del backend:', data);
      return data;
    } catch (err) {
      console.error('❌ [clientRepository.create] Error del backend:', err.response?.data || err.message);
      throw err;
    }
  },

  // Actualizar cliente
  async update(id, payload) {
    console.log('� [clientRepository.update] ID:', id, 'Payload limpio:', payload);
    
    try {
      const { data } = await apiClient.patch(`${ENDPOINTS.clientes}${id}/`, payload);
      console.log('✅ [clientRepository.update] Respuesta del backend:', data);
      return data;
    } catch (err) {
      console.error('❌ [clientRepository.update] Error del backend:', err.response?.data || err.message);
      throw err;
    }
  },

  // Eliminar cliente
  async delete(id) {
    await apiClient.delete(`${ENDPOINTS.clientes}${id}/`);
  },

  // Buscar/filtrar clientes
  async search(query) {
    const { data } = await apiClient.get(ENDPOINTS.clientes, {
      params: { search: query },
    });
    return data;
  },
};
