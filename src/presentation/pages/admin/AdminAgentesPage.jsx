import { useState } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { notify } from '../../components/notifications/notify';
import { FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

export default function AdminAgentesPage() {
  const crud = useCrudManager(agentRepository);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    ci: '',
    codigo_licencia: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    nivel: 'Junior',
    comision_base_porcentaje: '0',
    sucursal: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (crud.editingId) {
        const success = await crud.handleUpdate(crud.editingId, formData);
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

  const handleEdit = (item) => {
    setFormData(item);
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
      codigo_licencia: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      nivel: 'Junior',
      comision_base_porcentaje: '0',
      sucursal: '',
    });
    crud.setEditingId(null);
    crud.setShowForm(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Agentes</h1>
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

      {crud.error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg mb-4">
          {crud.error}
        </div>
      )}

      {/* Formulario Modal */}
      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="username"
                  placeholder="Usuario"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={crud.editingId}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Correo"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {!crud.editingId && (
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña (mín 8 caracteres)"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Nombre"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Apellido"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="ci"
                  placeholder="Cédula"
                  value={formData.ci}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="codigo_licencia"
                  placeholder="Código Licencia"
                  value={formData.codigo_licencia}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  name="fecha_ingreso"
                  value={formData.fecha_ingreso}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <select
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Gerente">Gerente</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="comision_base_porcentaje"
                  placeholder="Comisión %"
                  value={formData.comision_base_porcentaje}
                  onChange={handleInputChange}
                  step="0.01"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  name="sucursal"
                  placeholder="Sucursal"
                  value={formData.sucursal}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
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

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {crud.loading ? (
          <div className="p-8 text-center"><p>Cargando agentes...</p></div>
        ) : crud.items.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No hay agentes registrados
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Usuario</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Correo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Licencia</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nivel</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {crud.items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.id}</td>
                  <td className="px-4 py-3 text-sm">{item.username}</td>
                  <td className="px-4 py-3 text-sm">{item.email}</td>
                  <td className="px-4 py-3 text-sm">{item.first_name} {item.last_name}</td>
                  <td className="px-4 py-3 text-sm">{item.codigo_licencia}</td>
                  <td className="px-4 py-3 text-sm">{item.nivel}</td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => crud.handleDelete(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
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