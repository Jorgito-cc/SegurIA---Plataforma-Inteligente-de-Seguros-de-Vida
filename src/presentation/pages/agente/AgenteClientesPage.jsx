import { useState, useEffect, useMemo } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import CreateClientForm from '../../components/forms/CreateClientForm';
import { notify } from '../../components/notifications/notify';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FiUsers, FiUserPlus, FiSearch } from 'react-icons/fi';

export default function AgenteClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.clientes);
      // El backend con ModelViewSet y PageNumberPagination devuelve { count, next, previous, results }
      setClientes(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      notify.error('No se pudo cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleAdd = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeletingClientId(id);
  };

  const confirmDelete = async () => {
    try {
      await apiClient.delete(`${ENDPOINTS.clientes}${deletingClientId}/`);
      notify.success('Cliente eliminado correctamente');
      fetchClientes();
    } catch (error) {
      notify.error('Error al eliminar cliente');
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingClient) {
        await apiClient.patch(`${ENDPOINTS.clientes}${editingClient.id}/`, data);
        notify.success('Cliente actualizado con éxito');
      } else {
        // Para crear un cliente, el backend espera los campos de RegistroSerializer
        // Asegúrate de que el rol se maneje correctamente si es necesario
        await apiClient.post(ENDPOINTS.clientes, data);
        notify.success('Cliente registrado con éxito');
      }
      setShowForm(false);
      fetchClientes();
    } catch (error) {
      const errorMsg = error.response?.data ? Object.values(error.response.data).flat()[0] : 'Error al procesar cliente';
      notify.error(errorMsg);
    }
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter(c => 
      c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ci?.includes(searchTerm)
    );
  }, [clientes, searchTerm]);

  const columns = [
    { key: 'first_name', label: 'Nombre' },
    { key: 'last_name', label: 'Apellido' },
    { key: 'email', label: 'Correo' },
    { key: 'ci', label: 'Cédula' },
    { 
      key: 'is_active', 
      label: 'Estado',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <FiUsers className="text-emerald-600" /> Mis Clientes
          </h1>
          <p className="text-slate-500">Gestiona la cartera de clientes de tu agencia.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-200"
        >
          <FiUserPlus /> Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o cédula..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filteredClientes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateClientForm
              editingData={editingClient}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {deletingClientId && (
        <ConfirmDialog
          title="Eliminar Cliente"
          message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
          onConfirm={confirmDelete}
          onCancel={() => setDeletingClientId(null)}
          confirmText="Eliminar"
          type="danger"
        />
      )}
    </div>
  );
}
