import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { notify } from '../notifications/notify';

export default function CreateAgentForm({ editingData = null, onSubmit, onCancel, loading = false }) {
  const isEditing = Boolean(editingData);
  const defaultValues = useMemo(() => ({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    ci: '',
    telefono: '',
    codigo_licencia: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    nivel: 'Junior',
    comision_base_porcentaje: '0',
    sucursal: '',
    is_active: true,
  }), []);

  // Calcular los valores iniciales: si estamos editando, usa editingData, si no usa defaultValues vacíos
  const initialValues = useMemo(() => {
    if (editingData) {
      console.log('📝 useMemo: cálculando initialValues para EDICIÓN:', editingData);
      // El backend retorna first_name y last_name directamente
      return {
        username: editingData.username || '',
        email: editingData.email || '',
        password: '', // No se rellena en edición
        first_name: editingData.first_name || '',
        last_name: editingData.last_name || '',
        ci: editingData.ci || '',
        telefono: editingData.telefono || '',
        codigo_licencia: editingData.codigo_licencia || '',
        fecha_ingreso: editingData.fecha_ingreso || new Date().toISOString().split('T')[0],
        nivel: editingData.nivel || 'Junior',
        comision_base_porcentaje: editingData.comision_base_porcentaje || '0',
        sucursal: editingData.sucursal || '',
        is_active: editingData.is_active !== undefined ? editingData.is_active : true,
      };
    } else {
      console.log('📝 useMemo: cálculando initialValues para CREAR');
      return defaultValues;
    }
  }, [editingData, defaultValues]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('📝 [CreateAgentForm] useEffect - editingData:', editingData);
    console.log('📝 initialValues calculado:', initialValues);
    reset(initialValues);
  }, [initialValues, reset, editingData]);

  const onSubmitForm = async (data) => {
    try {
      console.log('📋 Antes de onSubmit, data:', data);
      
      if (isEditing) {
        // Solo enviar campos editables en modo edición
        const editableFields = {
          telefono: data.telefono || '',
          codigo_licencia: data.codigo_licencia || '',
          fecha_ingreso: data.fecha_ingreso || '',
          nivel: data.nivel || '',
          sucursal: data.sucursal || '',
          comision_base_porcentaje: Number(data.comision_base_porcentaje) || 0,
          is_active: Boolean(data.is_active),
        };
        console.log('✏️ EditMode: Enviando solo campos editables:', editableFields);
        await onSubmit(editableFields);
      } else {
        // En creación, enviar todo
        delete data.password;
        await onSubmit(data);
      }
      
      console.log('✅ onSubmit exitoso');
    } catch (err) {
      console.error('❌ Error en onSubmitForm:', err);
      notify.error(err.message || 'Error procesando agente');
    }
  };

  const onInvalidSubmit = () => {
    notify.error('Formulario inválido. Revisa los campos marcados en rojo.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm, onInvalidSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {editingData ? 'Editar Agente' : 'Crear Nuevo Agente'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEditing && (
          <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            En edición solo puedes modificar teléfono, código de licencia, fecha de ingreso, nivel, comisión, sucursal y estado. 
            Usuario, correo, cédula, nombre y apellido quedan en solo lectura por seguridad.
          </div>
        )}

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Usuario *
          </label>
          <input
            {...register('username', {
              required: isEditing ? false : 'Usuario es requerido',
              minLength: isEditing ? undefined : { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: isEditing ? undefined : { value: 30, message: 'Máximo 30 caracteres' },
              pattern: isEditing ? undefined : {
                value: /^[a-zA-Z0-9._-]+$/,
                message: 'Solo letras, números, punto, guion y guion bajo',
              },
            })}
            type="text"
            placeholder="username"
            readOnly={isEditing}
            className={isEditing ? 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed' : 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Correo Electrónico *
          </label>
          <input
            {...register('email', {
              required: isEditing ? false : 'Correo es requerido',
              pattern: isEditing ? undefined : {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Correo inválido',
              },
            })}
            type="email"
            placeholder="agente@example.com"
            readOnly={isEditing}
            className={isEditing ? 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed' : 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        {!editingData && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña *
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Contraseña es requerida',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
        )}

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre *
          </label>
          <input
            {...register('first_name', {
              required: isEditing ? false : 'Nombre es requerido',
              minLength: isEditing ? undefined : { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: isEditing ? undefined : { value: 60, message: 'Máximo 60 caracteres' },
              pattern: isEditing ? undefined : {
                value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/,
                message: 'Solo letras y espacios',
              },
            })}
            type="text"
            placeholder="Juan"
            readOnly={isEditing}
            className={isEditing ? 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed' : 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'}
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Apellido *
          </label>
          <input
            {...register('last_name', {
              required: isEditing ? false : 'Apellido es requerido',
              minLength: isEditing ? undefined : { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: isEditing ? undefined : { value: 60, message: 'Máximo 60 caracteres' },
              pattern: isEditing ? undefined : {
                value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/,
                message: 'Solo letras y espacios',
              },
            })}
            type="text"
            placeholder="Pérez"
            readOnly={isEditing}
            className={isEditing ? 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed' : 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'}
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
        </div>

        {/* CI */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Cédula de Identidad *
          </label>
          <input
            {...register('ci', {
              required: isEditing ? false : 'Cédula es requerida',
              pattern: isEditing ? undefined : {
                value: /^\d{5,20}$/,
                message: 'Solo números, entre 5 y 20 dígitos',
              },
            })}
            type="text"
            placeholder="12345678"
            readOnly={isEditing}
            className={isEditing ? 'w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed' : 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'}
          />
          {errors.ci && <p className="text-red-500 text-sm mt-1">{errors.ci.message}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Teléfono *
          </label>
          <input
            {...register('telefono', {
              required: isEditing ? false : 'Teléfono es requerido',
              pattern: isEditing ? undefined : {
                value: /^[\d\-\s\+]{7,20}$/,
                message: 'Formato de teléfono inválido',
              },
            })}
            type="text"
            placeholder="+58 212 123 4567"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />
          {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
        </div>

        {/* Código Licencia - MAX 10 CARACTERES */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Código Licencia *
          </label>
          <input
            {...register('codigo_licencia', {
              required: isEditing ? false : 'Código licencia es requerido',
              minLength: isEditing ? undefined : { value: 1, message: 'Mínimo 1 carácter' },
              maxLength: isEditing ? undefined : { value: 10, message: 'Máximo 10 caracteres' },
              pattern: isEditing ? undefined : {
                value: /^[A-Z0-9\-]+$/,
                message: 'Solo mayúsculas, números y guiones',
              },
            })}
            type="text"
            placeholder="AG-2024001"
            maxLength="10"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />
          {errors.codigo_licencia && (
            <p className="text-red-500 text-sm mt-1">{errors.codigo_licencia.message}</p>
          )}
        </div>

        {/* Fecha de Ingreso */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha de Ingreso *
          </label>
          <input
            {...register('fecha_ingreso', {
              required: isEditing ? false : 'Fecha es requerida',
            })}
            type="date"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />
          {errors.fecha_ingreso && <p className="text-red-500 text-sm mt-1">{errors.fecha_ingreso.message}</p>}
        </div>

        {/* Nivel */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nivel *
          </label>
          <select
            {...register('nivel', {
              required: isEditing ? false : 'Nivel es requerido',
            })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          >
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Especialista">Especialista</option>
          </select>
          {errors.nivel && <p className="text-red-500 text-sm mt-1">{errors.nivel.message}</p>}
        </div>

        {/* Comisión Base (porcentaje) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Comisión Base (%) *
          </label>
          <input
            {...register('comision_base_porcentaje', {
              required: isEditing ? false : 'Comisión es requerida',
              min: isEditing ? undefined : { value: 0, message: 'No puede ser negativo' },
              max: isEditing ? undefined : { value: 100, message: 'Máximo 100%' },
            })}
            type="number"
            step="0.01"
            placeholder="2.5"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />
          {errors.comision_base_porcentaje && (
            <p className="text-red-500 text-sm mt-1">{errors.comision_base_porcentaje.message}</p>
          )}
        </div>

        {/* Sucursal */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Sucursal *
          </label>
          <input
            {...register('sucursal', {
              required: isEditing ? false : 'Sucursal es requerida',
              minLength: isEditing ? undefined : { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: isEditing ? undefined : { value: 80, message: 'Máximo 80 caracteres' },
            })}
            type="text"
            placeholder="Centro"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          />
          {errors.sucursal && <p className="text-red-500 text-sm mt-1">{errors.sucursal.message}</p>}
        </div>

        {/* Estado */}
        <div className="flex items-center pt-6">
          <input
            {...register('is_active')}
            type="checkbox"
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <label className="ml-2 text-sm font-medium text-slate-700">Activo</label>
        </div>
      </div>

      <div className="flex gap-3 mt-6 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Procesando...' : editingData ? 'Actualizar' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-200 text-slate-800 font-medium py-2 rounded-lg hover:bg-slate-300 transition"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
