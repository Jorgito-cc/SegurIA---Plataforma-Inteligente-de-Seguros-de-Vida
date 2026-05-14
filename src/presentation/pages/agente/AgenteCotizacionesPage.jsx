import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiFileText, FiPlus, FiCheckCircle, FiSearch, FiEye, FiActivity } from 'react-icons/fi';
import CalculateCotizacionModal from '../../components/forms/CalculateCotizacionModal';
import CotizacionDetailModal from '../../components/modals/CotizacionDetailModal';

export default function AgenteCotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
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
      render: (val) => <span className="font-mono text-xs font-bold text-slate-500">#{val}</span>
    },
    { 
      key: 'cliente_nombre', 
      label: 'Cliente',
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.cliente?.email || 'N/A'}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.plan?.nombre}</span>
        </div>
      )
    },
    { 
      key: 'capital_asegurado', 
      label: 'Capital',
      render: (val) => <span className="font-black text-slate-900">${Number(val).toLocaleString()}</span>
    },
    { 
      key: 'prima_ajustada_anual', 
      label: 'Prima Anual',
      render: (val) => <span className="text-emerald-600 font-black">${Number(val).toLocaleString()}</span>
    },
    { 
      key: 'nivel_riesgo', 
      label: 'Riesgo IA',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          val === 'PENDIENTE' ? 'bg-blue-100 text-blue-700' :
          val === 'ACEPTADA' ? 'bg-emerald-100 text-emerald-700' :
          'bg-slate-100 text-slate-500'
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
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FiFileText className="text-emerald-600" /> Cartera de Cotizaciones
          </h1>
          <p className="text-slate-500 font-medium">Revisa las solicitudes y aprueba los contratos para emisión.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black transition shadow-lg shadow-emerald-200"
        >
          <FiPlus /> Nueva Cotización
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o plan..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filteredCotizaciones}
          loading={loading}
          customActions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCotizacion(item)}
                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                title="Ver Detalle"
              >
                <FiEye size={18} />
              </button>
              {item.estado === 'PENDIENTE' && (
                <button
                  onClick={() => handleAccept(item.id)}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition"
                  title="Aceptar Cotización"
                >
                  <FiCheckCircle size={18} />
                </button>
              )}
            </div>
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

      {selectedCotizacion && (
        <CotizacionDetailModal 
          cotizacion={selectedCotizacion} 
          onClose={() => setSelectedCotizacion(null)} 
          onAccept={handleAccept}
        />
      )}
    </div>
  );
}
