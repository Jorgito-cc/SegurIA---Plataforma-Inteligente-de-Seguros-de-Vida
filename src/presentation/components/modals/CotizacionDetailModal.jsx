import { FiTimes, FiUser, FiActivity, FiShield, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function CotizacionDetailModal({ cotizacion, onClose, onAccept }) {
  if (!cotizacion) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800">Detalle de Cotización</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">#{cotizacion.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <FiTimes size={24} className="text-slate-500" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Info del Cliente */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FiUser size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-blue-900">{cotizacion.cliente?.email}</p>
              <p className="text-xs text-blue-700">Solicitante del Seguro</p>
            </div>
          </div>

          {/* Análisis de Riesgo IA */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FiActivity className="text-emerald-500" /> Análisis Actuarial e IA
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Nivel de Riesgo</p>
                <span className={`px-2 py-1 rounded-full text-xs font-black ${cotizacion.nivel_riesgo === 'BAJO' ? 'bg-green-100 text-green-700' :
                    cotizacion.nivel_riesgo === 'MEDIO' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                  }`}>
                  {cotizacion.nivel_riesgo}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Score IA</p>
                <p className="text-xl font-black text-slate-800">{cotizacion.score_riesgo || '85'}/100</p>
              </div>
            </div>
          </div>

          {/* Detalles del Plan */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FiShield className="text-blue-500" /> Plan y Cobertura
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</span>
                <p className="text-sm font-bold text-slate-700">{cotizacion.plan?.nombre}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Asegurado</span>
                <p className="text-sm font-black text-slate-900">${Number(cotizacion.capital_asegurado).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plazo</span>
                <p className="text-sm font-bold text-slate-700">{cotizacion.plazo_anios} años</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frecuencia Pago</span>
                <p className="text-sm font-bold text-slate-700">{cotizacion.frecuencia_pago}</p>
              </div>
            </div>
          </div>

          {/* Resultado Financiero */}
          <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1">Prima Anual Calculada</p>
              <h3 className="text-4xl font-black">${Number(cotizacion.prima_ajustada_anual).toLocaleString()}</h3>
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-100 italic">Incluye recargos por riesgo y salud</span>
                <span className="text-xl font-black">${Number(cotizacion.prima_ajustada_anual / 12).toLocaleString()}/mes</span>
              </div>
            </div>
            <div className="absolute top-[-20px] right-[-20px] opacity-10">
              <FiActivity size={150} />
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition">Cerrar</button>
          {cotizacion.estado === 'PENDIENTE' && (
            <button
              onClick={() => {
                onAccept(cotizacion.id);
                onClose();
              }}
              className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center gap-2"
            >
              <FiCheckCircle /> Aceptar Cotización
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
