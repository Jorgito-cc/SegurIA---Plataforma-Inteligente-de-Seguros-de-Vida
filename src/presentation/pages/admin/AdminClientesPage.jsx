import { useState } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { clientRepository } from '../../../infrastructure/repositories/clientRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notify } from '../../components/notifications/notify';
import { FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

export default function AdminClientesPage() {
  const crud = useCrudManager(clientRepository);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    ci: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    genero: '',
    profesion_oficio: '',
    es_fumador: false,
    ingresos_mensuales: '',
    is_active: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (crud.editingId) {
        const success = await crud.handleUpdate(crud.editingId, formData);
        if (success) {
          notify.success('Cliente actualizado');
          resetForm();
        }
      } else {
        const success = await crud.handleCreate(formData);
        if (success) {
          notify.success('Cliente creado');
          resetForm();
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando cliente');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      username: item.username ?? '',
      email: item.email ?? '',
      password: '',
      first_name: item.first_name ?? '',
      last_name: item.last_name ?? '',
      ci: item.ci ?? '',
      telefono: item.telefono ?? '',
      direccion: item.direccion ?? '',
      fecha_nacimiento: item.fecha_nacimiento ?? '',
      genero: item.genero ?? '',
      profesion_oficio: item.profesion_oficio ?? '',
      es_fumador: Boolean(item.es_fumador),
      ingresos_mensuales: item.ingresos_mensuales ?? '',
      is_active: item.is_active ?? true,
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
      direccion: '',
      fecha_nacimiento: '',
      genero: '',
      profesion_oficio: '',
      es_fumador: false,
      ingresos_mensuales: '',
      is_active: true,
    });
    crud.setEditingId(null);
    crud.setShowForm(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
        <button
          onClick={() => {
            resetForm();
            crud.setShowForm(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <FaPlus /> Crear Cliente
        </button>
      </div>

      {crud.error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">{crud.error}</div>
      )}

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {crud.editingId ? 'Editar Cliente' : 'Crear Cliente'}
              </h2>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-800">
                <FaTimes size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Datos de Acceso</h3>
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
                      placeholder="email@correo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={crud.editingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-semibold mb-1">
                    Contraseña {crud.editingId && '(dejar vacío para no cambiar)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!crud.editingId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Datos Personales</h3>
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
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Cédula</label>
                    <input
                      type="text"
                      name="ci"
                      placeholder="Cédula de identidad"
                      value={formData.ci}
                      onChange={handleInputChange}
                      required
                      disabled={crud.editingId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      value={formData.fecha_nacimiento}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Género</label>
                    <select
                      name="genero"
                      value={formData.genero}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="O">Otro</option>
                    </select>
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
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Contacto</h3>
                <div>
                  <label className="block text-sm font-semibold mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    placeholder="Dirección completa"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Información de Riesgo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Profesión u Oficio</label>
                    <input
                      type="text"
                      name="profesion_oficio"
                      placeholder="Profesión"
                      value={formData.profesion_oficio}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Ingresos Mensuales</label>
                    <input
                      type="number"
                      name="ingresos_mensuales"
                      placeholder="Monto"
                      value={formData.ingresos_mensuales}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="es_fumador"
                      checked={formData.es_fumador}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold">Es fumador</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Cliente Activo</span>
                </label>
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

      <ConfirmDialog
        open={crud.deleteConfirm.open}
        title="Eliminar Cliente"
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
        isDangerous={true}
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {crud.loading ? (
          <div className="p-8 text-center"><p>Cargando clientes...</p></div>
        ) : crud.items.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No hay clientes registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Usuario</th>
                <th className="px-4 py-3 text-left font-semibold">Correo</th>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {crud.items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{item.username}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.first_name} {item.last_name}</td>
                  <td className="px-4 py-3">{item.telefono || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      title="Editar"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => crud.handleDeleteClick(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
