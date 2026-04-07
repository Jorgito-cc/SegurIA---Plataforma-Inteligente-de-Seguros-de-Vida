import { FaEdit, FaTrash, FaPlus, FaSpinner } from 'react-icons/fa';

export function CrudTable({ 
  columns, 
  data, 
  loading, 
  onEdit, 
  onDelete, 
  onAdd,
  pageInfo 
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No hay registros para mostrar</p>
        <button
          onClick={onAdd}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
        >
          <FaPlus /> Crear nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 border-b-2 border-gray-300">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-gray-700">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-50 transition">
              {columns.map((col) => (
                <td key={`${item.id}-${col.key}`} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}
              <td className="px-4 py-3 text-center flex justify-center gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1"
                >
                  <FaEdit size={14} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center gap-1"
                >
                  <FaTrash size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {pageInfo && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Página {pageInfo.currentPage} de {pageInfo.totalPages} ({pageInfo.totalCount} total)
        </div>
      )}
    </div>
  );
}
