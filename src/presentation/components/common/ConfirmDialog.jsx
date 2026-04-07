import { FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';

export function ConfirmDialog({ 
  open, 
  title = '¿Estás seguro?', 
  message = 'Esta acción no se puede deshacer.',
  onConfirm, 
  onCancel,
  isLoading = false,
  isDangerous = true
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-2xl">
        {/* Encabezado */}
        <div className={`p-6 border-b ${isDangerous ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            {isDangerous ? (
              <FaExclamationTriangle className="text-red-600 text-2xl" />
            ) : (
              <FaCheckCircle className="text-yellow-600 text-2xl" />
            )}
            <h2 className={`text-lg font-bold ${isDangerous ? 'text-red-800' : 'text-yellow-800'}`}>
              {title}
            </h2>
          </div>
        </div>

        {/* Mensaje */}
        <div className="p-6">
          <p className="text-gray-700">{message}</p>
        </div>

        {/* Botones */}
        <div className="p-6 bg-gray-50 border-t flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition disabled:opacity-50 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 font-semibold flex items-center gap-2 ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Procesando...' : isDangerous ? 'Eliminar' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
