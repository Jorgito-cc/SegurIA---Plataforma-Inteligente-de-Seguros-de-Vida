import { useEffect, useState } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { roleRepository } from '../../../infrastructure/repositories/roleRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import CreateRoleForm from '../../components/forms/CreateRoleForm';
import { FaPlus, FaEdit, FaTrash, FaFileExcel, FaFilePdf, FaSpinner } from 'react-icons/fa';

export default function AdminRolesPage() {
  const crud = useCrudManager(roleRepository);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      await roleRepository.getPermissions();
    } catch (error) {
      notify.error('Error al cargar permisos');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (crud.editingId) {
        const success = await crud.handleUpdate(crud.editingId, formData);
        if (success) {
          notify.success('Rol actualizado exitosamente');
          crud.setShowForm(false);
          crud.setEditingId(null);
        }
      } else {
        const success = await crud.handleCreate(formData);
        if (success) {
          notify.success('Rol creado exitosamente');
          crud.setShowForm(false);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando rol');
    }
  };

  const handleEdit = (item) => {
    crud.setEditingId(item.id);
    crud.setEditingData(item);
    crud.setShowForm(true);
  };

  const buildExportRows = () =>
    crud.items.map((item) => ({
      ID: item.id,
      Nombre: item.name,
      'Número de Permisos': Array.isArray(item.permissions) ? item.permissions.length : 0,
      Permisos: Array.isArray(item.permissions)
        ? item.permissions.map((p) => (typeof p === 'object' ? p.name : p)).join(', ')
        : '',
    }));

  const handleExportExcel = () => {
    exportToExcel('roles', 'Roles', buildExportRows());
  };

  const handleExportPdf = () => {
    const rows = buildExportRows();
    exportToPdf(
      'Reporte de Roles',
      'roles',
      ['ID', 'Nombre', 'Número de Permisos'],
      rows.map((r) => [r.ID, r.Nombre, r['Número de Permisos']])
    );
  };

  if (crud.loading || loadingPermissions) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin mr-3 text-2xl text-violet-600" />
        <span className="text-lg text-slate-600">Cargando roles...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestión de Roles</h1>
          <p className="text-sm text-slate-600 mt-1">{crud.items.length} rol(es) en el sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <FaFileExcel /> Excel
          </button>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <FaFilePdf /> PDF
          </button>
          <button
            onClick={() => {
              crud.setEditingId(null);
              crud.setEditingData(null);
              crud.setShowForm(true);
            }}
            className="px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 transition flex items-center gap-2"
          >
            <FaPlus /> Nuevo Rol
          </button>
        </div>
      </div>

      {crud.error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{crud.error}</div>
      )}

      {/* Modal del Formulario */}
      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateRoleForm
              editingData={crud.editingId ? crud.items.find((r) => r.id === crud.editingId) : null}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                crud.setShowForm(false);
                crud.setEditingId(null);
              }}
              loading={crud.creating || crud.updating}
            />
          </div>
        </div>
      )}

      {/* Tabla de Roles */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
        {crud.items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No hay roles registrados. Cree uno para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Nombre del Rol</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Cantidad de Permisos</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Permisos Asignados</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {crud.items.map((item) => {
                  const permissionsArray = Array.isArray(item.permissions) ? item.permissions : [];
                  const permissionCount = permissionsArray.length;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm text-slate-800 font-mono font-semibold">{item.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center justify-center bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-xs font-bold min-w-[2.5rem]">
                          {permissionCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {permissionCount === 0 ? (
                            <span className="text-slate-400 italic">Sin permisos</span>
                          ) : permissionCount <= 3 ? (
                            permissionsArray.map((perm) => (
                              <span
                                key={typeof perm === 'object' ? perm.id : perm}
                                className="inline-block bg-violet-50 text-violet-700 px-2 py-1 rounded text-xs"
                              >
                                {typeof perm === 'object' ? perm.name : perm}
                              </span>
                            ))
                          ) : (
                            <>
                              {permissionsArray.slice(0, 2).map((perm) => (
                                <span
                                  key={typeof perm === 'object' ? perm.id : perm}
                                  className="inline-block bg-violet-50 text-violet-700 px-2 py-1 rounded text-xs"
                                >
                                  {typeof perm === 'object' ? perm.name : perm}
                                </span>
                              ))}
                              <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                                +{permissionCount - 2}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-violet-600 hover:text-violet-800 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            crud.setDeleteConfirm({
                              show: true,
                              id: item.id,
                              name: item.name,
                            })
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmación de Eliminación */}
      {crud.deleteConfirm.show && (
        <ConfirmDialog
          title="Eliminar Rol"
          message={`¿Está seguro de que desea eliminar el rol "${crud.deleteConfirm.name}"?`}
          onConfirm={() => {
            crud.handleDelete(crud.deleteConfirm.id);
            crud.setDeleteConfirm({ show: false, id: null, name: '' });
          }}
          onCancel={() => crud.setDeleteConfirm({ show: false, id: null, name: '' })}
          loading={crud.deleting}
        />
      )}
    </div>
  );
}
