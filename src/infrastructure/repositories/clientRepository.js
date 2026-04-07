import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const clientRepository = {
  // Listar clientes con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.clientes, {
      params: { page, page_size: pageSize },
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
    const { data } = await apiClient.post(ENDPOINTS.clientes, payload);
    return data;
  },

  // Actualizar cliente
  async update(id, payload) {
    const { data } = await apiClient.put(`${ENDPOINTS.clientes}${id}/`, payload);
    return data;
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
