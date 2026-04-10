import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import CreateAgentForm from '../../components/forms/CreateAgentForm';
import { FaPlus, FaEdit, FaTrash, FaFileExcel, FaFilePdf, FaSpinner } from 'react-icons/fa';

export default function AdminAgentesPage() {
  const crud = useCrudManager(agentRepository);

  const handleFormSubmit = async (formData) => {
    try {
      if (crud.editingId) {
        const updatePayload = { ...formData };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
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
    crud.setEditingData(item);
    crud.setShowForm(true);
  };

  const buildExportRows = () =>
    crud.items.map((item) => ({
      Usuario: item.username,
      Correo: item.email,
      Nombre: `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      Cedula: item.ci || '-',
      Telefono: item.telefono || '-',
      Licencia: item.codigo_licencia || '-',
      FechaIngreso: item.fecha_ingreso || '-',
      Nivel: item.nivel || '-',
      Comision: item.comision_base_porcentaje ?? '-',
      Sucursal: item.sucursal || '-',
      Estado: item.is_active ? 'Activo' : 'Inactivo',
    }));

  const handleExportExcel = () => {
    exportToExcel('agentes', 'Agentes', buildExportRows());
  };

  const handleExportPdf = () => {
    const rows = buildExportRows();
    exportToPdf(
      'Reporte de Agentes',
      'agentes',
      ['Usuario', 'Correo', 'Nombre', 'Cedula', 'Telefono', 'Licencia', 'FechaIngreso', 'Nivel', 'Comision', 'Sucursal', 'Estado'],
      rows.map((r) => [
        r.Usuario,
        r.Correo,
        r.Nombre,
        r.Cedula,
        r.Telefono,
        r.Licencia,
        r.FechaIngreso,
        r.Nivel,
        r.Comision,
        r.Sucursal,
        r.Estado,
      ])
    );
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
          <p className="text-sm text-slate-600 mt-1">{crud.items.length} agente(s) en el sistema</p>
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
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaPlus /> Nuevo Agente
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
            <CreateAgentForm
              editingData={crud.editingId ? crud.items.find((a) => a.id === crud.editingId) : null}
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

      {/* Tabla de Agentes */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
        {crud.items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No hay agentes registrados. Cree uno para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Usuario</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Correo</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Teléfono</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Licencia</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Nivel</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Comisión %</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Estado</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {crud.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-800 font-medium">{item.username}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.first_name} {item.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.telefono || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{item.codigo_licencia || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.nivel || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.comision_base_porcentaje || '-'}%</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() =>
                          crud.setDeleteConfirm({
                            show: true,
                            id: item.id,
                            name: `${item.first_name} ${item.last_name}`,
                          })
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmación de Eliminación */}
      {crud.deleteConfirm.show && (
        <ConfirmDialog
          title="Eliminar Agente"
          message={`¿Está seguro de que desea eliminar a ${crud.deleteConfirm.name}?`}
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