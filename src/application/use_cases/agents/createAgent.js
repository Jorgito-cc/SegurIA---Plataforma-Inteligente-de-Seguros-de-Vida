/**
 * USE CASE: Crear Agente
 * Responsable de:
 * - Validar datos del agente
 * - Transformar datos al formato correcto
 * - Llamar al repositorio para guardar
 */

export async function createAgent(agentRepository, formData) {
  console.log('📋 [createAgent USE CASE] Datos recibidos:', formData);

  // Validar campos requeridos
  const required = [
    'username',
    'email',
    'password',
    'first_name',
    'last_name',
    'ci',
    'telefono',
    'codigo_licencia',
    'fecha_ingreso',
    'nivel',
    'comision_base_porcentaje',
    'sucursal',
  ];

  const missing = required.filter(
    (field) => !formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())
  );

  if (missing.length > 0) {
    throw new Error(`Campos requeridos vacíos: ${missing.join(', ')}`);
  }

  // Transformar y validar datos
  const agentData = {
    // 🔴 CRÍTICO: Campos exactamente como el backend espera en AgenteSerializer
    email: String(formData.email).trim().toLowerCase(),
    username: String(formData.username).trim(),
    password: String(formData.password).trim(),
    first_name: String(formData.first_name).trim(),
    last_name: String(formData.last_name).trim(),
    ci: String(formData.ci).trim(),
    telefono: String(formData.telefono).trim(),
    
    // Campos específicos del agente
    codigo_licencia: String(formData.codigo_licencia).trim(),
    fecha_ingreso: formData.fecha_ingreso ? String(formData.fecha_ingreso).trim() : new Date().toISOString().split('T')[0],
    nivel: formData.nivel ? String(formData.nivel).trim() : 'Junior',
    sucursal: String(formData.sucursal).trim(),
    
    // Números de decimales
    comision_base_porcentaje: Number(formData.comision_base_porcentaje) || 0,
    
    // Booleano
    is_active: Boolean(formData.is_active),
  };

  console.log('✅ [createAgent USE CASE] Datos validados y transformados:', agentData);

  // Llamar al repositorio
  try {
    const createdAgent = await agentRepository.create(agentData);
    console.log('✅ [createAgent USE CASE] Agente creado exitosamente:', createdAgent);
    return createdAgent;
  } catch (error) {
    console.error('❌ [createAgent USE CASE] Error al crear agente:', error.message);
    throw error;
  }
}
