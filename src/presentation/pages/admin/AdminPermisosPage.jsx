import { useEffect, useMemo, useState } from 'react';
import { roleRepository } from '../../../infrastructure/repositories/roleRepository';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import { FaFileExcel, FaFilePdf, FaSpinner, FaSyncAlt } from 'react-icons/fa';

export default function AdminPermisosPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const data = await roleRepository.getPermissions();
      setPermissions(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      notify.error(error.message || 'No se pudieron cargar los permisos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const filteredPermissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return permissions;

    return permissions.filter((permission) => {
      const name = String(permission.name || '').toLowerCase();
      const code = String(permission.codename || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [permissions, search]);

  const exportRows = filteredPermissions.map((permission) => ({
    ID: permission.id,
    Nombre: permission.name,
    Codigo: permission.codename,
  }));

  const handleExportExcel = () => {
    exportToExcel('permisos', 'Permisos', exportRows);
  };

  const handleExportPdf = () => {
    exportToPdf(
      'Catalogo de Permisos',
      'permisos',
      ['ID', 'Nombre', 'Codigo'],
      exportRows.map((row) => [row.ID, row.Nombre, row.Codigo])
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Permisos del Sistema</h1>
          <p className="text-sm text-gray-600 mt-1">
            Vista de solo lectura consumiendo el endpoint de permisos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPermissions}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
          >
            <FaSyncAlt /> Recargar
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
            disabled={filteredPermissions.length === 0}
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition flex items-center gap-2"
            disabled={filteredPermissions.length === 0}
          >
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o codigo..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center flex justify-center items-center gap-2 text-gray-600">
            <FaSpinner className="animate-spin" /> Cargando permisos...
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No hay permisos para mostrar</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Codename</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map((permission) => (
                <tr key={permission.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{permission.id}</td>
                  <td className="px-4 py-3 text-sm">{permission.name}</td>
                  <td className="px-4 py-3 text-sm font-mono">{permission.codename}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
