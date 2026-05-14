import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiShield, FiPlus, FiRefreshCcw, FiSearch, FiEye, FiCheckCircle, FiXCircle, FiFileText } from 'react-icons/fi';
import EmitirPolizaModal from '../../components/forms/EmitirPolizaModal';
import PolizaDetailModal from '../../components/modals/PolizaDetailModal';

export default function AgentePolizasPage() {
  const [polizas, setPolizas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmitModal, setShowEmitModal] = useState(false);
  const [selectedPoliza, setSelectedPoliza] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPolizas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.polizas);
      setPolizas(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching polizas:', error);
      notify.error('Error al cargar pólizas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolizas();
  }, []);

  const handleSolicitarRenovacion = async (poliza) => {
    try {
      await apiClient.post(`${ENDPOINTS.polizas}${poliza.id}/solicitar_renovacion/`, {
        motivo_solicitud: 'Renovación estándar solicitada por el agente.',
        nuevo_plazo_anios: 1
      });
      notify.success('Solicitud de renovación enviada');
    } catch (error) {
      notify.error(error.response?.data?.error || 'Error al solicitar renovación');
    }
  };

  const columns = [
    { 
      key: 'numero_poliza', 
      label: 'Nro. Póliza',
      render: (val) => <span className="font-mono text-xs font-bold text-slate-600">{val}</span>
    },
    { 
      key: 'cliente_email', 
      label: 'Cliente',
      render: (_, item) => item.cotizacion?.cliente?.email || 'N/A'
    },
    { 
      key: 'vencimiento', 
      label: 'Vencimiento',
      render: (_, item) => {
        const date = new Date(item.fecha_vencimiento);
        const isClose = (date - new Date()) / (1000 * 60 * 60 * 24) < 30;
        return (
          <div className="flex flex-col">
            <span className={`text-sm ${isClose ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
              {date.toLocaleDateString()}
            </span>
            {isClose && item.estado === 'ACTIVA' && <span className="text-[10px] text-amber-500 font-black uppercase">Próxima a vencer</span>}
          </div>
        );
      }
    },
    { 
      key: 'prima', 
      label: 'Prima Anual',
      render: (_, item) => <span className="font-black text-slate-900">${Number(item.prima_final_facturada).toLocaleString()}</span>
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
          val === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700' :
          val === 'VENCIDA' ? 'bg-red-100 text-red-700' :
          val === 'RENOVADA' ? 'bg-blue-100 text-blue-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {val}
        </span>
      )
    }
  ];

  const filteredPolizas = polizas.filter(p => 
    p.numero_poliza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cotizacion?.cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FiShield className="text-blue-600" /> Pólizas de Seguro
          </h1>
          <p className="text-slate-500 font-medium">Gestión administrativa de contratos y renovaciones.</p>
        </div>
        <button
          onClick={() => setShowEmitModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition shadow-lg shadow-blue-200"
        >
          <FiPlus /> Emitir Póliza
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de póliza o email del cliente..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filteredPolizas}
          loading={loading}
          customActions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPoliza(item)}
                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                title="Ver Detalle"
              >
                <FiEye size={18} />
              </button>
              {(item.estado === 'ACTIVA' || item.estado === 'VENCIDA') && (
                <button
                  onClick={() => handleSolicitarRenovacion(item)}
                  className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition"
                  title="Solicitar Renovación"
                >
                  <FiRefreshCcw size={18} />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {showEmitModal && (
        <EmitirPolizaModal 
          onClose={() => {
            setShowEmitModal(false);
            fetchPolizas();
          }} 
        />
      )}

      {selectedPoliza && (
        <PolizaDetailModal 
          poliza={selectedPoliza} 
          onClose={() => setSelectedPoliza(null)} 
        />
      )}
    </div>
  );
}
