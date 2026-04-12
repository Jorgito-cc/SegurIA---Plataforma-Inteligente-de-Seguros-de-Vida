import { useEffect, useMemo, useState } from 'react';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { clientRepository } from '../../../infrastructure/repositories/clientRepository';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { notify } from '../../components/notifications/notify';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import CreateAgentForm from '../../components/forms/CreateAgentForm';
import CreateClientForm from '../../components/forms/CreateClientForm';
import { FaEdit, FaFileExcel, FaFilePdf, FaFilter, FaSearch, FaSpinner, FaUserCheck, FaUserFriends, FaUsers, FaTrash, FaToggleOff, FaToggleOn } from 'react-icons/fa';

function StatCard({ title, value, tone = 'blue' }) {
  const tones = {
    blue: 'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-500 to-green-600',
    violet: 'from-violet-500 to-fuchsia-600',
    slate: 'from-slate-600 to-slate-800',
  };

  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${tones[tone] || tones.blue}`}>
      <p className="text-sm font-medium opacity-90">{title}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

export default function AdminUsuariosPage() {
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [agentsResponse, clientsResponse] = await Promise.all([
        agentRepository.list(1, 500),
        clientRepository.list(1, 500),
      ]);

      const agentsList = (agentsResponse.results || agentsResponse || []).map((item) => ({
        ...item,
        _role: 'Agente',
        _displayName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username,
      }));
      const clientsList = (clientsResponse.results || clientsResponse || []).map((item) => ({
        ...item,
        _role: 'Cliente',
        _displayName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.username,
      }));

      setAgents(agentsList);
      setClients(clientsList);
    } catch (err) {
      setError(err.message || 'Error cargando usuarios');
      notify.error(err.message || 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const allUsers = useMemo(() => {
    const combined = [...agents, ...clients];
    const normalized = searchTerm.trim().toLowerCase();

    return combined.filter((user) => {
      const matchesSearch = !normalized || [user.username, user.email, user.first_name, user.last_name, user._displayName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
      const matchesRole = roleFilter === 'all' || user._role.toLowerCase() === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [agents, clients, searchTerm, roleFilter]);

  const stats = useMemo(() => ({
    total: agents.length + clients.length,
    agents: agents.length,
    clients: clients.length,
    active: [...agents, ...clients].filter((item) => item.is_active).length,
  }), [agents, clients]);

  const handleOpenEdit = (user) => {
    setEditingUser(user);
  };

  const closeModal = () => {
    setEditingUser(null);
  };

  const normalizeUserForRole = (role, user) => ({
    ...user,
    _role: role,
    _displayName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
  });

  const applyUpdatedUser = (role, id, updatedUser) => {
    if (role === 'Agente') {
      setAgents((prev) =>
        prev.map((item) =>
          item.id === id ? normalizeUserForRole('Agente', { ...item, ...updatedUser }) : item
        )
      );
      return;
    }

    setClients((prev) =>
      prev.map((item) =>
        item.id === id ? normalizeUserForRole('Cliente', { ...item, ...updatedUser }) : item
      )
    );
  };

  const removeUserFromState = (role, id) => {
    if (role === 'Agente') {
      setAgents((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    setClients((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = async (formData) => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const repository = editingUser._role === 'Agente' ? agentRepository : clientRepository;
      const payload = editingUser._role === 'Agente'
        ? {
            username: formData.username,
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            ci: formData.ci,
            telefono: formData.telefono,
            codigo_licencia: formData.codigo_licencia,
            fecha_ingreso: formData.fecha_ingreso,
            nivel: formData.nivel,
            comision_base_porcentaje: formData.comision_base_porcentaje,
            sucursal: formData.sucursal,
            is_active: Boolean(formData.is_active),
            ...(formData.password ? { password: formData.password } : {}),
          }
        : {
            telefono: formData.telefono,
            direccion: formData.direccion,
            fecha_nacimiento: formData.fecha_nacimiento,
            genero: formData.genero,
            profesion_oficio: formData.profesion_oficio,
            es_fumador: Boolean(formData.es_fumador),
            ingresos_mensuales: formData.ingresos_mensuales,
            is_active: Boolean(formData.is_active),
          };
          const updatedUser = await repository.update(editingUser.id, payload);
          applyUpdatedUser(editingUser._role, editingUser.id, updatedUser);
      notify.success(`${editingUser._role} actualizado`);
      closeModal();
    } catch (err) {
      notify.error(err.message || 'Error actualizando usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setSaving(true);
    try {
      const repository = user._role === 'Agente' ? agentRepository : clientRepository;
      const payload = user._role === 'Agente'
        ? {
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            ci: user.ci,
            telefono: user.telefono,
            codigo_licencia: user.codigo_licencia,
            fecha_ingreso: user.fecha_ingreso,
            nivel: user.nivel,
            comision_base_porcentaje: user.comision_base_porcentaje,
            sucursal: user.sucursal,
            is_active: !user.is_active,
          }
        : {
            telefono: user.telefono,
            direccion: user.direccion,
            fecha_nacimiento: user.fecha_nacimiento,
            genero: user.genero,
            profesion_oficio: user.profesion_oficio,
            es_fumador: user.es_fumador,
            ingresos_mensuales: user.ingresos_mensuales,
            is_active: !user.is_active,
          };
          const updatedUser = await repository.update(user.id, payload);
          applyUpdatedUser(user._role, user.id, updatedUser);
      notify.success(`${user._role} ${user.is_active ? 'deshabilitado' : 'habilitado'}`);
    } catch (err) {
      notify.error(err.message || 'Error cambiando estado');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const repository = deleteTarget._role === 'Agente' ? agentRepository : clientRepository;
      await repository.delete(deleteTarget.id);
      removeUserFromState(deleteTarget._role, deleteTarget.id);
      notify.success(`${deleteTarget._role} eliminado`);
      setDeleteTarget(null);
    } catch (err) {
      notify.error(err.message || 'Error eliminando usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(
      'usuarios-gestion',
      'Usuarios',
      allUsers.map((user) => ({
        Rol: user._role,
        Usuario: user.username,
        Nombre: user._displayName,
        Correo: user.email || '-',
        Telefono: user.telefono || '-',
        Documento: user.ci || '-',
        Estado: user.is_active ? 'Activo' : 'Inactivo',
      }))
    );
  };

  const handleExportPdf = () => {
    exportToPdf(
      'Reporte de Usuarios',
      'usuarios-gestion',
      ['Rol', 'Usuario', 'Nombre', 'Correo', 'Telefono', 'Documento', 'Estado'],
      allUsers.map((user) => [
        user._role,
        user.username,
        user._displayName,
        user.email || '-',
        user.telefono || '-',
        user.ci || '-',
        user.is_active ? 'Activo' : 'Inactivo',
      ])
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin mr-3 text-2xl text-blue-600" />
        <span className="text-lg text-slate-600">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestión de Usuarios</h1>
          <p className="text-sm text-slate-600 mt-1">Vista unificada de agentes y clientes</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, usuario o correo"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="all">Todos los roles</option>
              <option value="agente">Agentes</option>
              <option value="cliente">Clientes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Usuarios" value={stats.total} tone="blue" />
        <StatCard title="Agentes" value={stats.agents} tone="emerald" />
        <StatCard title="Clientes" value={stats.clients} tone="violet" />
        <StatCard title="Activos" value={stats.active} tone="slate" />
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
          onClick={loadUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaSpinner /> Recargar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Rol</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Usuario</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Correo</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Documento</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-slate-700">Estado</th>
                <th className="px-6 py-3 text-right text-sm font-bold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allUsers.map((user) => (
                <tr key={`${user._role}-${user.id}`} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${user._role === 'Agente' ? 'bg-emerald-100 text-emerald-800' : 'bg-violet-100 text-violet-800'}`}>
                      {user._role === 'Agente' ? <FaUserFriends /> : <FaUsers />}
                      {user._role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{user._displayName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.ci || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {user.is_active ? <FaUserCheck /> : <FaToggleOff />}
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className="text-amber-600 hover:text-amber-800 mr-3"
                      title={user.is_active ? 'Deshabilitar' : 'Habilitar'}
                    >
                      {user.is_active ? <FaToggleOff /> : <FaToggleOn />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(user)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {allUsers.length === 0 && (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
          No hay resultados para los filtros aplicados.
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {editingUser._role === 'Agente' ? (
              <CreateAgentForm
                editingData={editingUser}
                onSubmit={handleSave}
                onCancel={closeModal}
                loading={saving}
              />
            ) : (
              <CreateClientForm
                editingData={editingUser}
                onSubmit={handleSave}
                onCancel={closeModal}
                loading={saving}
              />
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Usuario"
        message={`¿Está seguro que desea eliminar a ${deleteTarget?._displayName || ''}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={saving}
      />
    </div>
  );
}
