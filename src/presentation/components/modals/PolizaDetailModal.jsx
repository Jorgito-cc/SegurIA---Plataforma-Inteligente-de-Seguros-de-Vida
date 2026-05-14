import { FiX, FiUser, FiFileText, FiShield, FiCheckCircle, FiXCircle } from "react-icons/fi";

export default function PolizaDetailModal({ poliza, onClose }) {
  if (!poliza) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800">Detalle de Póliza</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{poliza.numero_poliza}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <FiX size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Info Básica */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</span>
              <p className="text-sm font-bold text-slate-700">{poliza.cotizacion?.cliente?.email || 'N/A'}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</span>
              <div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                  poliza.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {poliza.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Beneficiarios */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FiUser className="text-blue-500" /> Beneficiarios Registrados
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {poliza.beneficiarios?.map((ben, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{ben.nombre_completo}</p>
                    <p className="text-xs text-slate-500">{ben.parentesco} • {new Date(ben.fecha_nacimiento).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-blue-600">{ben.porcentaje_asignado}%</span>
                  </div>
                </div>
              ))}
              {(!poliza.beneficiarios || poliza.beneficiarios.length === 0) && (
                <p className="text-sm text-slate-400 italic">No hay beneficiarios registrados.</p>
              )}
            </div>
          </div>

          {/* Expediente */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FiFileText className="text-purple-500" /> Estado del Expediente
            </h3>
            <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Documentación KYC</p>
                <p className="text-xs text-slate-500">Actualizado: {new Date(poliza.expediente?.fecha_actualizacion || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {poliza.expediente?.validado_por_analista ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full">
                    <FiCheckCircle /> Validado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 px-3 py-1 rounded-full">
                    <FiXCircle /> Pendiente
                  </span>
                )}
              </div>
            </div>
            {poliza.expediente?.observaciones_analista && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                <strong>Obs:</strong> {poliza.expediente.observaciones_analista}
              </div>
            )}
          </div>

          {/* Detalles Financieros */}
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Prima Total Facturada</p>
                <p className="text-3xl font-black">${Number(poliza.prima_final_facturada).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Plan</p>
                <p className="text-sm font-bold">{poliza.cotizacion?.plan?.nombre || 'Seguro de Vida'}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Vigencia desde</p>
                <p className="text-sm font-bold">{new Date(poliza.fecha_inicio_vigencia).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Vencimiento</p>
                <p className="text-sm font-bold">{new Date(poliza.fecha_vencimiento).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 transition">
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
