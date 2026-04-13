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
    validateRequiredFields(payload, ['username', 'email', 'password', 'first_name', 'last_name', 'ci', 'telefono', 'codigo_licencia', 'fecha_ingreso', 'nivel', 'comision_base_porcentaje', 'sucursal']);
    
    const createPayload = {
      username: trimString(payload.username),
      email: trimString(payload.email).toLowerCase(),
      password: trimString(payload.password),
      first_name: trimString(payload.first_name),
      last_name: trimString(payload.last_name),
      ci: trimString(payload.ci),
      telefono: trimString(payload.telefono),
      codigo_licencia: trimString(payload.codigo_licencia),
      fecha_ingreso: payload.fecha_ingreso ? trimString(payload.fecha_ingreso) : new Date().toISOString().split('T')[0],
      nivel: payload.nivel ? trimString(payload.nivel) : 'Junior',
      comision_base_porcentaje: Number(payload.comision_base_porcentaje) || 0,
      sucursal: trimString(payload.sucursal),
      is_active: Boolean(payload.is_active),
    };
    const { data } = await apiClient.post(ENDPOINTS.agentes, createPayload);
    return data;
  },

  // Actualizar agente
  async update(id, payload) {
    console.log('🔍 [agentRepository.update] Payload recibido:', payload);
    const updatePayload = {
      first_name: payload.first_name?.trim() || '',
      last_name: payload.last_name?.trim() || '',
      ci: payload.ci?.trim() || '',
      telefono: payload.telefono?.trim() || '',
      codigo_licencia: payload.codigo_licencia?.trim() || '',
      fecha_ingreso: payload.fecha_ingreso || null,
      nivel: payload.nivel || 'Junior',
      comision_base_porcentaje: Number(payload.comision_base_porcentaje) || 0,
      sucursal: payload.sucursal?.trim() || '',
      is_active: Boolean(payload.is_active),
    };
    if (payload.password && payload.password?.trim()) {
      updatePayload.password = payload.password.trim();
    }
    console.log('📤 [agentRepository.update] Payload a enviar:', updatePayload);
    const { data } = await apiClient.patch(`${ENDPOINTS.agentes}${id}/`, updatePayload);
    console.log('✅ [agentRepository.update] Respuesta del backend:', data);
    return data;
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
