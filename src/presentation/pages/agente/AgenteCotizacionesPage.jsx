import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiFileText, FiPlus, FiCheckCircle, FiSearch, FiActivity } from 'react-icons/fi';
import CalculateCotizacionModal from '../../components/forms/CalculateCotizacionModal';

export default function AgenteCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.cotizaciones);
      setCotizaciones(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching cotizaciones:', error);
      notify.error('Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  const handleAccept = async (id) => {
    try {
      await apiClient.post(`${ENDPOINTS.cotizaciones}${id}/aceptar/`);
      notify.success('Cotización aceptada con éxito');
      fetchCotizaciones();
    } catch (error) {
      notify.error('Error al aceptar cotización');
    }
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID',
      render: (val) => <span className="font-mono text-xs">#{val}</span>
    },
    { 
      key: 'cliente_nombre', 
      label: 'Cliente',
      render: (_, item) => item.cliente?.email || 'N/A'
    },
    { 
      key: 'plan_nombre', 
      label: 'Plan',
      render: (_, item) => item.plan?.nombre || 'N/A'
    },
    { 
      key: 'capital_asegurado', 
      label: 'Capital',
      render: (val) => <span className="font-bold">${Number(val).toLocaleString()}</span>
    },
    { 
      key: 'prima_ajustada_anual', 
      label: 'Prima Anual',
      render: (val) => <span className="text-emerald-600 font-bold">${Number(val).toLocaleString()}</span>
    },
    { 
      key: 'nivel_riesgo', 
      label: 'Riesgo',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          val === 'BAJO' ? 'bg-green-100 text-green-700' :
          val === 'MEDIO' ? 'bg-yellow-100 text-yellow-700' :
          val === 'ALTO' ? 'bg-orange-100 text-orange-700' :
          'bg-red-100 text-red-700'
        }`}>
          {val}
        </span>
      )
    },
    { 
      key: 'expediente', 
      label: 'Documentos',
      render: (_, item) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
          item.expediente?.validado_por_analista ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {item.expediente?.validado_por_analista ? 'Validado' : 'Pendiente'}
        </span>
      )
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          val === 'PENDIENTE' ? 'bg-blue-100 text-blue-700' :
          val === 'ACEPTADA' ? 'bg-emerald-100 text-emerald-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {val}
        </span>
      )
    }
  ];

  const filteredCotizaciones = cotizaciones.filter(c => 
    c.cliente?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.plan?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <FiFileText className="text-blue-600" /> Cotizaciones
          </h1>
          <p className="text-slate-500">Genera nuevas cotizaciones con nuestro motor de IA y actuarial.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-200"
        >
          <FiPlus /> Nueva Cotización
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o plan..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filteredCotizaciones}
          loading={loading}
          onEdit={() => {}} // No edit for quotes usually, they are snapshots
          onDelete={() => {}} 
          onAdd={() => setShowModal(true)}
          customActions={(item) => (
            item.estado === 'PENDIENTE' && (
              <button
                onClick={() => handleAccept(item.id)}
                className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center gap-1 text-xs"
                title="Aceptar Cotización"
              >
                <FiCheckCircle /> Aceptar
              </button>
            )
          )}
        />
      </div>

      {showModal && (
        <CalculateCotizacionModal 
          onClose={() => {
            setShowModal(false);
            fetchCotizaciones();
          }} 
        />
      )}
    </div>
  );
}
