import { useEffect, useState } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { roleRepository } from '../../../infrastructure/repositories/roleRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notify } from '../../components/notifications/notify';
import CreateRoleForm from '../../components/forms/CreateRoleForm';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

export default function AdminRolesPage() {
  const crud = useCrudManager(roleRepository);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingPermissions(true);
        await roleRepository.getPermissions();
      } catch {
        notify.error('Error al cargar permisos');
      } finally {
        setLoadingPermissions(false);
      }
    };
    load();
  }, []);

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
    crud.setShowForm(true);
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
          <p className="text-sm text-slate-600 mt-1">{crud.items.length} rol(es)</p>
        </div>
        <button
          onClick={() => {
            crud.setEditingId(null);
            crud.setShowForm(true);
          }}
          className="px-4 py-2 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      {crud.error && <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{crud.error}</div>}

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateRoleForm
              editingData={crud.editingId ? crud.items.find((r) => r.id === crud.editingId) : null}
              onSubmit={handleFormSubmit}
              onCancel={() => { crud.setShowForm(false); crud.setEditingId(null); }}
              loading={crud.loading}
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
        {crud.items.length === 0 ? (
          <div className="p-8 text-center text-slate-500"><p>No hay roles.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-bold">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-bold">Permisos</th>
                  <th className="px-6 py-3 text-right text-sm font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {crud.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm">{item.id}</td>
                    <td className="px-6 py-4 text-sm">{item.name}</td>
                    <td className="px-6 py-4 text-sm">{Array.isArray(item.permissions) ? item.permissions.length : 0}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(item)} className="text-violet-600 hover:text-violet-800 mr-3"><FaEdit /></button>
                      <button onClick={() => crud.handleDeleteClick(item.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {crud.deleteConfirm.open && (
        <ConfirmDialog title="Confirmar" message="¿Está seguro?" onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)} onCancel={() => crud.setDeleteConfirm({ open: false, id: null })} loading={crud.loading} />
      )}
    </div>
  );
}