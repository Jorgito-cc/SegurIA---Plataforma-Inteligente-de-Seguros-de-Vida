import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiRefreshCcw, FiCheck, FiX, FiSearch, FiAlertCircle } from 'react-icons/fi';

export default function AgenteRenovacionesPage() {
  const [renovaciones, setRenovaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [selectedRenovacion, setSelectedRenovacion] = useState(null);
  const [pctAjuste, setPctAjuste] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRenovaciones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.renovaciones);
      setRenovaciones(response.data.results || response.data);
    } catch (error) {
      notify.error('Error al cargar renovaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRenovaciones(); }, []);

  const handleAprobar = async () => {
    if (!selectedRenovacion) return;
    try {
      setProcessing(true);
      await apiClient.post(`${ENDPOINTS.renovaciones}${selectedRenovacion.id}/aprobar/`, {
        observaciones_analista: observaciones || 'Aprobado.',
        porcentaje_ajuste_prima: Number(pctAjuste) || 0,
      });
      notify.success('¡Renovación aprobada! Nueva póliza generada.');
      setShowAprobarModal(false);
      setSelectedRenovacion(null);
      fetchRenovaciones();
    } catch (error) {
      notify.error(error.response?.data?.error || 'Error al aprobar renovación');
    } finally {
      setProcessing(false);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim() || motivoRechazo.trim().length < 5) {
      return notify.error('El motivo del rechazo debe tener al menos 5 caracteres.');
    }
    try {
      setProcessing(true);
      await apiClient.post(`${ENDPOINTS.renovaciones}${selectedRenovacion.id}/rechazar/`, {
        observaciones_analista: motivoRechazo.trim(),
      });
      notify.success('Renovación rechazada.');
      setShowRechazarModal(false);
      setSelectedRenovacion(null);
      fetchRenovaciones();
    } catch (error) {
      notify.error(error.response?.data?.error || 'Error al rechazar renovación');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (val) => <span className="font-mono text-xs font-bold text-slate-500">#{val}</span>
    },
    {
      key: 'poliza_original_numero',
      label: 'Póliza Original',
      render: (val) => <span className="font-mono text-xs font-bold text-slate-700">{val || 'N/A'}</span>
    },
    {
      key: 'motivo_solicitud',
      label: 'Motivo',
      render: (val) => (
        <span className="text-xs text-slate-500 max-w-xs block truncate" title={val}>{val || '—'}</span>
      )
    },
    {
      key: 'nuevo_plazo_anios',
      label: 'Nuevo Plazo',
      render: (val) => <span className="text-sm font-bold text-slate-700">{val} año(s)</span>
    },
    {
      key: 'fecha_solicitud',
      label: 'Solicitada',
      render: (val) => <span className="text-xs text-slate-500">{new Date(val).toLocaleDateString()}</span>
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          val === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
          val === 'APROBADA' ? 'bg-emerald-100 text-emerald-700' :
          'bg-red-100 text-red-700'
        }`}>
          {val}
        </span>
      )
    },
    {
      key: 'poliza_nueva_numero',
      label: 'Nueva Póliza',
      render: (val) => val
        ? <span className="font-mono text-xs font-bold text-emerald-600">{val}</span>
        : <span className="text-xs text-slate-300">—</span>
    },
  ];

  const filtered = renovaciones.filter(r =>
    (r.poliza_original_numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.motivo_solicitud || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
          <FiRefreshCcw className="text-blue-600" /> Solicitudes de Renovación
        </h1>
        <p className="text-slate-500 font-medium mt-1">Gestiona las renovaciones de pólizas de tus clientes.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de póliza o motivo..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filtered}
          loading={loading}
          customActions={(item) => (
            item.estado === 'PENDIENTE' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRenovacion(item);
                    setPctAjuste(0);
                    setObservaciones('');
                    setShowAprobarModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition flex items-center gap-1 text-xs font-bold"
                >
                  <FiCheck size={12} /> Aprobar
                </button>
                <button
                  onClick={() => {
                    setSelectedRenovacion(item);
                    setMotivoRechazo('');
                    setShowRechazarModal(true);
                  }}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-1 text-xs font-bold"
                >
                  <FiX size={12} /> Rechazar
                </button>
              </div>
            ) : null
          )}
        />
      </div>

      {/* Modal Aprobar */}
      {showAprobarModal && selectedRenovacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-50 px-6 py-5 border-b border-emerald-100">
              <h2 className="text-xl font-black text-emerald-800 flex items-center gap-2">
                <FiCheck /> Aprobar Renovación #{selectedRenovacion.id}
              </h2>
              <p className="text-sm text-emerald-700 mt-1">
                Póliza: <strong>{selectedRenovacion.poliza_original_numero}</strong> → Plazo: {selectedRenovacion.nuevo_plazo_anios} año(s)
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Ajuste de Prima (%)
                </label>
                <input
                  type="number"
                  value={pctAjuste}
                  onChange={(e) => setPctAjuste(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-300 font-bold"
                  min="0" max="100" step="0.5"
                  placeholder="0 = sin ajuste"
                />
                <p className="text-xs text-slate-400 mt-1">Porcentaje de incremento sobre la prima original (0 = sin cambios)</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
                  rows={3}
                  placeholder="Notas adicionales sobre la aprobación..."
                />
              </div>
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowAprobarModal(false)}
                className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">
                Cancelar
              </button>
              <button onClick={handleAprobar} disabled={processing}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2">
                {processing ? 'Procesando...' : <><FiCheck /> Confirmar Aprobación</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {showRechazarModal && selectedRenovacion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-5 border-b border-red-100">
              <h2 className="text-xl font-black text-red-800 flex items-center gap-2">
                <FiAlertCircle /> Rechazar Renovación #{selectedRenovacion.id}
              </h2>
              <p className="text-sm text-red-700 mt-1">
                Póliza: <strong>{selectedRenovacion.poliza_original_numero}</strong>
              </p>
            </div>
            <div className="p-6">
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                Motivo del Rechazo <span className="text-red-400">*</span>
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-red-300 resize-none"
                rows={4}
                placeholder="Describa el motivo del rechazo (mínimo 5 caracteres)..."
              />
            </div>
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button onClick={() => setShowRechazarModal(false)}
                className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">
                Cancelar
              </button>
              <button onClick={handleRechazar} disabled={processing}
                className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2">
                {processing ? 'Procesando...' : <><FiX /> Confirmar Rechazo</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}