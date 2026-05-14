import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { notify } from '../notifications/notify';
import { FiTimes, FiCheck, FiPlus, FiTrash2, FiUser } from 'react-icons/fi';

export default function EmitirPolizaModal({ onClose }) {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [beneficiarios, setBeneficiarios] = useState([
    { nombre_completo: '', parentesco: 'OTRO', porcentaje_asignado: 100, fecha_nacimiento: '' }
  ]);

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`${ENDPOINTS.cotizaciones}?estado=ACEPTADA`);
        setCotizaciones(response.data.results || response.data);
      } catch (error) {
        notify.error('Error al cargar cotizaciones aceptadas');
      } finally {
        setLoading(false);
      }
    };
    fetchCotizaciones();
  }, []);

  const addBeneficiario = () => {
    setBeneficiarios([...beneficiarios, { nombre_completo: '', parentesco: 'OTRO', porcentaje_asignado: 0, fecha_nacimiento: '' }]);
  };

  const removeBeneficiario = (index) => {
    setBeneficiarios(beneficiarios.filter((_, i) => i !== index));
  };

  const updateBeneficiario = (index, field, value) => {
    const updated = [...beneficiarios];
    updated[index][field] = value;
    setBeneficiarios(updated);
  };

  const handleEmitir = async () => {
    if (!selectedCotizacion) return notify.error('Seleccione una cotización');
    
    const totalPorcentaje = beneficiarios.reduce((acc, b) => acc + Number(b.porcentaje_asignado), 0);
    if (totalPorcentaje !== 100) return notify.error('La suma de porcentajes debe ser 100%');

    try {
      setSubmitting(true);
      await apiClient.post(`${ENDPOINTS.polizas}emitir/`, {
        cotizacion_id: selectedCotizacion,
        beneficiarios: beneficiarios
      });
      notify.success('Póliza emitida correctamente');
      onClose();
    } catch (error) {
      notify.error(error.response?.data?.error || 'Error al emitir póliza');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-2xl font-black text-slate-800">Emisión de Póliza</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <FiTimes size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          {/* Selección de Cotización */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Seleccionar Cotización Aceptada</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              onChange={(e) => setSelectedCotizacion(e.target.value)}
              value={selectedCotizacion || ''}
            >
              <option value="">-- Seleccione una cotización --</option>
              {cotizaciones.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.id} - {c.cliente?.email} - {c.plan?.nombre} (${Number(c.capital_asegurado).toLocaleString()})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-2 italic">Solo aparecen cotizaciones en estado ACEPTADA y con documentación validada.</p>
          </div>

          {/* Registro de Beneficiarios */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Beneficiarios</h3>
              <button 
                onClick={addBeneficiario}
                className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                <FiPlus /> Añadir Beneficiario
              </button>
            </div>

            {beneficiarios.map((b, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                {beneficiarios.length > 1 && (
                  <button 
                    onClick={() => removeBeneficiario(index)}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={b.nombre_completo}
                    onChange={(e) => updateBeneficiario(index, 'nombre_completo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none"
                    placeholder="Ej. Maria Lopez"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parentesco</label>
                  <select 
                    value={b.parentesco}
                    onChange={(e) => updateBeneficiario(index, 'parentesco', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none"
                  >
                    <option value="CONYUGE">Cónyuge</option>
                    <option value="HIJO">Hijo/a</option>
                    <option value="PADRE">Padre/Madre</option>
                    <option value="HERMANO">Hermano/a</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">% Asignado</label>
                  <input 
                    type="number" 
                    value={b.porcentaje_asignado}
                    onChange={(e) => updateBeneficiario(index, 'porcentaje_asignado', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none font-bold"
                    placeholder="100"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800">Cancelar</button>
          <button 
            onClick={handleEmitir}
            disabled={submitting || !selectedCotizacion}
            className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? 'Emitiendo...' : 'Confirmar Emisión'} <FiCheck />
          </button>
        </div>
      </div>
    </div>
  );
}
