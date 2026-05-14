import { useEffect, useState } from 'react';
import { bitacoraRepository } from '../../../infrastructure/repositories/bitacoraRepository';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import ExportButtons from '../../components/ui/ExportButtons';
import { notify } from '../../components/notifications/notify';
import { FaSpinner, FaLock, FaUnlock } from 'react-icons/fa';

export default function AdminBitacoraPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  const ADMIN_PASSWORD = "12345678"; // Contraseña en duro por ahora

  useEffect(() => {
    if (isUnlocked) {
      loadRecords();
    }
  }, [isUnlocked]);

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

  const buildExportRows = () =>
    filteredRecords.map((record) => ({
      Fecha: record.fecha ? new Date(record.fecha).toLocaleString('es-ES') : '-',
      Usuario: record.usuario || 'Sistema',
      Accion: record.accion,
      Modulo: record.modulo,
      Detalle: record.detalle,
      IP: record.ip || '-',
    }));

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      notify.success("Bitácora desbloqueada");
      setPassword("");
    } else {
      notify.error("Contraseña incorrecta");
      setPassword("");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <FaLock size={32} className="text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Bitácora Protegida
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Ingresa la contraseña para acceder al registro de auditoría global
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Desbloquear
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaUnlock className="text-green-600" /> Bitácora de Auditoría Global
        </h1>
        <div className="flex items-center gap-4">
          <ExportButtons 
            title="Bitácora de Auditoría Global" 
            fileName="bitacora" 
            columns={['Fecha', 'Usuario', 'Acción', 'Módulo', 'Detalle', 'IP']} 
            rows={filteredRecords.map((r) => [
              r.fecha ? new Date(r.fecha).toLocaleString('es-ES') : '-',
              r.usuario || 'Sistema',
              r.accion,
              r.modulo,
              r.detalle,
              r.ip || '-'
            ])}
            dataObject={buildExportRows()}
          />
          <button
            onClick={() => setIsUnlocked(false)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Bloquear
          </button>
        </div>
      </div>

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
