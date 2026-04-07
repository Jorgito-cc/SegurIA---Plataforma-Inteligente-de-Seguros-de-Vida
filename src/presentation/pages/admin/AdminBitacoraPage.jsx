import { useEffect, useState } from 'react';
import { bitacoraRepository } from '../../../infrastructure/repositories/bitacoraRepository';
import { notify } from '../../components/notifications/notify';
import { FaSpinner } from 'react-icons/fa';

export default function AdminBitacoraPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [filter, records]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await bitacoraRepository.getLatest(100);
      setRecords(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      notify.error('No se pudieron cargar los registros de bitácora');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (filter === 'all') {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(records.filter(r => r.accion === filter));
    }
  };

  const getActionColor = (accion) => {
    const colors = {
      'LOGIN': 'text-green-600 bg-green-50',
      'LOGOUT': 'text-blue-600 bg-blue-50',
      'CREAR': 'text-purple-600 bg-purple-50',
      'EDITAR': 'text-yellow-600 bg-yellow-50',
      'ELIMINAR': 'text-red-600 bg-red-50',
    };
    return colors[accion] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bitácora de Auditoría</h1>

      <div className="mb-6 flex gap-2 flex-wrap">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
          <option value="all">Todas las acciones</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="CREAR">Crear</option>
          <option value="EDITAR">Editar</option>
          <option value="ELIMINAR">Eliminar</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center flex justify-center"><FaSpinner className="animate-spin text-blue-600 text-2xl" /></div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No hay registros en la bitácora</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Acción</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Módulo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Detalle</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(record.fecha).toLocaleString('es-ES')}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.usuario || 'Sistema'}</td>
                  <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(record.accion)}`}>{record.accion}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.modulo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{record.detalle}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.ip || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
