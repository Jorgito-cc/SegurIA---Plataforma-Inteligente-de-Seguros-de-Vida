import apiClient from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

const tipoSeguroRepository = {
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.tipoSeguros, {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  async obtenerTodos() {
    const { data } = await apiClient.get(ENDPOINTS.tipoSeguros, {
      params: { page_size: 1000 },
    });
    return Array.isArray(data) ? data : data.results || data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.tipoSeguros}${id}/`);
    return data;
  },

  async create(payload) {
    const { data } = await apiClient.post(ENDPOINTS.tipoSeguros, payload);
    return data;
  },

  async crear(payload) {
    return this.create(payload);
  },

  async update(id, payload) {
    const { data } = await apiClient.put(
      `${ENDPOINTS.tipoSeguros}${id}/`,
      payload,
    );
    return data;
  },

  async actualizar(id, payload) {
    return this.update(id, payload);
  },

  async delete(id) {
    await apiClient.delete(`${ENDPOINTS.tipoSeguros}${id}/`);
  },

  async eliminar(id) {
    return this.delete(id);
  },

  async search(query) {
    const { data } = await apiClient.get(ENDPOINTS.tipoSeguros, {
      params: { search: query },
    });
    return data;
  },

  async filterByEstado(estado = true) {
    const { data } = await apiClient.get(ENDPOINTS.tipoSeguros, {
      params: { estado },
    });
    return data;
  },
};

export default tipoSeguroRepository;
export { tipoSeguroRepository };
