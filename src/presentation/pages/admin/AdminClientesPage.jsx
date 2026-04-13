import { useMemo, useState } from 'react';
import { useCrudManager } from '../../../application/hooks/useCrudManager';
import { clientRepository } from '../../../infrastructure/repositories/clientRepository';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { notify } from '../../components/notifications/notify';
import CreateClientForm from '../../components/forms/CreateClientForm';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';
import { FaEdit, FaFileExcel, FaFilePdf, FaFilter, FaPlus, FaSpinner, FaSyncAlt, FaToggleOff, FaToggleOn, FaTrash } from 'react-icons/fa';

export default function AdminClientesPage() {
  const crud = useCrudManager(clientRepository);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredItems = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    const result = crud.items.filter((item) => {
      const textMatches = !normalized || [
        item.username,
        item.email,
        item.first_name,
        item.last_name,
        item.ci,
        item.telefono,
        item.direccion,
        item.profesion_oficio,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));

      const activeMatches = statusFilter === 'all'
        || (statusFilter === 'active' && item.is_active)
        || (statusFilter === 'inactive' && !item.is_active);

      return textMatches && activeMatches;
    });
    return result;
  }, [crud.items, searchTerm, statusFilter]);

  const handleExportExcel = () => {
    exportToExcel(
      'clientes-gestion',
      'Clientes',
      filteredItems.map((item) => ({
        Usuario: item.username,
        Correo: item.email,
        Nombre: item.first_name,
        Apellido: item.last_name,
        CI: item.ci,
        Telefono: item.telefono,
        Direccion: item.direccion,
        Fecha_Nacimiento: item.fecha_nacimiento || '-',
        Genero: item.genero || '-',
        Profesion_Oficio: item.profesion_oficio || '-',
        Fumador: item.es_fumador ? 'Si' : 'No',
        Ingresos_Mensuales: item.ingresos_mensuales ?? '-',
        Estado: item.is_active ? 'Activo' : 'Inactivo',
      }))
    );
  };

  const handleExportPdf = () => {
    exportToPdf(
      'Reporte de Clientes',
      'clientes-gestion',
      ['Usuario', 'Correo', 'Nombre', 'Apellido', 'CI', 'Telefono', 'Direccion', 'Nacimiento', 'Genero', 'Profesion', 'Fumador', 'Ingresos', 'Estado'],
      filteredItems.map((item) => [
        item.username,
        item.email,
        item.first_name,
        item.last_name,
        item.ci,
        item.telefono,
        item.direccion,
        item.fecha_nacimiento || '-',
        item.genero || '-',
        item.profesion_oficio || '-',
        item.es_fumador ? 'Si' : 'No',
        item.ingresos_mensuales ?? '-',
        item.is_active ? 'Activo' : 'Inactivo',
      ])
    );
  };

  const handleToggleStatus = async (item) => {
    try {
      const ok = await crud.handleUpdate(item.id, {
        telefono: item.telefono,
        direccion: item.direccion,
        fecha_nacimiento: item.fecha_nacimiento,
        genero: item.genero,
        profesion_oficio: item.profesion_oficio,
        es_fumador: item.es_fumador,
        ingresos_mensuales: item.ingresos_mensuales,
        is_active: !item.is_active,
      });
      if (ok) {
        notify.success(item.is_active ? 'Cliente deshabilitado' : 'Cliente habilitado');
      } else {
        notify.error(crud.error || 'No se pudo actualizar el cliente');
      }
    } catch (err) {
      notify.error(err.message || 'Error cambiando estado');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      console.log('🔍 FormData completo recibido:', formData);
      console.log('Valores:', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        ci: formData.ci,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });
      
      if (crud.editingId) {
        console.log('✏️ Modo EDICIÓN - crud.editingId:', crud.editingId);
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          telefono: formData.telefono,
          direccion: formData.direccion,
          fecha_nacimiento: formData.fecha_nacimiento,
          genero: formData.genero,
          profesion_oficio: formData.profesion_oficio,
          es_fumador: Boolean(formData.es_fumador),
          ingresos_mensuales: formData.ingresos_mensuales,
          is_active: Boolean(formData.is_active),
        };
        console.log('📤 Llamando crud.handleUpdate con payload:', payload);
        const ok = await crud.handleUpdate(crud.editingId, payload);
        console.log('📥 Respuesta de crud.handleUpdate:', ok);
        if (ok) {
          console.log('✅ Actualización exitosa - recargando datos');
          notify.success('Cliente actualizado');
          // ⚠️ ESPERAR A QUE loadItems termine antes de cerrar el form
          await crud.loadItems(crud.currentPage);
          console.log('🔄 Datos recargados - cerrando formulario');
          crud.setShowForm(false);
          crud.setEditingId(null);
        } else {
          console.log('❌ Error en actualización:', crud.error);
          notify.error(crud.error || 'No se pudo actualizar el cliente');
        }
      } else {
        console.log('📤 Enviando formData a create():', formData);
        const ok = await crud.handleCreate(formData);
        if (ok) {
          notify.success('Cliente creado');
          crud.setShowForm(false);
        } else {
          notify.error(crud.error || 'No se pudo crear el cliente');
        }
      }
    } catch (err) {
      notify.error(err.message || 'Error procesando cliente');
    }
  };

  if (crud.loading && crud.items.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <FaSpinner className="animate-spin mr-3 text-2xl text-emerald-600" />
        <span className="text-lg text-slate-600">Cargando clientes...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Gestion de Clientes</h1>
          <p className="text-sm text-slate-600 mt-1">Listado completo con datos personales, contacto y estado</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario, nombre, cédula, teléfono o dirección"
            className="w-full sm:w-80 px-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <div className="relative w-full sm:w-44">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <button
            onClick={() => {
              crud.setEditingId(null);
              crud.setShowForm(true);
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 justify-center"
          >
            <FaPlus /> Nuevo
          </button>
        </div>
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
          onClick={() => crud.loadItems(crud.currentPage)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaSyncAlt /> Recargar
        </button>
      </div>

      {crud.showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CreateClientForm
              key={crud.editingId ? `edit-${crud.editingId}` : 'create'}
              editingData={crud.editingId ? crud.items.find((c) => c.id === crud.editingId) : null}
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
        <table className="w-full min-w-[1400px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold">Usuario</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Correo</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Nombre</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Apellido</th>
              <th className="px-6 py-3 text-left text-sm font-bold">CI</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Telefono</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Direccion</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Nacimiento</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Genero</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Profesion</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Fumador</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Ingresos</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Estado</th>
              <th className="px-6 py-3 text-right text-sm font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm">{item.username}</td>
                <td className="px-6 py-4 text-sm">{item.email}</td>
                <td className="px-6 py-4 text-sm">{item.first_name || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.last_name || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.ci || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.telefono || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.direccion || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.fecha_nacimiento || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.genero || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.profesion_oficio || '-'}</td>
                <td className="px-6 py-4 text-sm">{item.es_fumador ? 'Si' : 'No'}</td>
                <td className="px-6 py-4 text-sm">{item.ingresos_mensuales ?? '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {item.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => { crud.setEditingId(item.id); crud.setShowForm(true); }} className="text-emerald-600 hover:text-emerald-800 mr-3" title="Editar"><FaEdit /></button>
                  <button onClick={() => handleToggleStatus(item)} className="text-amber-600 hover:text-amber-800 mr-3" title={item.is_active ? 'Deshabilitar' : 'Habilitar'}>
                    {item.is_active ? <FaToggleOff /> : <FaToggleOn />}
                  </button>
                  <button onClick={() => crud.handleDeleteClick(item.id)} className="text-red-600 hover:text-red-800" title="Eliminar"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <ConfirmDialog
        open={crud.deleteConfirm.open}
        title="Eliminar Cliente"
        message="Esta accion no se puede deshacer."
        onConfirm={() => crud.handleDeleteConfirm(crud.deleteConfirm.id)}
        onCancel={() => crud.setDeleteConfirm({ open: false, id: null })}
        isLoading={crud.loading}
      />
    </div>
  );
}
