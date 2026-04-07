import { useState } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { tipoSeguroRepository } from '../../../infrastructure/repositories/tipoSeguroRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaFileExcel, FaFilePdf } from 'react-icons/fa';

export default function AdminPlanesPage() {
  const crud = useCrudManager(tipoSeguroRepository);
  const [formData, setFormData] = useState({
    codigo_interno: '',
    nombre: '',
    descripcion: '',
    estado: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (crud.editingId) {
        const success = await crud.handleUpdate(crud.editingId, formData);
        if (success) {
          notify.success('Tipo de seguro actualizado');
          resetForm();
        }
      } else {
        const success = await crud.handleCreate(formData);
        if (success) {
          notify.success('Tipo de seguro creado');
          resetForm();
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando tipo de seguro');
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    crud.setEditingId(item.id);
    crud.setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ codigo_interno: '', nombre: '', descripcion: '', estado: true });
    crud.setEditingId(null);
    crud.setShowForm(false);
  };

  const buildExportRows = () =>
    crud.items.map((item) => ({
      Codigo: item.codigo_interno,
      Nombre: item.nombre,
      Descripcion: item.descripcion || '-',
      Estado: item.estado ? 'Activo' : 'Inactivo',
    }));

  const handleExportExcel = () => {
    exportToExcel('tipos-seguro', 'TiposSeguro', buildExportRows());
  };

  const handleExportPdf = () => {
    const rows = buildExportRows();
    exportToPdf(
      'Reporte de Tipos de Seguro',
      'tipos-seguro',
      ['Codigo', 'Nombre', 'Descripcion', 'Estado'],
      rows.map((r) => [r.Codigo, r.Nombre, r.Descripcion, r.Estado])
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Tipos de Seguro</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
            <FaFileExcel /> Excel
          </button>
          <button onClick={handleExportPdf} className="px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition flex items-center gap-2">
            <FaFilePdf /> PDF
          </button>
          <button onClick={() => { resetForm(); crud.setShowForm(true); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <FaPlus /> Crear Tipo
          </button>
        </div>
      </div>

      {crud.error && <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">{crud.error}</div>}

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{crud.editingId ? 'Editar' : 'Crear'} Tipo de Seguro</h2>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-800"><FaTimes size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="text" name="codigo_interno" placeholder="Código (ej: VIDA)" value={formData.codigo_interno} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"></textarea>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="estado" checked={formData.estado} onChange={handleInputChange} className="w-4 h-4" />
                <span>Activo</span>
              </label>
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
        title="Eliminar Tipo de Seguro"
        message="¿Estás seguro de que deseas eliminar este tipo de seguro? Esta acción no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
        isDangerous={true}
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {crud.loading ? (
          <div className="p-8 text-center"><p>Cargando tipos de seguro...</p></div>
        ) : crud.items.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No hay tipos de seguro registrados</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {crud.items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-semibold">{item.codigo_interno}</td>
                  <td className="px-4 py-3 text-sm">{item.nombre}</td>
                  <td className="px-4 py-3 text-sm"><span className={`px-2 py-1 rounded text-xs font-semibold ${item.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.estado ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"><FaEdit size={14} /></button>
                    <button onClick={() => crud.handleDeleteClick(item.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"><FaTrash size={14} /></button>
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
