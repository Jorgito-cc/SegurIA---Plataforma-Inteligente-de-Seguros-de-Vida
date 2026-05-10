import { useState, useEffect } from "react";
import { tipoSeguroRepository } from "../../../infrastructure/repositories/tipoSeguroRepository";
import { notify } from "../../components/notifications/notify";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function AdminAgenciaPlanesPage() {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    codigo_interno: "",
    nombre: "",
    descripcion: "",
    estado: true,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    cargarPlanes();
  }, []);

  const cargarPlanes = async () => {
    try {
      setLoading(true);
      const data = await tipoSeguroRepository.obtenerTodos();
      setPlanes(data);
    } catch (error) {
      notify.error("Error al cargar los planes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await tipoSeguroRepository.actualizar(editingId, formData);
        notify.success("Plan actualizado");
      } else {
        await tipoSeguroRepository.crear(formData);
        notify.success("Plan creado");
      }
      setFormData({
        codigo_interno: "",
        nombre: "",
        descripcion: "",
        estado: true,
      });
      setEditingId(null);
      setShowForm(false);
      cargarPlanes();
    } catch (error) {
      notify.error("Error al guardar el plan");
    }
  };

  const handleEdit = (plan) => {
    setFormData(plan);
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este plan?"))
      return;
    try {
      await tipoSeguroRepository.eliminar(id);
      notify.success("Plan eliminado");
      cargarPlanes();
    } catch (error) {
      notify.error("Error al eliminar el plan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestión de Planes/Tipos de Seguro
        </h2>
        <button
          onClick={() => {
            setFormData({
              codigo_interno: "",
              nombre: "",
              descripcion: "",
              estado: true,
            });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FiPlus /> Nuevo Plan
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold">
            {editingId ? "Editar" : "Crear"} Plan
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Interno
              </label>
              <input
                type="text"
                value={formData.codigo_interno}
                onChange={(e) =>
                  setFormData({ ...formData, codigo_interno: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="estado"
              checked={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.checked })
              }
              className="rounded"
            />
            <label
              htmlFor="estado"
              className="text-sm font-medium text-gray-700"
            >
              Activo
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {planes.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{plan.codigo_interno}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {plan.nombre}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {plan.descripcion}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.estado
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {plan.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <FiEdit2 size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                    >
                      <FiTrash2 size={16} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
