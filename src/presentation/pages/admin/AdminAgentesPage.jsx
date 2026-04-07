import { useState } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaFileExcel, FaFilePdf } from 'react-icons/fa';

export default function AdminAgentesPage() {
  const crud = useCrudManager(agentRepository);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    ci: '',
    telefono: '',
    codigo_licencia: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    nivel: 'Junior',
    comision_base_porcentaje: '0',
    sucursal: '',
    is_active: true,
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
        const updatePayload = { ...formData };
        if (!updatePayload.password) {
          delete updatePayload.password;
        }
        const success = await crud.handleUpdate(crud.editingId, updatePayload);
        if (success) {
          notify.success('Agente actualizado');
          resetForm();
        }
      } else {
        const success = await crud.handleCreate(formData);
        if (success) {
          notify.success('Agente creado');
          resetForm();
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando agente');
    }
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

  const handleEdit = (item) => {
    setFormData({
      ...item,
      password: '', // No mostrar password actual
    });
    crud.setEditingId(item.id);
    crud.setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      ci: '',
      telefono: '',
      codigo_licencia: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      nivel: 'Junior',
      comision_base_porcentaje: '0',
      sucursal: '',
      is_active: true,
    });
    crud.setEditingId(null);
    crud.setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Agentes</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportExcel} className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
            <FaFileExcel /> Excel
          </button>
          <button onClick={handleExportPdf} className="px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition flex items-center gap-2">
            <FaFilePdf /> PDF
          </button>
          <button
            onClick={() => {
              resetForm();
              crud.setShowForm(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <FaPlus /> Crear Agente
          </button>
        </div>
      </div>

      {crud.error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">{crud.error}</div>
      )}

      {/* Formulario Modal */}
      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {crud.editingId ? 'Editar Agente' : 'Crear Agente'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Fila 1: Datos básicos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Usuario</label>
                  <input
                    type="text"
                    name="username"
                    placeholder="usuario"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={crud.editingId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Correo</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email@seguria.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Contraseña {crud.editingId && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña (mín 8 caracteres)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!crud.editingId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Fila 2: Nombres */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nombre</label>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Nombre"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Apellido</label>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Apellido"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fila 3: Documento y teléfono */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Cédula</label>
                  <input
                    type="text"
                    name="ci"
                    placeholder="Cédula de identidad"
                    value={formData.ci}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fila 4: Licencia */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Código de Licencia</label>
                  <input
                    type="text"
                    name="codigo_licencia"
                    placeholder="Ej: LIC-V-2026-009"
                    value={formData.codigo_licencia}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Fecha de Ingreso</label>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={formData.fecha_ingreso}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fila 5: Nivel y Comisión */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nivel</label>
                  <select
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Gerente">Gerente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Comisión Base (%)</label>
                  <input
                    type="number"
                    name="comision_base_porcentaje"
                    placeholder="12.50"
                    value={formData.comision_base_porcentaje}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Fila 6: Sucursal y estado */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Sucursal</label>
                  <input
                    type="text"
                    name="sucursal"
                    placeholder="Sucursal where agent works"
                    value={formData.sucursal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">Activo</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={crud.loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {crud.loading ? 'Procesando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={crud.deleteConfirm.open}
        title="Eliminar Agente"
        message="¿Estás seguro de que deseas eliminar este agente? Esta acción no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
        isDangerous={true}
      />

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {crud.loading ? (
          <div className="p-8 text-center"><p>Cargando agentes...</p></div>
        ) : crud.items.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No hay agentes registrados</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Correo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cédula</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Licencia</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Fecha ingreso</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nivel</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Comisión</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sucursal</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {crud.items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm">{item.username}</td>
                  <td className="px-4 py-3 text-sm">{item.email}</td>
                  <td className="px-4 py-3 text-sm">{item.first_name} {item.last_name}</td>
                  <td className="px-4 py-3 text-sm">{item.ci}</td>
                  <td className="px-4 py-3 text-sm">{item.telefono || '-'}</td>
                  <td className="px-4 py-3 text-sm">{item.codigo_licencia}</td>
                  <td className="px-4 py-3 text-sm">{item.fecha_ingreso || '-'}</td>
                  <td className="px-4 py-3 text-sm">{item.nivel}</td>
                  <td className="px-4 py-3 text-sm">{item.comision_base_porcentaje}%</td>
                  <td className="px-4 py-3 text-sm">{item.sucursal || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition"
                      title="Editar"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => crud.handleDeleteClick(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition"
                      title="Eliminar"
                    >
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