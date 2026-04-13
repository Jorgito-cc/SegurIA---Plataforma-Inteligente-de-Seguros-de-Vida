import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const trimString = (val) => (typeof val === 'string' ? val.trim() : val);

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
    console.log('🔍 [clientRepository.create] Payload recibido:', payload);
    
    // Debug: mostrar cada campo
    console.log('📋 Campos recibidos:');
    console.log('  username:', payload.username, '(tipo:', typeof payload.username, ')');
    console.log('  email:', payload.email, '(tipo:', typeof payload.email, ')');
    console.log('  password:', payload.password, '(tipo:', typeof payload.password, ')');
    console.log('  first_name:', payload.first_name, '(tipo:', typeof payload.first_name, ')');
    console.log('  last_name:', payload.last_name, '(tipo:', typeof payload.last_name, ')');
    console.log('  ci:', payload.ci, '(tipo:', typeof payload.ci, ')');
    console.log('  telefono:', payload.telefono, '(tipo:', typeof payload.telefono, ')');
    console.log('  direccion:', payload.direccion, '(tipo:', typeof payload.direccion, ')');
    
    const createPayload = {
      email: (payload.email || '').toString().trim().toLowerCase(),
      username: (payload.username || '').toString().trim(),
      password: (payload.password || '').toString().trim(),
      first_name: (payload.first_name || '').toString().trim(),
      last_name: (payload.last_name || '').toString().trim(),
      ci: (payload.ci || '').toString().trim(),
      telefono: (payload.telefono || '').toString().trim(),
      direccion: (payload.direccion || '').toString().trim(),
      fecha_nacimiento: payload.fecha_nacimiento ? trimString(payload.fecha_nacimiento) : null,
      genero: payload.genero ? trimString(payload.genero) : null,
      profesion_oficio: payload.profesion_oficio ? trimString(payload.profesion_oficio) : null,
      es_fumador: Boolean(payload.es_fumador),
      ingresos_mensuales:
        payload.ingresos_mensuales === '' || payload.ingresos_mensuales == null
          ? null
          : Number(payload.ingresos_mensuales),
    };
    
    console.log('📤 [clientRepository.create] Payload a enviar:', createPayload);
    
    const { data } = await apiClient.post(ENDPOINTS.auth.registerClient, createPayload);
    return data;
  },

  // Actualizar cliente
  async update(id, payload) {
    console.log('🔍 [clientRepository.update] Payload recibido:', payload);
    // ⚠️ Backend ClienteSerializer SOLO acepta estos campos:
    // telefono, direccion, fecha_nacimiento, genero, profesion_oficio, es_fumador, ingresos_mensuales, is_active
    const updatePayload = {
      telefono: payload.telefono?.trim() || '',
      direccion: payload.direccion?.trim() || '',
      fecha_nacimiento: payload.fecha_nacimiento === '' ? null : payload.fecha_nacimiento,
      genero: payload.genero === '' ? null : payload.genero,
      profesion_oficio: payload.profesion_oficio?.trim() || '',
      es_fumador: Boolean(payload.es_fumador),
      ingresos_mensuales: payload.ingresos_mensuales === '' || !payload.ingresos_mensuales ? null : Number(payload.ingresos_mensuales),
      is_active: Boolean(payload.is_active),
    };
    console.log('📤 [clientRepository.update] Payload a enviar:', updatePayload);
    const { data } = await apiClient.patch(`${ENDPOINTS.clientes}${id}/`, updatePayload);
    console.log('✅ [clientRepository.update] Respuesta del backend:', data);
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
