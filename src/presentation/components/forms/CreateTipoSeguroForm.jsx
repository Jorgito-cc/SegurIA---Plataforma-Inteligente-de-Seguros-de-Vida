import { useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { notify } from '../notifications/notify';

export default function CreateTipoSeguroForm({ editingData = null, onSubmit, onCancel, loading = false }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: editingData || {
      codigo_interno: '',
      nombre: '',
      descripcion: '',
      estado: true,
    },
    mode: 'onTouched',
  });

  const onSubmitForm = async (data) => {
    try {
      await onSubmit(data);
      if (!editingData) reset();
    } catch (err) {
      notify.error(err.message || 'Error procesando tipo de seguro');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {editingData ? 'Editar Tipo de Seguro' : 'Crear Nuevo Tipo de Seguro'}
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
        {/* Código Interno */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Código Interno *
          </label>
          <input
            {...register('codigo_interno', {
              required: 'Código interno es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
              maxLength: { value: 20, message: 'Máximo 20 caracteres' },
              pattern: {
                value: /^[A-Z0-9\-]+$/,
                message: 'Solo mayúsculas, números y guiones',
              },
            })}
            type="text"
            placeholder="SEG-VIDA-001"
            maxLength="20"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
          />
          {errors.codigo_interno && (
            <p className="text-red-500 text-sm mt-1">{errors.codigo_interno.message}</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre del Tipo *
          </label>
          <input
            {...register('nombre', {
              required: 'Nombre es requerido',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
            })}
            type="text"
            placeholder="Seguro de Vida Individual"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descripción *
          </label>
          <textarea
            {...register('descripcion', {
              required: 'Descripción es requerida',
              minLength: { value: 10, message: 'Mínimo 10 caracteres' },
              maxLength: { value: 500, message: 'Máximo 500 caracteres' },
            })}
            placeholder="Descripción del tipo de seguro..."
            rows="4"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
          />
          {errors.descripcion && (
            <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
          )}
        </div>

        {/* Estado */}
        <div className="flex items-center pt-2">
          <input
            {...register('estado')}
            type="checkbox"
            defaultChecked
            className="w-4 h-4 accent-orange-600 rounded"
          />
          <label className="ml-2 text-sm font-medium text-slate-700">Activo</label>
        </div>
      </div>

      <div className="flex gap-3 mt-6 border-t border-slate-200 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-orange-600 text-white font-medium py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
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
