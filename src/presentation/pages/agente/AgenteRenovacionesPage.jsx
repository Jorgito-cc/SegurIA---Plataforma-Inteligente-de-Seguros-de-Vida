import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiRefreshCcw, FiCheck, FiX, FiSearch } from 'react-icons/fi';

export default function AgenteRenovacionesPage() {
  const [renovaciones, setRenovaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRenovaciones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.renovaciones);
      setRenovaciones(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching renovaciones:', error);
      notify.error('Error al cargar renovaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRenovaciones();
  }, []);

  const handleAction = async (id, action, data = {}) => {
    try {
      await apiClient.post(`${ENDPOINTS.renovaciones}${id}/${action}/`, data);
      notify.success(`Renovación ${action === 'aprobar' ? 'aprobada' : 'rechazada'}`);
      fetchRenovaciones();
    } catch (error) {
      notify.error(error.response?.data?.error || `Error al ${action} renovación`);
    }
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID',
      render: (val) => <span className="font-mono text-xs">#{val}</span>
    },
    { 
      key: 'poliza_original', 
      label: 'Póliza Original',
      render: (pol) => pol?.numero_poliza || 'N/A'
    },
    { 
      key: 'fecha_solicitud', 
      label: 'Solicitada el',
      render: (val) => new Date(val).toLocaleDateString()
    },
    { 
      key: 'motivo_solicitud', 
      label: 'Motivo',
      render: (val) => <span className="text-xs text-slate-500 max-w-xs block truncate" title={val}>{val}</span>
    },
    { 
      key: 'nuevo_plazo_anios', 
      label: 'Nuevo Plazo',
      render: (val) => `${val} año(s)`
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          val === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-700' :
          val === 'APROBADA' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <FiRefreshCcw className="text-blue-600" /> Solicitudes de Renovación
          </h1>
          <p className="text-slate-500">Gestiona las renovaciones de pólizas de tus clientes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por póliza..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={renovaciones.filter(r => r.poliza_original?.numero_poliza?.toLowerCase().includes(searchTerm.toLowerCase()))}
          loading={loading}
          customActions={(item) => (
            item.estado === 'PENDIENTE' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(item.id, 'aprobar', { observaciones_analista: 'Aprobado por agente', porcentaje_ajuste_prima: 0 })}
                  className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center gap-1 text-xs"
                  title="Aprobar"
                >
                  <FiCheck /> Aprobar
                </button>
                <button
                  onClick={() => {
                    const motivo = prompt('Motivo del rechazo:');
                    if (motivo) handleAction(item.id, 'rechazar', { observaciones_analista: motivo });
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center gap-1 text-xs"
                  title="Rechazar"
                >
                  <FiX /> Rechazar
                </button>
              </div>
            )
          )}
        />
      </div>
    </div>
  );
}
