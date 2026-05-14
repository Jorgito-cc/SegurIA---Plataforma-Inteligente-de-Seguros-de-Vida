import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiActivity, FiSearch, FiUpload, FiClipboard } from 'react-icons/fi';
import { useAuth } from '../../../application/context/AuthContext';
import { useForm } from 'react-hook-form';

export default function AgenteOrdenesMedicasPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDictamenModal, setShowDictamenModal] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.ordenesMedicas);
      setOrdenes(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching ordenes:', error);
      notify.error('Error al cargar órdenes médicas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const handleCargarResultado = async (data) => {
    try {
      const formData = new FormData();
      formData.append('tipo_examen', data.tipo_examen);
      formData.append('resultado', data.resultado);
      formData.append('es_normal', data.es_normal);
      if (data.archivo && data.archivo[0]) {
        formData.append('archivo', data.archivo[0]);
      }
      
      await apiClient.post(`${ENDPOINTS.ordenesMedicas}${selectedOrden.id}/resultados/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      notify.success('Resultado médico cargado');
      setShowUploadModal(false);
      fetchOrdenes();
    } catch (error) {
      notify.error(error.response?.data?.error || 'Error al cargar resultado');
    }
  };

  const handleEmitirDictamen = async (data) => {
    try {
      await apiClient.post(`${ENDPOINTS.ordenesMedicas}${selectedOrden.id}/dictamen/`, data);
      notify.success('Dictamen emitido exitosamente');
      setShowDictamenModal(false);
      fetchOrdenes();
    } catch (error) {
      notify.error(error.response?.data?.error || 'Error al emitir dictamen');
    }
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID',
      render: (val) => <span className="font-mono text-xs font-bold text-slate-600">OM-{val}</span>
    },
    { 
      key: 'cliente', 
      label: 'Cliente',
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.cliente_nombre || 'N/A'}</span>
          {item.cliente_email && (
            <span className="text-[10px] text-slate-400">{item.cliente_email}</span>
          )}
        </div>
      )
    },
    { 
      key: 'cotizacion', 
      label: 'Cotización',
      render: (val) => val ? `COT-${val}` : 'N/A'
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
          val === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700' : 
          val === 'EN_PROCESO' ? 'bg-blue-100 text-blue-700' : 
          val === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
        }`}>
          {val}
        </span>
      )
    },
    {
      key: 'examenes_requeridos',
      label: 'Exámenes',
      render: (val) => <span className="text-xs text-slate-500">{val?.length || 0} req.</span>
    }
  ];

  const filteredOrdenes = ordenes.filter(o => 
    o.id.toString().includes(searchTerm) || 
    (o.cliente_nombre && o.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.cliente_email && o.cliente_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FiActivity className="text-blue-600" /> Órdenes Médicas
          </h1>
          <p className="text-slate-500 font-medium">Evaluaciones de salud para la suscripción de pólizas.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID de orden o email..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filteredOrdenes}
          loading={loading}
          customActions={(item) => (
            <div className="flex gap-2">
              {item.estado !== 'COMPLETADA' && (
                <button
                  onClick={() => { setSelectedOrden(item); setShowUploadModal(true); }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                  title="Cargar Resultados"
                >
                  <FiUpload size={18} />
                </button>
              )}
              {user?.is_staff && item.estado !== 'COMPLETADA' && (
                <button
                  onClick={() => { setSelectedOrden(item); setShowDictamenModal(true); }}
                  className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition"
                  title="Emitir Dictamen Médico"
                >
                  <FiClipboard size={18} />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {showUploadModal && selectedOrden && (
        <UploadResultModal 
          orden={selectedOrden} 
          onClose={() => setShowUploadModal(false)} 
          onSubmit={handleCargarResultado}
        />
      )}

      {showDictamenModal && selectedOrden && (
        <DictamenModal 
          orden={selectedOrden} 
          onClose={() => setShowDictamenModal(false)} 
          onSubmit={handleEmitirDictamen}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Modals Componentes Internos
// ----------------------------------------------------

function UploadResultModal({ orden, onClose, onSubmit }) {
  const { register, handleSubmit } = useForm({
    defaultValues: { es_normal: true }
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6">
        <h2 className="text-xl font-black mb-4">Cargar Resultado (OM-{orden.id})</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Examen</label>
            <select {...register('tipo_examen', { required: true })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Seleccione examen --</option>
              {orden.examenes_requeridos?.map((ex, i) => (
                <option key={i} value={ex}>{ex}</option>
              ))}
              <option value="Otro">Otro / Adicional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Descripción / Resultado</label>
            <textarea {...register('resultado', { required: true })} rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej. Valores dentro de la norma..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Archivo Adjunto (PDF/Imagen)</label>
            <input type="file" {...register('archivo')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('es_normal')} className="w-4 h-4 accent-blue-600" />
            <label className="text-sm font-bold text-slate-700">El resultado es normal (Sin observaciones críticas)</label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Guardar Resultado</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DictamenModal({ orden, onClose, onSubmit }) {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { conclusion: 'APTO', impacto_prima_pct: 0 }
  });
  const conclusion = watch('conclusion');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6">
        <h2 className="text-xl font-black mb-4 text-purple-700">Dictamen Médico (OM-{orden.id})</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Conclusión Médica</label>
            <select {...register('conclusion', { required: true })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500">
              <option value="APTO">Apto</option>
              <option value="APTO_RESERVA">Apto con reserva (Recargo de Prima)</option>
              <option value="NO_APTO">No Apto (Rechazar Riesgo)</option>
            </select>
          </div>
          {conclusion === 'APTO_RESERVA' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Recargo a la Prima (%)</label>
              <input type="number" step="0.01" {...register('impacto_prima_pct', { required: true, min: 0.1 })} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. 15.00" />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Observaciones / Justificación</label>
            <textarea {...register('observaciones')} rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Notas sobre la decisión..." />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700">Emitir Dictamen Final</button>
          </div>
        </form>
      </div>
    </div>
  );
}