import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { notify } from '../notifications/notify';
import { FiX, FiCheck, FiPlus, FiTrash2, FiUser, FiShield } from 'react-icons/fi';

// Calcular edad a partir de fecha_nacimiento (YYYY-MM-DD)
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

const beneficiarioVacio = () => ({
  nombre_completo: '',
  documento_identidad: '',
  parentesco: 'OTRO',
  porcentaje_asignado: 100,
  fecha_nacimiento: '',
  tutor: null,
});

const tutorVacio = () => ({
  nombre_completo: '',
  documento_identidad: '',
  fecha_nacimiento: '',
  telefono: '',
  direccion: '',
});

export default function EmitirPolizaModal({ onClose }) {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState('');
  const [beneficiarios, setBeneficiarios] = useState([beneficiarioVacio()]);

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(ENDPOINTS.cotizaciones);
        let data = response.data.results || response.data;
        data = data.filter(c => c.estado === 'ACEPTADA' && c.expediente?.validado_por_analista === true);
        setCotizaciones(data);
      } catch (error) {
        notify.error('Error al cargar cotizaciones aceptadas');
      } finally {
        setLoading(false);
      }
    };
    fetchCotizaciones();
  }, []);

  const addBeneficiario = () => setBeneficiarios([...beneficiarios, beneficiarioVacio()]);

  const removeBeneficiario = (index) => setBeneficiarios(beneficiarios.filter((_, i) => i !== index));

  const updateBeneficiario = (index, field, value) => {
    const updated = [...beneficiarios];
    updated[index] = { ...updated[index], [field]: value };

    // Si cambia la fecha de nacimiento, verificar si necesita tutor
    if (field === 'fecha_nacimiento') {
      const edad = calcularEdad(value);
      if (edad !== null && edad < 18 && !updated[index].tutor) {
        updated[index].tutor = tutorVacio();
      } else if (edad !== null && edad >= 18) {
        updated[index].tutor = null;
      }
    }
    setBeneficiarios(updated);
  };

  const updateTutor = (benefIndex, field, value) => {
    const updated = [...beneficiarios];
    updated[benefIndex] = {
      ...updated[benefIndex],
      tutor: { ...updated[benefIndex].tutor, [field]: value }
    };
    setBeneficiarios(updated);
  };

  const toggleTutor = (index) => {
    const updated = [...beneficiarios];
    updated[index].tutor = updated[index].tutor ? null : tutorVacio();
    setBeneficiarios(updated);
  };

  const totalPorcentaje = beneficiarios.reduce((acc, b) => acc + Number(b.porcentaje_asignado || 0), 0);

  const handleEmitir = async () => {
    if (!selectedCotizacion) return notify.error('Seleccione una cotización');

    for (let i = 0; i < beneficiarios.length; i++) {
      const b = beneficiarios[i];
      if (!b.nombre_completo.trim()) return notify.error(`Beneficiario #${i + 1}: falta el nombre completo.`);
      if (!b.fecha_nacimiento) return notify.error(`Beneficiario #${i + 1}: falta la fecha de nacimiento.`);
      const edad = calcularEdad(b.fecha_nacimiento);
      if (edad !== null && edad < 18) {
        if (!b.tutor) return notify.error(`Beneficiario #${i + 1} es menor de edad. Debe registrar un tutor legal.`);
        if (!b.tutor.nombre_completo.trim()) return notify.error(`Tutor del beneficiario #${i + 1}: falta el nombre.`);
        if (!b.tutor.documento_identidad.trim()) return notify.error(`Tutor del beneficiario #${i + 1}: falta el documento de identidad.`);
        if (!b.tutor.fecha_nacimiento) return notify.error(`Tutor del beneficiario #${i + 1}: falta la fecha de nacimiento.`);
      }
    }

    if (totalPorcentaje !== 100) return notify.error(`Los porcentajes deben sumar 100%. Actualmente: ${totalPorcentaje}%`);

    try {
      setSubmitting(true);
      const beneficiariosPayload = beneficiarios.map(b => ({
        nombre_completo: b.nombre_completo.trim(),
        documento_identidad: b.documento_identidad || null,
        parentesco: b.parentesco,
        porcentaje_asignado: Number(b.porcentaje_asignado),
        fecha_nacimiento: b.fecha_nacimiento,
        tutor: b.tutor ? {
          nombre_completo: b.tutor.nombre_completo.trim(),
          documento_identidad: b.tutor.documento_identidad.trim(),
          fecha_nacimiento: b.tutor.fecha_nacimiento,
          telefono: b.tutor.telefono || '',
          direccion: b.tutor.direccion || '',
        } : null,
      }));

      await apiClient.post(`${ENDPOINTS.polizas}emitir/`, {
        cotizacion_id: parseInt(selectedCotizacion),
        beneficiarios: beneficiariosPayload,
      });
      notify.success('¡Póliza emitida correctamente!');
      onClose();
    } catch (error) {
      const errMsg = error.response?.data?.error || JSON.stringify(error.response?.data) || 'Error al emitir póliza';
      notify.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">

        {/* Header */}
        <div className="bg-slate-50 px-8 py-5 flex justify-between items-center border-b border-slate-100 flex-shrink-0">
          <h2 className="text-2xl font-black text-slate-800">Emisión de Póliza</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <FiX size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8">

          {/* Selección de Cotización */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Cotización con KYC Validado</label>
            {loading ? (
              <p className="text-sm text-slate-400 italic animate-pulse">Cargando cotizaciones...</p>
            ) : (
              <>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  onChange={(e) => setSelectedCotizacion(e.target.value)}
                  value={selectedCotizacion}
                >
                  <option value="">-- Seleccione una cotización --</option>
                  {cotizaciones.map(c => (
                    <option key={c.id} value={c.id}>
                      COT-{c.id} | {c.cliente_email} | {c.plan_detalle?.nombre} | ${Number(c.capital_asegurado).toLocaleString()}
                    </option>
                  ))}
                </select>
                {cotizaciones.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2 font-bold bg-amber-50 px-3 py-2 rounded-lg">
                    ⚠ No hay cotizaciones listas. Valide primero los documentos KYC en "Expedientes KYC".
                  </p>
                )}
              </>
            )}
          </div>

          {/* Beneficiarios */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FiUser className="text-emerald-600" /> Beneficiarios
              </h3>
              <button type="button" onClick={addBeneficiario}
                className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
                <FiPlus /> Añadir
              </button>
            </div>

            {/* Indicador total */}
            <div className={`flex justify-between px-4 py-2.5 rounded-xl text-sm font-bold border ${
              totalPorcentaje === 100
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span>Total: <strong>{totalPorcentaje}%</strong></span>
              <span>{totalPorcentaje === 100 ? '✓ Correcto' : `Faltan ${100 - totalPorcentaje}%`}</span>
            </div>

            {beneficiarios.map((b, index) => {
              const edad = calcularEdad(b.fecha_nacimiento);
              const esMenor = edad !== null && edad < 18;

              return (
                <div key={index} className="rounded-2xl border border-slate-200 overflow-hidden">
                  {/* Cabecera del beneficiario */}
                  <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Beneficiario #{index + 1}</span>
                      {edad !== null && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${esMenor ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {edad} años {esMenor ? '· MENOR DE EDAD' : ''}
                        </span>
                      )}
                    </div>
                    {beneficiarios.length > 1 && (
                      <button type="button" onClick={() => removeBeneficiario(index)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo *</label>
                        <input type="text" value={b.nombre_completo}
                          onChange={(e) => updateBeneficiario(index, 'nombre_completo', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                          placeholder="Ej. María López García" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Documento de Identidad</label>
                        <input type="text" value={b.documento_identidad}
                          onChange={(e) => updateBeneficiario(index, 'documento_identidad', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                          placeholder="CI / Pasaporte" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha de Nacimiento *</label>
                        <input type="date" value={b.fecha_nacimiento}
                          onChange={(e) => updateBeneficiario(index, 'fecha_nacimiento', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-300 text-sm"
                          max={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parentesco</label>
                        <select value={b.parentesco}
                          onChange={(e) => updateBeneficiario(index, 'parentesco', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-300 text-sm">
                          <option value="CONYUGE">Cónyuge</option>
                          <option value="HIJO">Hijo/a</option>
                          <option value="PADRE">Padre/Madre</option>
                          <option value="HERMANO">Hermano/a</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">% Asignado</label>
                        <input type="number" value={b.porcentaje_asignado}
                          onChange={(e) => updateBeneficiario(index, 'porcentaje_asignado', e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-300 font-bold text-sm"
                          min="1" max="100" />
                      </div>
                    </div>

                    {/* Toggle tutor manual */}
                    {!esMenor && (
                      <button type="button" onClick={() => toggleTutor(index)}
                        className={`text-xs font-bold flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${b.tutor ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-slate-500 bg-slate-50 hover:bg-slate-100'}`}>
                        <FiShield size={13} />
                        {b.tutor ? 'Quitar tutor legal' : '+ Añadir tutor legal (opcional)'}
                      </button>
                    )}

                    {/* Sección Tutor Legal */}
                    {(esMenor || b.tutor) && (
                      <div className="mt-2 bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-black text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                          <FiShield size={13} /> Tutor Legal {esMenor ? '(Requerido — menor de edad)' : '(Opcional)'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Nombre Completo *</label>
                            <input type="text" value={b.tutor?.nombre_completo || ''}
                              onChange={(e) => updateTutor(index, 'nombre_completo', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-orange-200 outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                              placeholder="Nombre completo del tutor" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Documento de Identidad *</label>
                            <input type="text" value={b.tutor?.documento_identidad || ''}
                              onChange={(e) => updateTutor(index, 'documento_identidad', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-orange-200 outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                              placeholder="CI / Pasaporte del tutor" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Fecha de Nacimiento *</label>
                            <input type="date" value={b.tutor?.fecha_nacimiento || ''}
                              onChange={(e) => updateTutor(index, 'fecha_nacimiento', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-orange-200 outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                              max={new Date().toISOString().split('T')[0]} />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Teléfono</label>
                            <input type="tel" value={b.tutor?.telefono || ''}
                              onChange={(e) => updateTutor(index, 'telefono', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-orange-200 outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                              placeholder="+591 70000000" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-orange-600 uppercase mb-1">Dirección</label>
                            <input type="text" value={b.tutor?.direccion || ''}
                              onChange={(e) => updateTutor(index, 'direccion', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-orange-200 outline-none focus:ring-2 focus:ring-orange-300 text-sm bg-white"
                              placeholder="Calle, ciudad..." />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 flex-shrink-0">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition">
            Cancelar
          </button>
          <button
            onClick={handleEmitir}
            disabled={submitting || !selectedCotizacion || totalPorcentaje !== 100}
            className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? 'Emitiendo...' : 'Confirmar Emisión'} <FiCheck />
          </button>
        </div>
      </div>
    </div>
  );
}