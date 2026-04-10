import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { notify } from '../notifications/notify';
import { roleRepository } from '../../../infrastructure/repositories/roleRepository';

export default function CreateRoleForm({ editingData = null, onSubmit, onCancel, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: editingData || {
      name: '',
      permissions: [],
    },
    mode: 'onTouched',
  });

  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState(editingData?.permissions || []);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const data = await roleRepository.getPermissions();
      setPermissions(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      notify.error('Error al cargar permisos');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const onSubmitForm = async (data) => {
    try {
      if (selectedPermissions.length === 0) {
        notify.warning('Seleccione al menos un permiso');
        return;
      }
      const submitData = {
        ...data,
        permissions: selectedPermissions,
      };
      await onSubmit(submitData);
      if (!editingData) {
        reset();
        setSelectedPermissions([]);
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando rol');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {editingData ? 'Editar Rol' : 'Crear Nuevo Rol'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 transition"
        >
          <FaTimes size={20} />
        </button>
      </div>

      {/* Nombre del Rol */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del Rol *
        </label>
        <input
          {...register('name', {
            required: 'Nombre del rol es requerido',
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            maxLength: { value: 50, message: 'Máximo 50 caracteres' },
            pattern: {
              value: /^[a-zA-Z\s\-]+$/,
              message: 'Solo letras, espacios y guiones',
            },
          })}
          type="text"
          placeholder="Administrador Principal"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent outline-none"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Permisos */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Permisos *
        </label>

        {loadingPermissions ? (
          <p className="text-slate-500">Cargando permisos...</p>
        ) : permissions.length === 0 ? (
          <p className="text-slate-500">No hay permisos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto border border-slate-200 p-4 rounded-lg bg-slate-50">
            {permissions.map((perm) => (
              <div key={perm.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`perm-${perm.id}`}
                  checked={selectedPermissions.includes(perm.id)}
                  onChange={() => handlePermissionChange(perm.id)}
                  className="w-4 h-4 accent-violet-600 rounded"
                />
                <label htmlFor={`perm-${perm.id}`} className="ml-2 text-sm text-slate-700 cursor-pointer">
                  <span className="font-medium">{perm.name}</span>
                  <br />
                  <span className="text-xs text-slate-500">{perm.codename}</span>
                </label>
              </div>
            ))}
          </div>
        )}
        {selectedPermissions.length === 0 && (
          <p className="text-yellow-600 text-sm mt-2">Seleccione al menos un permiso</p>
        )}
        <p className="text-xs text-slate-500 mt-2">
          {selectedPermissions.length} permiso(s) seleccionado(s)
        </p>
      </div>

      <div className="flex gap-3 mt-6 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-violet-600 text-white font-medium py-2 rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
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
