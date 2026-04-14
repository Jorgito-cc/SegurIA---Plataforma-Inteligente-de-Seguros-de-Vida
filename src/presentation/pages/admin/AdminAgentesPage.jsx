import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notify } from '../../components/notifications/notify';
import CreateAgentForm from '../../components/forms/CreateAgentForm';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaSyncAlt, FaToggleOff, FaToggleOn, FaFileExcel, FaFilePdf } from 'react-icons/fa';

export default function AdminAgentesPage() {
  const crud = useCrudManager(agentRepository);

  const handleFormSubmit = async (formData) => {
    try {
      if (crud.editingId) {
        const ok = await crud.handleUpdate(crud.editingId, formData);
        if (ok) {
          notify.success('Agente actualizado');
          crud.setShowForm(false);
          crud.setEditingId(null);
        }
      } else {
        const ok = await crud.handleCreate(formData);
        if (ok) {
          notify.success('Agente creado');
          crud.setShowForm(false);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando agente');
    }
  };

  const openEdit = (item) => {
    crud.setEditingId(item.id);
    crud.setShowForm(true);
  };

  const handleToggleStatus = async (item) => {
    try {
      // ⚠️ Solo enviamos los campos editables
      const ok = await crud.handleUpdate(item.id, {
        telefono: item.telefono || '',
        codigo_licencia: item.codigo_licencia || '',
        fecha_ingreso: item.fecha_ingreso || '',
        nivel: item.nivel || '',
        comision_base_porcentaje: item.comision_base_porcentaje || '0',
        sucursal: item.sucursal || '',
        is_active: !item.is_active,
      });
      if (ok) {
        notify.success(item.is_active ? 'Agente deshabilitado' : 'Agente habilitado');
      } else {
        notify.error(crud.error || 'No se pudo actualizar el estado del agente');
      }
    } catch (err) {
      notify.error(err.message || 'Error cambiando estado');
    }
  };

  const handleExportExcel = () => {
    exportToExcel(
      'agentes-gestion',
      'Agentes',
      crud.items.map((item) => ({
        Usuario: item.username,
        Correo: item.email,
        Nombre: item.first_name || '-',
        Apellido: item.last_name || '-',
        CI: item.ci || '-',
        Telefono: item.telefono || '-',
        Codigo_Licencia: item.codigo_licencia || '-',
        Fecha_Ingreso: item.fecha_ingreso || '-',
        Nivel: item.nivel || '-',
        Comision_Base_Porcentaje: item.comision_base_porcentaje ?? '-',
        Sucursal: item.sucursal || '-',
        Estado: item.is_active ? 'Activo' : 'Inactivo',
      }))
    );
  };

  const handleExportPdf = () => {
    exportToPdf(
      'Reporte de Agentes',
      'agentes-gestion',
      ['Usuario', 'Correo', 'Nombre', 'Apellido', 'CI', 'Telefono', 'Codigo', 'Ingreso', 'Nivel', 'Comision %', 'Sucursal', 'Estado'],
      crud.items.map((item) => [
        item.username,
        item.email,
        item.first_name || '-',
        item.last_name || '-',
        item.ci || '-',
        item.telefono || '-',
        item.codigo_licencia || '-',
        item.fecha_ingreso || '-',
        item.nivel || '-',
        item.comision_base_porcentaje ?? '-',
        item.sucursal || '-',
        item.is_active ? 'Activo' : 'Inactivo',
      ])
    );
  };

  if (crud.loading && crud.items.length === 0) {
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
        <h1 className="text-3xl font-black text-slate-900">Gestion de Agentes</h1>
        <button
          onClick={() => {
            crud.setEditingId(null);
            crud.setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Nuevo
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <FaFileExcel /> Excel
        </button>
        <button
          onClick={handleExportPdf}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <FaFilePdf /> PDF
        </button>
        <button
          onClick={() => crud.loadItems(crud.currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaSyncAlt /> Recargar
        </button>
      </div>

      {crud.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {crud.error}
        </div>
      )}

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateAgentForm
              key={crud.editingId ? `edit-${crud.editingId}` : 'create'}
              editingData={crud.editingId ? crud.items.find((a) => String(a.id) === String(crud.editingId)) : null}
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

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[1300px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold">Usuario</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Correo</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Apellido</th>
              <th className="px-6 py-3 text-left text-sm font-bold">CI</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Telefono</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Codigo</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Fecha Ingreso</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Nivel</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Comision %</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Sucursal</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Estado</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {crud.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm">{item.username}</td>
                <td className="px-6 py-4 text-sm">{item.email}</td>
                <td className="px-6 py-4 text-sm">{item.first_name || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.last_name || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.ci || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.telefono || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.codigo_licencia || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.fecha_ingreso || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.nivel || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.comision_base_porcentaje ?? '-'}</td>
                <td className="px-6 py-4 text-sm">{item.sucursal || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3" title="Editar"><FaEdit /></button>
                  <button onClick={() => handleToggleStatus(item)} className="text-amber-600 hover:text-amber-800 mr-3" title={item.is_active ? 'Deshabilitar' : 'Habilitar'}>
                    {item.is_active ? <FaToggleOff /> : <FaToggleOn />}
                  </button>
                  <button onClick={() => crud.handleDeleteClick(item.id)} className="text-red-600 hover:text-red-800" title="Eliminar"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <ConfirmDialog
        open={crud.deleteConfirm.open}
        title="Eliminar Agente"
        message="Esta accion no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
      />
    </div>
  );
}
