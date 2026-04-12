import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { tipoSeguroRepository } from '../../../infrastructure/repositories/tipoSeguroRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notify } from '../../components/notifications/notify';
import CreateTipoSeguroForm from '../../components/forms/CreateTipoSeguroForm';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { FaFileExcel, FaFilePdf, FaPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

export default function AdminPlanesPage() {
  const crud = useCrudManager(tipoSeguroRepository);

  const handleFormSubmit = async (formData) => {
    try {
      if (crud.editingId) {
        const ok = await crud.handleUpdate(crud.editingId, formData);
        if (ok) {
          notify.success('Plan actualizado');
          crud.setShowForm(false);
          crud.setEditingId(null);
        }
      } else {
        const ok = await crud.handleCreate(formData);
        if (ok) {
          notify.success('Plan creado');
          crud.setShowForm(false);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando plan');
    }
  };

  const handleExportExcel = () => {
    exportToExcel(
      'tipos-seguro-gestion',
      'TiposSeguro',
      crud.items.map((item) => ({
        Codigo: item.codigo_interno || '-',
        Nombre: item.nombre || '-',
        Descripcion: item.descripcion || '-',
        Estado: item.estado ? 'Activo' : 'Inactivo',
      }))
    );
  };

  const handleExportPdf = () => {
    exportToPdf(
      'Reporte de Tipos de Seguro',
      'tipos-seguro-gestion',
      ['Codigo', 'Nombre', 'Descripcion', 'Estado'],
      crud.items.map((item) => [
        item.codigo_interno || '-',
        item.nombre || '-',
        item.descripcion || '-',
        item.estado ? 'Activo' : 'Inactivo',
      ])
    );
  };

  if (crud.loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin mr-3 text-2xl text-orange-600" />
        <span className="text-lg text-slate-600">Cargando planes...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestion de Planes</h1>
          <p className="text-sm text-slate-600 mt-1">Catálogo de tipos de seguro con descripción y estado</p>
        </div>

        <button
          onClick={() => {
            crud.setEditingId(null);
            crud.setShowForm(true);
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 justify-center"
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
      </div>

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateTipoSeguroForm
              editingData={crud.editingId ? crud.items.find((p) => p.id === crud.editingId) : null}
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
        <table className="w-full min-w-[1000px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold">Codigo</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Descripcion</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Estado</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {crud.items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm">{item.codigo_interno || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.nombre || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600 max-w-[420px]">{item.descripcion || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.estado ? 'Activo' : 'Inactivo'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { crud.setEditingId(item.id); crud.setShowForm(true); }} className="text-orange-600 hover:text-orange-800 mr-3"><FaEdit /></button>
                  <button onClick={() => crud.handleDeleteClick(item.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <ConfirmDialog
        open={crud.deleteConfirm.open}
        title="Eliminar Plan"
        message="Esta accion no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
      />
    </div>
  );
}
