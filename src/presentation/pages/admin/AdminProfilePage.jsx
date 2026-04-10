import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../application/context/AuthContext';
import { FaUser, FaSpinner, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { notify } from '../../components/notifications/notify';

export default function AdminProfilePage() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.nombre?.split(' ')[0] || '',
    last_name: user?.nombre?.split(' ').slice(1).join(' ') || '',
    ci: user?.ci || '',
  });

  const [formData, setFormData] = useState(profileData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Endpoint pendiente de implementar en backend
      // await authRepository.updateProfile(formData);
      notify.success('Perfil actualizado exitosamente');
      setProfileData(formData);
      setEditing(false);
    } catch (err) {
      notify.error(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Mi Perfil</h1>
        <p className="text-sm text-slate-600 mt-1">Administrador del Sistema SegurIA</p>
      </div>

      {loading && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-2">
          <FaSpinner className="animate-spin" />
          Cargando...
        </div>
      )}

      {/* Tarjeta de perfil principal */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <FaUser size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black">
                {formData.first_name} {formData.last_name}
              </h2>
              <p className="text-blue-100">{formData.email}</p>
              <p className="text-blue-100 text-sm">Rol: Administrador</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-4">
          {/* Username (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Usuario</label>
            <input
              type="text"
              value={profileData.username}
              disabled
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">No se puede cambiar el nombre de usuario</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              value={editing ? formData.email : profileData.email}
              onChange={handleInputChange}
              disabled={!editing}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg transition ${
                editing
                  ? 'bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'
                  : 'bg-slate-50 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
            <input
              type="text"
              name="first_name"
              value={editing ? formData.first_name : profileData.first_name}
              onChange={handleInputChange}
              disabled={!editing}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg transition ${
                editing
                  ? 'bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'
                  : 'bg-slate-50 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
            <input
              type="text"
              name="last_name"
              value={editing ? formData.last_name : profileData.last_name}
              onChange={handleInputChange}
              disabled={!editing}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg transition ${
                editing
                  ? 'bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'
                  : 'bg-slate-50 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cédula de Identidad</label>
            <input
              type="text"
              name="ci"
              value={editing ? formData.ci : profileData.ci}
              onChange={handleInputChange}
              disabled={!editing}
              className={`w-full px-4 py-2 border border-slate-200 rounded-lg transition ${
                editing
                  ? 'bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none'
                  : 'bg-slate-50 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Botones de acción */}
          <div className="border-t border-slate-200 pt-4 flex gap-3 justify-end">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-medium rounded-lg hover:bg-slate-300 transition flex items-center gap-2"
                >
                  <FaTimes /> Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave /> Guardar Cambios
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FaEdit /> Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow p-6">
          <h3 className="font-bold text-slate-800 mb-4">Información de Cuenta</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Rol:</span>
              <span className="font-semibold text-slate-900">Administrador</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Estado:</span>
              <span className="font-semibold text-emerald-600">Activo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tipo de Cuenta:</span>
              <span className="font-semibold text-slate-900">Administrador del Sistema</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow p-6">
          <h3 className="font-bold text-slate-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-slate-100 text-slate-800 font-medium rounded-lg hover:bg-slate-200 transition text-left">
              Cambiar Contraseña
            </button>
            <button className="w-full px-4 py-2 bg-slate-100 text-slate-800 font-medium rounded-lg hover:bg-slate-200 transition text-left">
              Ver Historial de Acceso
            </button>
            <button className="w-full px-4 py-2 bg-slate-100 text-slate-800 font-medium rounded-lg hover:bg-slate-200 transition text-left">
              Preferencias de Notificaciones
            </button>
          </div>
        </div>
      </div>

      {/* Nota de información */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Información importante</p>
        <p>
          Esta es tu cuenta de administrador del sistema. Algunos datos como el usuario no pueden ser modificados por razones de seguridad.
          Si necesitas cambiar información crítica, contacta al soporte técnico.
        </p>
      </div>
    </div>
  );
}
