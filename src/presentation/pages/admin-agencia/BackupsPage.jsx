import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { 
  FiDatabase, 
  FiDownload, 
  FiRefreshCw, 
  FiTrash2, 
  FiHardDrive, 
  FiShield, 
  FiAlertTriangle,
  FiFileText,
  FiClock
} from 'react-icons/fi';

export default function BackupsPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.backups.listar);
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error('Error fetching backups:', error);
      notify.error(error.message || 'No se pudo cargar el historial de backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateDBBackup = async () => {
    try {
      setActionLoading('db');
      notify.info('Iniciando copia de seguridad de la base de datos...');
      const response = await apiClient.post(ENDPOINTS.backups.crear, {}, { responseType: 'blob' });
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_db_${new Date().getTime()}.json`);
      document.body.appendChild(link);
      link.click();
      
      notify.success('Copia de seguridad completada y descargada');
      fetchBackups();
    } catch (error) {
      notify.error(error.message || 'Error al generar copia de seguridad');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateMediaBackup = async () => {
    try {
      setActionLoading('media');
      notify.info('Comprimiendo archivos multimedia...');
      const response = await apiClient.post(ENDPOINTS.backups.media, {}, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_media_${new Date().getTime()}.zip`);
      document.body.appendChild(link);
      link.click();
      
      notify.success('Archivos multimedia comprimidos y descargados');
    } catch (error) {
      notify.error(error.message || 'Error al generar copia de multimedia');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadStored = async (id, tipo) => {
    try {
      const response = await apiClient.get(`${ENDPOINTS.backups.base}${id}/descargar/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${tipo}_${id}.json`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      notify.error(error.message || 'Error al descargar el backup');
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('⚠️ ADVERTENCIA: Esta acción es destructiva. Se sobreescribirán todos los datos actuales de la agencia con el contenido del backup. ¿Desea continuar?')) return;

    try {
      notify.info('Restaurando sistema...');
      await apiClient.post(ENDPOINTS.backups.restaurar, { backup_id: id });
      notify.success('Sistema restaurado con éxito');
    } catch (error) {
      notify.error(error.message || 'Error durante la restauración');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    { 
      key: 'creado_en', 
      label: 'Fecha y Hora',
      render: (val) => <span className="font-bold text-slate-700">{val}</span>
    },
    { 
      key: 'tipo', 
      label: 'Tipo',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          val === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {val}
        </span>
      )
    },
    { 
      key: 'tamanio_kb', 
      label: 'Tamaño',
      render: (val) => <span className="text-slate-500 font-medium">{val} KB</span>
    },
    { 
      key: 'creado_por', 
      label: 'Origen',
      render: (val) => <span className="text-xs text-slate-400 font-bold italic">{val}</span>
    }
  ];

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FiDatabase className="text-blue-600" /> Centro de Backups
          </h1>
          <p className="text-slate-500 font-medium mt-1">Protege la integridad de tus datos con copias de seguridad persistentes.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchBackups}
            className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition shadow-sm"
            title="Actualizar lista"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <FiHardDrive size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Base de Datos</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Genera un volcado JSON completo de toda la información estructurada: clientes, pólizas, usuarios y configuraciones.
            </p>
            <button
              onClick={handleCreateDBBackup}
              disabled={actionLoading === 'db'}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50"
            >
              {actionLoading === 'db' ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
              Crear Backup de BD
            </button>
          </div>
          <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <FiDatabase size={200} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <FiFileText size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Archivos Multimedia</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Comprime en un archivo ZIP todos los documentos adjuntos: escaneos de identidad, firmas y exámenes médicos.
            </p>
            <button
              onClick={handleCreateMediaBackup}
              disabled={actionLoading === 'media'}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 disabled:opacity-50"
            >
              {actionLoading === 'media' ? <FiRefreshCw className="animate-spin" /> : <FiDownload />}
              Respaldar Multimedia
            </button>
          </div>
          <div className="absolute top-[-20px] right-[-20px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <FiFileText size={200} />
          </div>
        </div>
      </div>

      {/* Historial Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">Historial de Respaldos</h2>
            <p className="text-sm text-slate-400 font-medium">Copias guardadas permanentemente en PostgreSQL.</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2">
            <FiClock className="text-blue-600" />
            <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Auto-Backups: Activos</span>
          </div>
        </div>

        <div className="p-4">
          <CrudTable
            columns={columns}
            data={backups}
            loading={loading}
            customActions={(item) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadStored(item.id, item.tipo)}
                  className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition"
                  title="Descargar"
                >
                  <FiDownload size={18} />
                </button>
                <button
                  onClick={() => handleRestore(item.id)}
                  className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition"
                  title="Restaurar"
                >
                  <FiRefreshCw size={18} />
                </button>
              </div>
            )}
          />
        </div>
      </div>

      {/* Info Warning */}
      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
        <FiAlertTriangle className="text-amber-500 mt-1" size={24} />
        <div>
          <h4 className="font-black text-amber-900">Política de Seguridad</h4>
          <p className="text-amber-800 text-sm opacity-80 leading-relaxed">
            Los backups automáticos se realizan diariamente a las 00:00 UTC. Las copias manuales se registran con el usuario solicitante. 
            <strong> Recuerde:</strong> La restauración de un backup reemplazará todos los datos actuales de forma irreversible.
          </p>
        </div>
      </div>
    </div>
  );
}
