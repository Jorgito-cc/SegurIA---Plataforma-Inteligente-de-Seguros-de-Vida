import { useState, useEffect } from "react";
import agentRepository from "../../../infrastructure/repositories/agentRepository";
import { notify } from "../../components/notifications/notify";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import CreateAgentForm from "../../components/forms/CreateAgentForm";
import ExportButtons from "../../components/ui/ExportButtons";

export default function AdminAgenciaAgentesPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState(null);

  useEffect(() => {
    cargarAgentes();
  }, []);

  const cargarAgentes = async () => {
    try {
      setLoading(true);
      const data = await agentRepository.obtenerTodos();
      setAgents(data);
    } catch (error) {
      notify.error("Error al cargar agentes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingData) {
        await agentRepository.actualizar(editingData.id, formData);
        notify.success("Agente actualizado");
      } else {
        await agentRepository.crear(formData);
        notify.success("Agente creado");
      }
      setShowForm(false);
      setEditingData(null);
      cargarAgentes();
    } catch (error) {
      notify.error("Error al guardar agente");
    }
  };

  const handleEdit = (agent) => {
    setEditingData(agent);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este agente?"))
      return;
    try {
      await agentRepository.eliminar(id);
      notify.success("Agente eliminado");
      cargarAgentes();
    } catch (error) {
      notify.error("Error al eliminar agente");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Agentes</h2>
          <p className="text-sm text-gray-500">Administra los agentes de seguros de la agencia</p>
        </div>
        <div className="flex items-center gap-4">
          <ExportButtons 
            title="Reporte de Agentes" 
            fileName="agentes" 
            columns={["Nombre", "Email", "CI", "Licencia", "Nivel", "Comisión", "Estado"]} 
            rows={agents.map(a => [
              `${a.first_name} ${a.last_name}`, 
              a.email, 
              a.ci, 
              a.codigo_licencia || '-', 
              a.nivel || '-', 
              `${a.comision_base_porcentaje || '0'}%`, 
              a.is_active ? 'Activo' : 'Inactivo'
            ])}
            dataObject={agents}
          />
          <button
            onClick={() => {
            setEditingData(null);
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FiPlus /> Nuevo Agente
        </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <CreateAgentForm
            editingData={editingData}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingData(null);
            }}
            loading={loading}
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Código
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Comisión
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Estado
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {agent.first_name} {agent.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{agent.ci}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{agent.email}</td>
                  <td className="px-6 py-4">{agent.codigo_licencia || "-"}</td>
                  <td className="px-6 py-4">{agent.nivel || "-"}</td>
                  <td className="px-6 py-4">
                    {agent.comision_base_porcentaje || "0"}%
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        agent.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {agent.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleEdit(agent)}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                    >
                      <FiEdit2 size={16} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
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
