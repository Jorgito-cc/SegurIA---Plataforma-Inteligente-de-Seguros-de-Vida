import apiClient from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

const agentRepository = {
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.agentes, {
      params: { page, page_size: pageSize, _ts: Date.now() },
    });
    return data;
  },

  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.agentes}${id}/`);
    return data;
  },

  async obtenerTodos() {
    const { data } = await apiClient.get(ENDPOINTS.agentes, {
      params: { page_size: 1000, _ts: Date.now() },
    });
    return Array.isArray(data) ? data : data.results || data;
  },

  async create(payload) {
    console.log("[agentRepository.create] Enviando payload:", payload);
    try {
      const { data } = await apiClient.post(ENDPOINTS.agentes, payload);
      console.log("[agentRepository.create] Respuesta:", data);
      return data;
    } catch (err) {
      console.error(
        "[agentRepository.create] Error:",
        err.response?.data || err.message,
      );
      throw err;
    }
  },

  async crear(payload) {
    return this.create(payload);
  },

  async update(id, payload) {
    console.log("[agentRepository.update] ID:", id, "Payload:", payload);
    try {
      const { data } = await apiClient.patch(
        `${ENDPOINTS.agentes}${id}/`,
        payload,
      );
      console.log("[agentRepository.update] Respuesta:", data);
      return data;
    } catch (err) {
      console.error(
        "[agentRepository.update] Error:",
        err.response?.data || err.message,
      );
      throw err;
    }
  },

  async actualizar(id, payload) {
    return this.update(id, payload);
  },

  async delete(id) {
    await apiClient.delete(`${ENDPOINTS.agentes}${id}/`);
  },

  async eliminar(id) {
    return this.delete(id);
  },

  async search(query) {
    const { data } = await apiClient.get(ENDPOINTS.agentes, {
      params: { search: query },
    });
    return data;
  },
};

export default agentRepository;
export { agentRepository };
