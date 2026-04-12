import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { notify } from '../notifications/notify';

export default function CreateClientForm({ editingData = null, onSubmit, onCancel, loading = false }) {
  const isEditing = Boolean(editingData);
  const defaultValues = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    ci: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    genero: '',
    profesion_oficio: '',
    es_fumador: false,
    ingresos_mensuales: '',
    is_active: true,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: editingData || defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingData) {
      reset({
        ...defaultValues,
        ...editingData,
        first_name: editingData.first_name || '',
        last_name: editingData.last_name || '',
        username: editingData.username || '',
        email: editingData.email || '',
        ci: editingData.ci || '',
      });
      return;
    }

    reset(defaultValues);
  }, [editingData, reset]);

  const onSubmitForm = async (data) => {
    try {
      await onSubmit(data);
      if (!editingData) reset();
    } catch (err) {
      notify.error(err.message || 'Error procesando cliente');
    }
  };

  const onInvalidSubmit = () => {
    notify.error('Formulario inválido. Revisa los campos marcados en rojo.');
  };

  const today = new Date().toISOString().split('T')[0];
  const baseInputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none';
  const readonlyInputClass = `${baseInputClass} bg-slate-50 text-slate-500 cursor-not-allowed`;

  return (
    <form onSubmit={handleSubmit(onSubmitForm, onInvalidSubmit)} className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
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
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Usuario *
          </label>
          <input
            {...register('username', {
              required: isEditing ? false : 'Usuario es requerido',
              minLength: isEditing ? undefined : { value: 3, message: 'Mínimo 3 caracteres' },
            })}
            type="text"
            placeholder="cliente123"
            readOnly={isEditing}
            className={isEditing ? readonlyInputClass : baseInputClass}
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
            placeholder="cliente@example.com"
            readOnly={isEditing}
            className={isEditing ? readonlyInputClass : baseInputClass}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {isEditing && (
          <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            En edición solo puedes modificar teléfono, dirección, fecha de nacimiento, género, profesión, fumador, ingresos y estado.
            Usuario, correo, cédula, nombre y apellido quedan en solo lectura por el backend.
          </div>
        )}

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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none"
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
            })}
            type="text"
            placeholder="Carlos"
            readOnly={isEditing}
            className={isEditing ? readonlyInputClass : baseInputClass}
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
            })}
            type="text"
            placeholder="García"
            readOnly={isEditing}
            className={isEditing ? readonlyInputClass : baseInputClass}
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
                value: /^\d{6,15}$/,
                message: 'Solo números, entre 6 y 15 dígitos',
              },
            })}
            type="text"
            placeholder="12345678"
            readOnly={isEditing}
            className={isEditing ? readonlyInputClass : baseInputClass}
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
              pattern: {
                value: /^[\d\-\s\+]{7,20}$/,
                message: 'Entre 7 y 20 caracteres (números, espacios, + o -)',
              },
              setValueAs: (value) => (value ? String(value).trim() : ''),
            })}
            type="text"
            placeholder="+58 212 123 4567"
            className={baseInputClass}
          />
          {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>}
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Dirección *
          </label>
          <input
            {...register('direccion', {
              required: isEditing ? false : 'Dirección es requerida',
              minLength: { value: 5, message: 'Mínimo 5 caracteres' },
              maxLength: { value: 160, message: 'Máximo 160 caracteres' },
              setValueAs: (value) => (value ? String(value).trim() : ''),
            })}
            type="text"
            placeholder="Calle 5, Casa 123"
            className={baseInputClass}
          />
          {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha de Nacimiento *
          </label>
          <input
            {...register('fecha_nacimiento', {
              required: isEditing ? false : 'Fecha es requerida',
              validate: (value) => {
                if (!value && !isEditing) return 'Fecha es requerida';
                if (!value && isEditing) return true;
                const birthDate = new Date(value);
                if (Number.isNaN(birthDate.getTime())) return 'Fecha inválida';
                const age = new Date().getFullYear() - birthDate.getFullYear();
                return age >= 18 || 'Debe ser mayor de 18 años';
              },
            })}
            type="date"
            max={today}
            className={baseInputClass}
          />
          {errors.fecha_nacimiento && (
            <p className="text-red-500 text-sm mt-1">{errors.fecha_nacimiento.message}</p>
          )}
        </div>

        {/* Género */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Género *
          </label>
          <select
            {...register('genero', {
              required: isEditing ? false : 'Género es requerido',
            })}
            className={baseInputClass}
          >
            <option value="">Seleccione</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
          {errors.genero && <p className="text-red-500 text-sm mt-1">{errors.genero.message}</p>}
        </div>

        {/* Profesión */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Profesión * 
          </label>
          <input
            {...register('profesion_oficio', {
              required: isEditing ? false : 'Profesión es requerida',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 80, message: 'Máximo 80 caracteres' },
              setValueAs: (value) => (value ? String(value).trim() : ''),
            })}
            type="text"
            placeholder="Ingeniero"
            className={baseInputClass}
          />
          {errors.profesion_oficio && (
            <p className="text-red-500 text-sm mt-1">{errors.profesion_oficio.message}</p>
          )}
        </div>

        {/* Ingresos Mensuales */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ingresos Mensuales ($) *
          </label>
          <input
            {...register('ingresos_mensuales', {
              required: isEditing ? false : 'Ingresos es requerido',
              min: { value: 0, message: 'No puede ser negativo' },
              validate: (value) => {
                if ((value === '' || value == null) && isEditing) return true;
                return parseFloat(value) > 0 || 'Debe ser mayor que 0';
              },
              setValueAs: (value) => (value === '' || value == null ? null : Number(value)),
            })}
            type="number"
            step="0.01"
            placeholder="1500"
            className={baseInputClass}
          />
          {errors.ingresos_mensuales && (
            <p className="text-red-500 text-sm mt-1">{errors.ingresos_mensuales.message}</p>
          )}
        </div>

        {/* Fumador */}
        <div className="flex items-center pt-6">
          <input
            {...register('es_fumador')}
            type="checkbox"
            className="w-4 h-4 accent-emerald-600 rounded"
          />
          <label className="ml-2 text-sm font-medium text-slate-700">¿Es fumador?</label>
        </div>

        {/* Estado Activo */}
        <div className="flex items-center pt-6">
          <input
            {...register('is_active')}
            type="checkbox"
            defaultChecked
            className="w-4 h-4 accent-emerald-600 rounded"
          />
          <label className="ml-2 text-sm font-medium text-slate-700">Activo</label>
        </div>
      </div>

      <div className="flex gap-3 mt-6 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-emerald-600 text-white font-medium py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
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
