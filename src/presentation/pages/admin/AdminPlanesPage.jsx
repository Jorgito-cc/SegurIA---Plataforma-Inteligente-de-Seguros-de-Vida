import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { tipoSeguroRepository } from '../../../infrastructure/repositories/tipoSeguroRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import CreateTipoSeguroForm from '../../components/forms/CreateTipoSeguroForm';
import { FaPlus, FaEdit, FaTrash, FaFileExcel, FaFilePdf, FaSpinner } from 'react-icons/fa';

export default function AdminPlanesPage() {
  const crud = useCrudManager(tipoSeguroRepository);

  const handleFormSubmit = async (formData) => {
    try {
      if (crud.editingId) {
        const success = await crud.handleUpdate(crud.editingId, formData);
        if (success) {
          notify.success('Tipo de seguro actualizado exitosamente');
          crud.setShowForm(false);
          crud.setEditingId(null);
        }
      } else {
        const success = await crud.handleCreate(formData);
        if (success) {
          notify.success('Tipo de seguro creado exitosamente');
          crud.setShowForm(false);
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando tipo de seguro');
    }
  };

  const handleEdit = (item) => {
    crud.setEditingId(item.id);
    crud.setEditingData(item);
    crud.setShowForm(true);
  };

  const buildExportRows = () =>
    crud.items.map((item) => ({
      'Código Interno': item.codigo_interno,
      Nombre: item.nombre,
      Descripción: item.descripcion,
      Estado: item.estado ? 'Activo' : 'Inactivo',
    }));

  const handleExportExcel = () => {
    exportToExcel('tipos-seguros', 'Tipos de Seguros', buildExportRows());
  };

  const handleExportPdf = () => {
    const rows = buildExportRows();
    exportToPdf(
      'Reporte de Tipos de Seguros',
      'tipos-seguros',
      ['Código Interno', 'Nombre', 'Descripción', 'Estado'],
      rows.map((r) => [r['Código Interno'], r.Nombre, r.Descripción, r.Estado])
    );
  };

  if (crud.loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin mr-3 text-2xl text-orange-600" />
        <span className="text-lg text-slate-600">Cargando tipos de seguros...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestión de Tipos de Seguros</h1>
          <p className="text-sm text-slate-600 mt-1">{crud.items.length} tipo(s) de seguro(s) en el sistema</p>
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
            className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
          >
            <FaPlus /> Nuevo Tipo
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
            <CreateTipoSeguroForm
              editingData={crud.editingId ? crud.items.find((t) => t.id === crud.editingId) : null}
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

      {/* Tabla de Tipos de Seguros */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
        {crud.items.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No hay tipos de seguros registrados. Cree uno para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Código Interno</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Nombre</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Descripción</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Estado</th>
                  <th className="px-6 py-3 text-right text-sm font-bold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {crud.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-800 font-mono font-semibold">
                      {item.codigo_interno}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{item.nombre}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="line-clamp-2">{item.descripcion}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.estado
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-orange-600 hover:text-orange-800 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() =>
                          crud.setDeleteConfirm({
                            show: true,
                            id: item.id,
                            name: item.nombre,
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
          title="Eliminar Tipo de Seguro"
          message={`¿Está seguro de que desea eliminar "${crud.deleteConfirm.name}"?`}
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
