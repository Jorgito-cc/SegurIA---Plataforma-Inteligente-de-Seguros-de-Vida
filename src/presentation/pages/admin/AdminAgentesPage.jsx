import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notify } from '../../components/notifications/notify';
import CreateAgentForm from '../../components/forms/CreateAgentForm';
import { FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

export default function AdminAgentesPage() {
  const crud = useCrudManager(agentRepository);

  const handleFormSubmit = async (formData) => {
    try {
      if (crud.editingId) {
        const updatePayload = { ...formData };
        if (!updatePayload.password) delete updatePayload.password;
        const success = await crud.handleUpdate(crud.editingId, updatePayload);
        if (success) {
          notify.success('Agente actualizado exitosamente');
          crud.setShowForm(false);
          crud.setEditingId(null);
        }
      } else {
        const success = await crud.handleCreate(formData);
        if (success) {
          notify.success('Agente creado exitosamente');
          crud.setShowForm(false);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando agente');
    }
  };

  const handleEdit = (item) => {
    crud.setEditingId(item.id);
    crud.setShowForm(true);
  };

  if (crud.loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin mr-3 text-2xl text-blue-600" />
        <span className="text-lg text-slate-600">Cargando agentes...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestión de Agentes</h1>
          <p className="text-sm text-slate-600 mt-1">{crud.items.length} agente(s)</p>
        </div>
        <button
          onClick={() => {
            crud.setEditingId(null);
            crud.setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      {crud.error && <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{crud.error}</div>}

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateAgentForm
              editingData={crud.editingId ? crud.items.find((a) => a.id === crud.editingId) : null}
              onSubmit={handleFormSubmit}
              onCancel={() => { crud.setShowForm(false); crud.setEditingId(null); }}
              loading={crud.loading}
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
        {crud.items.length === 0 ? (
          <div className="p-8 text-center text-slate-500"><p>No hay agentes.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold">Usuario</th>
                  <th className="px-6 py-3 text-left text-sm font-bold">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-bold">Correo</th>
                  <th className="px-6 py-3 text-left text-sm font-bold">Teléfono</th>
                  <th className="px-6 py-3 text-right text-sm font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {crud.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm">{item.username}</td>
                    <td className="px-6 py-4 text-sm">{item.first_name}</td>
                    <td className="px-6 py-4 text-sm">{item.email}</td>
                    <td className="px-6 py-4 text-sm">{item.telefono}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3"><FaEdit /></button>
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