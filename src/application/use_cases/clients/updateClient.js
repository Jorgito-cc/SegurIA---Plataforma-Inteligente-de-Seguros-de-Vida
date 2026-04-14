/**
 * USE CASE: Actualizar Cliente
 * Responsable de:
 * - Validar datos del cliente
 * - Transformar datos al formato correcto para PATCH
 * - Manejar checkboxes que no fueron tocados
 * - Llamar al repositorio para guardar
 */

export async function updateClient(clientRepository, clientId, formData, originalClient) {
  console.log('📋 [updateClient USE CASE] ID:', clientId, 'Datos recibidos:', formData);

  // Transformar datos SOLO con los campos que el backend acepta para PATCH
  // Según ClienteSerializer read_only_fields: ["email", "username", "ci"]
  const clientData = {
    telefono: String(formData.telefono || '').trim(),
    direccion: String(formData.direccion || '').trim(),
    
    // Campos opcionales
    fecha_nacimiento: formData.fecha_nacimiento ? String(formData.fecha_nacimiento).trim() : null,
    genero: formData.genero ? String(formData.genero).trim() : null,
    profesion_oficio: String(formData.profesion_oficio || '').trim(),
    
    // Booleanos - CRÍTICO: Si no fueron tocados, usar el valor original
    es_fumador: formData.hasOwnProperty('es_fumador') 
      ? Boolean(formData.es_fumador) 
      : (originalClient?.es_fumador ?? false),
    
    // Números
    ingresos_mensuales:
      !formData.ingresos_mensuales || formData.ingresos_mensuales === ''
        ? null
        : Number(formData.ingresos_mensuales),
    
    // Estado - CRÍTICO: Si no fue tocado, usar el valor original
    is_active: formData.hasOwnProperty('is_active')
      ? Boolean(formData.is_active)
      : (originalClient?.is_active ?? true),
  };

  console.log('✅ [updateClient USE CASE] Datos validados y transformados:', clientData);

  // Llamar al repositorio
  try {
    const updatedClient = await clientRepository.update(clientId, clientData);
    console.log('✅ [updateClient USE CASE] Cliente actualizado exitosamente:', updatedClient);
    return updatedClient;
  } catch (error) {
    console.error('❌ [updateClient USE CASE] Error al actualizar cliente:', error.message);
    throw error;
  }
}
