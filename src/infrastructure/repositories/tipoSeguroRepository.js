import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const tipoSeguroRepository = {
  // Listar tipos de seguros con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.tipoSeguros, {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  // Obtener tipo de seguro por ID
  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.tipoSeguros}${id}/`);
    return data;
  },

  // Crear tipo de seguro
  async create(payload) {
    const { data } = await apiClient.post(ENDPOINTS.tipoSeguros, payload);
    return data;
  },

  // Actualizar tipo de seguro
  async update(id, payload) {
    const { data } = await apiClient.put(`${ENDPOINTS.tipoSeguros}${id}/`, payload);
    return data;
  },

  // Eliminar tipo de seguro
  async delete(id) {
    await apiClient.delete(`${ENDPOINTS.tipoSeguros}${id}/`);
  },

  // Buscar/filtrar tipos de seguros
  async search(query) {
    const { data } = await apiClient.get(ENDPOINTS.tipoSeguros, {
      params: { search: query },
    });
    return data;
  },

  // Filtrar por estado
  async filterByEstado(estado = true) {
    const { data } = await apiClient.get(ENDPOINTS.tipoSeguros, {
      params: { estado },
    });
    return data;
  },
};
