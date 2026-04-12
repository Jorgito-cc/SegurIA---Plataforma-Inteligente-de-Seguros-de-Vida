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
    const createPayload = {
      email: payload.email,
      username: payload.username,
      password: payload.password,
      first_name: payload.first_name,
      last_name: payload.last_name,
      ci: payload.ci,
      telefono: payload.telefono,
      direccion: payload.direccion,
      fecha_nacimiento: payload.fecha_nacimiento || null,
      genero: payload.genero || null,
      profesion_oficio: payload.profesion_oficio || null,
      es_fumador: Boolean(payload.es_fumador),
      ingresos_mensuales:
        payload.ingresos_mensuales === '' || payload.ingresos_mensuales == null
          ? null
          : payload.ingresos_mensuales,
    };
    const { data } = await apiClient.post(ENDPOINTS.auth.registerClient, createPayload);
    return data;
  },

  // Actualizar cliente
  async update(id, payload) {
    const updatePayload = {
      telefono: payload.telefono || '',
      direccion: payload.direccion || '',
      fecha_nacimiento: payload.fecha_nacimiento || null,
      genero: payload.genero || null,
      profesion_oficio: payload.profesion_oficio || null,
      es_fumador: Boolean(payload.es_fumador),
      ingresos_mensuales:
        payload.ingresos_mensuales === '' || payload.ingresos_mensuales == null
          ? null
          : payload.ingresos_mensuales,
      is_active: Boolean(payload.is_active),
    };
    const { data } = await apiClient.patch(`${ENDPOINTS.clientes}${id}/`, updatePayload);
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
