/**
 * USE CASE: Actualizar Agente
 * Responsable de:
 * - Validar datos del agente
 * - Transformar datos al formato correcto para PATCH
 * - Manejar checkboxes que no fueron tocados
 * - Llamar al repositorio para guardar
 */

export async function updateAgent(agentRepository, agentId, formData, originalAgent) {
  console.log('📋 [updateAgent USE CASE] ID:', agentId, 'Datos recibidos:', formData);

  // Transformar datos SOLO con los campos que el backend acepta para PATCH
  // Según AgenteSerializer, se aceptan todos los campos pero algunos son read_only en GET
  const agentData = {
    telefono: String(formData.telefono || '').trim(),
    codigo_licencia: String(formData.codigo_licencia || '').trim(),
    fecha_ingreso: formData.fecha_ingreso ? String(formData.fecha_ingreso).trim() : '',
    nivel: String(formData.nivel || '').trim(),
    sucursal: String(formData.sucursal || '').trim(),
    
    // Números
    comision_base_porcentaje: Number(formData.comision_base_porcentaje) || 0,
    
    // Estado - CRÍTICO: Si no fue tocado, usar el valor original
    is_active: formData.hasOwnProperty('is_active')
      ? Boolean(formData.is_active)
      : (originalAgent?.is_active ?? true),
  };

  console.log('✅ [updateAgent USE CASE] Datos validados y transformados:', agentData);

  // Llamar al repositorio
  try {
    const updatedAgent = await agentRepository.update(agentId, agentData);
    console.log('✅ [updateAgent USE CASE] Agente actualizado exitosamente:', updatedAgent);
    return updatedAgent;
  } catch (error) {
    console.error('❌ [updateAgent USE CASE] Error al actualizar agente:', error.message);
    throw error;
  }
}
