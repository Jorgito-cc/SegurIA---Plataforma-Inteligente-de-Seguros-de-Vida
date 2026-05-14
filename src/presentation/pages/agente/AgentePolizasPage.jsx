import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiShield, FiPlus, FiRefreshCcw, FiSearch, FiFileText } from 'react-icons/fi';
import EmitirPolizaModal from '../../components/forms/EmitirPolizaModal';

export default function AgentePolizasPage() {
  const [polizas, setPolizas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmitModal, setShowEmitModal] = useState(false);
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
      key: 'fecha_inicio_vigencia', 
      label: 'Inicio',
      render: (val) => new Date(val).toLocaleDateString()
    },
    { 
      key: 'fecha_vencimiento', 
      label: 'Vencimiento',
      render: (val) => (
        <span className={new Date(val) < new Date() ? 'text-red-500 font-bold' : ''}>
          {new Date(val).toLocaleDateString()}
        </span>
      )
    },
    { 
      key: 'prima_final_facturada', 
      label: 'Prima',
      render: (val) => <span className="font-bold text-slate-900">${Number(val).toLocaleString()}</span>
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          val === 'ACTIVA' ? 'bg-green-100 text-green-700' :
          val === 'VENCIDA' ? 'bg-red-100 text-red-700' :
          val === 'RENOVADA' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
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
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <FiShield className="text-emerald-600" /> Pólizas Emitidas
          </h1>
          <p className="text-slate-500">Administra las pólizas vigentes y gestiona sus renovaciones.</p>
        </div>
        <button
          onClick={() => setShowEmitModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-200"
        >
          <FiPlus /> Emitir Nueva Póliza
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
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
              {(item.estado === 'ACTIVA' || item.estado === 'VENCIDA') && (
                <button
                  onClick={() => handleSolicitarRenovacion(item)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center gap-1 text-xs"
                  title="Solicitar Renovación"
                >
                  <FiRefreshCcw /> Renovar
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
    </div>
  );
}
