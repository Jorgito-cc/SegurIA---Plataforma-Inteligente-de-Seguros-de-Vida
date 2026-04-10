import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { clientRepository } from '../../../infrastructure/repositories/clientRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notify } from '../../components/notifications/notify';
import CreateClientForm from '../../components/forms/CreateClientForm';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

export default function AdminClientesPage() {
  const crud = useCrudManager(clientRepository);

  const handleFormSubmit = async (formData) => {
    try {
      if (crud.editingId) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        const ok = await crud.handleUpdate(crud.editingId, payload);
        if (ok) {
          notify.success('Cliente actualizado');
          crud.setShowForm(false);
          crud.setEditingId(null);
        }
      } else {
        const ok = await crud.handleCreate(formData);
        if (ok) {
          notify.success('Cliente creado');
          crud.setShowForm(false);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando cliente');
    }
  };

  if (crud.loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin mr-3 text-2xl text-emerald-600" />
        <span className="text-lg text-slate-600">Cargando clientes...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-900">Gestion de Clientes</h1>
        <button
          onClick={() => {
            crud.setEditingId(null);
            crud.setShowForm(true);
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateClientForm
              editingData={crud.editingId ? crud.items.find((c) => c.id === crud.editingId) : null}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                crud.setShowForm(false);
                crud.setEditingId(null);
              }}
              loading={crud.loading}
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold">Usuario</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Correo</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {crud.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm">{item.username}</td>
                <td className="px-6 py-4 text-sm">{item.email}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { crud.setEditingId(item.id); crud.setShowForm(true); }} className="text-emerald-600 hover:text-emerald-800 mr-3"><FaEdit /></button>
                  <button onClick={() => crud.handleDeleteClick(item.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={crud.deleteConfirm.open}
        title="Eliminar Cliente"
        message="Esta accion no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
      />
    </div>
  );
}
