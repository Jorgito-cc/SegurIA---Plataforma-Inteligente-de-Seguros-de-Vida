/**
 * USE CASE: Crear Cliente
 * Responsable de:
 * - Validar datos del cliente
 * - Transformar datos al formato correcto
 * - Llamar al repositorio para guardar
 */

export async function createClient(clientRepository, formData) {
  console.log('📋 [createClient USE CASE] Datos recibidos:', formData);

  // Validar campos requeridos
  const required = ['username', 'email', 'password', 'first_name', 'last_name', 'ci', 'telefono', 'direccion'];
  const missing = required.filter(field => !formData[field] || (typeof formData[field] === 'string' && !formData[field].trim()));
  
  if (missing.length > 0) {
    throw new Error(`Campos requeridos vacíos: ${missing.join(', ')}`);
  }

  // Transformar y validar datos
  const clientData = {
    // 🔴 CRÍTICO: Campos exactamente como el backend espera en RegistroClienteSerializer
    email: String(formData.email).trim().toLowerCase(),
    username: String(formData.username).trim(),
    password: String(formData.password).trim(),
    first_name: String(formData.first_name).trim(),
    last_name: String(formData.last_name).trim(),
    ci: String(formData.ci).trim(),
    telefono: String(formData.telefono).trim(),
    direccion: String(formData.direccion).trim(),
    
    // Campos opcionales (pueden ser null o vacíos)
    fecha_nacimiento: formData.fecha_nacimiento ? String(formData.fecha_nacimiento).trim() : null,
    genero: formData.genero ? String(formData.genero).trim() : null,
    profesion_oficio: formData.profesion_oficio ? String(formData.profesion_oficio).trim() : '',
    
    // Booleanos - siempre deben ser true o false
    es_fumador: Boolean(formData.es_fumador),
    
    // Números - convertir a número o null
    ingresos_mensuales:
      !formData.ingresos_mensuales || formData.ingresos_mensuales === ''
        ? null
        : Number(formData.ingresos_mensuales),
  };

  console.log('✅ [createClient USE CASE] Datos validados y transformados:', clientData);

  // Llamar al repositorio
  try {
    const createdClient = await clientRepository.create(clientData);
    console.log('✅ [createClient USE CASE] Cliente creado exitosamente:', createdClient);
    return createdClient;
  } catch (error) {
    console.error('❌ [createClient USE CASE] Error al crear cliente:', error.message);
    throw error;
  }
}
