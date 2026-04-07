import { useState, useEffect } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { roleRepository } from '../../../infrastructure/repositories/roleRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaFileExcel, FaFilePdf } from 'react-icons/fa';

export default function AdminRolesPage() {
  const crud = useCrudManager(roleRepository);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({ name: '', permissions: [] });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const data = await roleRepository.getPermissions();
      setPermissions(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      notify.error('No se pudieron cargar permisos');
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  };

  const handlePermissionChange = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (crud.editingId) {
        const success = await crud.handleUpdate(crud.editingId, formData);
        if (success) {
          notify.success('Rol actualizado');
          resetForm();
        }
      } else {
        const success = await crud.handleCreate(formData);
        if (success) {
          notify.success('Rol creado');
          resetForm();
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando rol');
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, permissions: item.permissions || [] });
    crud.setEditingId(item.id);
    crud.setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', permissions: [] });
    crud.setEditingId(null);
    crud.setShowForm(false);
  };

  const buildExportRows = () =>
    crud.items.map((item) => ({
      ID: item.id,
      Nombre: item.name,
      CantidadPermisos: Array.isArray(item.permissions) ? item.permissions.length : 0,
    }));

  const handleExportExcel = () => {
    exportToExcel('roles', 'Roles', buildExportRows());
  };

  const handleExportPdf = () => {
    const rows = buildExportRows();
    exportToPdf(
      'Reporte de Roles',
      'roles',
      ['ID', 'Nombre', 'CantidadPermisos'],
      rows.map((r) => [r.ID, r.Nombre, r.CantidadPermisos])
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Roles y Permisos</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
            <FaFileExcel /> Excel
          </button>
          <button onClick={handleExportPdf} className="px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition flex items-center gap-2">
            <FaFilePdf /> PDF
          </button>
          <button onClick={() => { resetForm(); crud.setShowForm(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <FaPlus /> Crear Rol
          </button>
        </div>
      </div>

      {crud.error && <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">{crud.error}</div>}

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{crud.editingId ? 'Editar Rol' : 'Crear Rol'}</h2>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-800"><FaTimes size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="text" placeholder="Nombre del Rol" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              <div>
                <label className="block text-sm font-semibold mb-3">Permisos:</label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.permissions.includes(perm.id)} onChange={() => handlePermissionChange(perm.id)} className="w-4 h-4" />
                      <span className="text-sm">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">Cancelar</button>
                <button type="submit" disabled={crud.loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">{crud.loading ? 'Procesando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={crud.deleteConfirm.open}
        title="Eliminar Rol"
        message="¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
        isDangerous={true}
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {crud.loading ? (
          <div className="p-8 text-center"><p>Cargando roles...</p></div>
        ) : crud.items.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No hay roles registrados</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Permisos</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {crud.items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{Array.isArray(item.permissions) ? item.permissions.length : 0} permisos</td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                      <FaEdit size={14} />
                    </button>
                    <button onClick={() => crud.handleDeleteClick(item.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
