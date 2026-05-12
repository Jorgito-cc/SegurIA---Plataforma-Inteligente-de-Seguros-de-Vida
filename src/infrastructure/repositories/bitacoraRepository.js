import apiClient from "../api/apiClient";
import { ENDPOINTS } from "../api/endpoints";

export const bitacoraRepository = {
  // Obtener todos los registros con filtros opcionales
  async obtenerTodos(filters = {}, page = 1, pageSize = 20) {
    // Limpiar filtros vacíos
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    const params = {
      page,
      page_size: pageSize,
      ...cleanFilters,
    };

    const { data } = await apiClient.get(ENDPOINTS.bitacoras, { params });
    return data;
  },

  // Listar registros de bitácora con paginación
  async list(page = 1, pageSize = 20) {
    const { data } = await apiClient.get(ENDPOINTS.bitacoras, {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  // Obtener registro de bitácora por ID
  async getById(id) {
    const { data } = await apiClient.get(`${ENDPOINTS.bitacoras}${id}/`);
    return data;
  },

  // Filtrar por acción
  async filterByAction(action) {
    const { data } = await apiClient.get(ENDPOINTS.bitacoras, {
      params: { accion: action },
    });
    return data;
  },

  // Filtrar por módulo
  async filterByModule(module) {
    const { data } = await apiClient.get(ENDPOINTS.bitacoras, {
      params: { modulo: module },
    });
    return data;
  },

  // Filtrar por usuario
  async filterByUser(userId) {
    const { data } = await apiClient.get(ENDPOINTS.bitacoras, {
      params: { usuario: userId },
    });
    return data;
  },

  // Obtener últimas N acciones
  async getLatest(limit = 50) {
    const { data } = await apiClient.get(ENDPOINTS.bitacoras, {
      params: { limit },
    });
    return data;
  },
};
