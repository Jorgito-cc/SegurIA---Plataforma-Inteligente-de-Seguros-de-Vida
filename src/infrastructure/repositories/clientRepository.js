import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const trimString = (val) => (typeof val === 'string' ? val.trim() : val);
const validateRequiredFields = (payload, requiredFields) => {
  const missing = requiredFields.filter(
    (field) => !payload[field] || (typeof payload[field] === 'string' && !payload[field].trim())
  );
  if (missing.length > 0) {
    throw new Error(`Campos requeridos vacios: ${missing.join(', ')}`);
  }
};

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
    validateRequiredFields(payload, ['email', 'username', 'password', 'first_name', 'last_name', 'ci', 'telefono', 'direccion']);
    
    const createPayload = {
      email: trimString(payload.email).toLowerCase(),
      username: trimString(payload.username),
      password: trimString(payload.password),
      first_name: trimString(payload.first_name),
      last_name: trimString(payload.last_name),
      ci: trimString(payload.ci),
      telefono: trimString(payload.telefono),
      direccion: trimString(payload.direccion),
      fecha_nacimiento: payload.fecha_nacimiento ? trimString(payload.fecha_nacimiento) : null,
      genero: payload.genero ? trimString(payload.genero) : null,
      profesion_oficio: payload.profesion_oficio ? trimString(payload.profesion_oficio) : null,
      es_fumador: Boolean(payload.es_fumador),
      ingresos_mensuales:
        payload.ingresos_mensuales === '' || payload.ingresos_mensuales == null
          ? null
          : Number(payload.ingresos_mensuales),
    };
    const { data } = await apiClient.post(ENDPOINTS.auth.registerClient, createPayload);
    return data;
  },

  // Actualizar cliente
  async update(id, payload) {
    const updatePayload = {
      telefono: trimString(payload.telefono || ''),
      direccion: trimString(payload.direccion || ''),
      fecha_nacimiento: payload.fecha_nacimiento ? trimString(payload.fecha_nacimiento) : null,
      genero: payload.genero ? trimString(payload.genero) : null,
      profesion_oficio: payload.profesion_oficio ? trimString(payload.profesion_oficio) : null,
      es_fumador: Boolean(payload.es_fumador),
      ingresos_mensuales:
        payload.ingresos_mensuales === '' || payload.ingresos_mensuales == null
          ? null
          : Number(payload.ingresos_mensuales),
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
