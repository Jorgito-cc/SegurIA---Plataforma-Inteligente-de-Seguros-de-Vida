import { useState, useEffect } from "react";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { notify } from "../../components/notifications/notify";
import { 
  FiFileText, 
  FiSearch, 
  FiClock, 
  FiShield, 
  FiArrowRight, 
  FiLoader, 
  FiX, 
  FiAlertTriangle, 
  FiInfo, 
  FiRefreshCcw 
} from "react-icons/fi";

export default function AgentePolizasPage() {
  const [polizas, setPolizas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal de periodo de gracia
  const [selectedPoliza, setSelectedPoliza] = useState(null);
  const [showGraciaModal, setShowGraciaModal] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [submittingGracia, setSubmittingGracia] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchPolizas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${ENDPOINTS.polizas}historial/`);
      const dataList = response.data.polizas || response.data.results || (Array.isArray(response.data) ? response.data : []);
      setPolizas(dataList);
    } catch (error) {
      console.error("Error fetching polizas:", error);
      notify.error("No se pudo cargar el historial de pólizas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolizas();
  }, []);

  const handleOpenGraciaModal = (poliza) => {
    setSelectedPoliza(poliza);
    setMotivo("");
    setFormError("");
    setShowGraciaModal(true);
  };

  const handleCloseGraciaModal = () => {
    setSelectedPoliza(null);
    setShowGraciaModal(false);
    setMotivo("");
    setFormError("");
  };

  const handleAplicarPeriodoGracia = async (e) => {
    e.preventDefault();
    if (!motivo || motivo.trim().length < 10) {
      setFormError("La justificación debe tener al menos 10 caracteres.");
      return;
    }

    try {
      setSubmittingGracia(true);
      setFormError("");
      const response = await apiClient.post(
        `${ENDPOINTS.polizas}${selectedPoliza.id}/aplicar_periodo_gracia/`,
        { motivo: motivo.trim() }
      );
      
      const resData = response.data;
      notify.success(
        `${resData.mensaje || "Período de gracia aplicado."} Vence el: ${
          resData.fecha_fin ? new Date(resData.fecha_fin).toLocaleDateString() : "próximos 30 días"
        }`
      );
      
      handleCloseGraciaModal();
      fetchPolizas();
    } catch (error) {
      console.error("Error al aplicar periodo de gracia:", error);
      const errorMsg = error.response?.data?.error || "No se pudo aplicar el período de gracia.";
      notify.error(errorMsg);
      setFormError(errorMsg);
    } finally {
      setSubmittingGracia(false);
    }
  };

  // Solicitar renovación estándar
  const handleSolicitarRenovacion = async (poliza) => {
    try {
      notify.info("Enviando solicitud de renovación...");
      await apiClient.post(`${ENDPOINTS.polizas}${poliza.id}/solicitar_renovacion/`, {
        motivo_solicitud: "Renovación estándar solicitada por el agente de seguros.",
        nuevo_plazo_anios: 1
      });
      notify.success("Solicitud de renovación enviada con éxito.");
      fetchPolizas();
    } catch (error) {
      console.error("Error al renovar:", error);
      notify.error(error.response?.data?.error || "Error al solicitar renovación de póliza.");
    }
  };

  // Filtrar pólizas por número o por nombre/correo del cliente
  const filteredPolizas = polizas.filter((p) => {
    const searchVal = searchTerm.toLowerCase();
    const polNum = (p.numero_poliza || "").toLowerCase();
    const cliName = (p.cliente_nombre || "").toLowerCase();
    const cliEmail = (p.cliente_email || "").toLowerCase();
    return polNum.includes(searchVal) || cliName.includes(searchVal) || cliEmail.includes(searchVal);
  });

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "ACTIVA":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">ACTIVA</span>;
      case "SUSPENDIDA":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">SUSPENDIDA</span>;
      case "VENCIDA":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">VENCIDA</span>;
      case "CANCELADA":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">CANCELADA</span>;
      case "RENOVADA":
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">RENOVADA</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{estado}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <FiFileText className="text-indigo-600" /> Pólizas de Seguro
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Administra los contratos de seguros, renovaciones y prórrogas de cobertura.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de póliza o cliente..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Número de Póliza</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Plan contratado</th>
                <th className="p-4">Prima Facturada</th>
                <th className="p-4">Fecha de Vencimiento</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
                      <FiLoader className="animate-spin text-indigo-600 text-lg" />
                      <span>Cargando pólizas registradas...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPolizas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    No se encontraron contratos de póliza para mostrar.
                  </td>
                </tr>
              ) : (
                filteredPolizas.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 pl-6 font-mono text-xs font-bold text-slate-800">
                      {p.numero_poliza}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">
                          {p.cliente_nombre || "Cliente sin nombre"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {p.cliente_email}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 font-semibold">
                      {p.plan_nombre || "Plan Estándar"}
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      ${Number(p.prima_final_facturada || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : "Sin fecha"}
                    </td>
                    <td className="p-4">
                      {getEstadoBadge(p.estado)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {p.estado === "SUSPENDIDA" ? (
                          <button
                            onClick={() => handleOpenGraciaModal(p)}
                            className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition px-3.5 py-2 rounded-xl font-bold border border-indigo-100 cursor-pointer"
                          >
                            Aplicar Gracia <FiArrowRight />
                          </button>
                        ) : (p.estado === "ACTIVA" || p.estado === "VENCIDA") ? (
                          <button
                            onClick={() => handleSolicitarRenovacion(p)}
                            className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition px-3.5 py-2 rounded-xl font-bold border border-slate-200 cursor-pointer"
                            title="Solicitar Renovación de Contrato"
                          >
                            Renovar <FiRefreshCcw />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Sin acciones</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal interactivo - Período de gracia */}
      {showGraciaModal && selectedPoliza && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col transform transition-all duration-300">
            
            {/* Cabecera del modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <FiClock className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    Aplicar Período de Gracia
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Póliza: <span className="font-mono font-bold text-indigo-600">{selectedPoliza.numero_poliza}</span> | {selectedPoliza.cliente_nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseGraciaModal}
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleAplicarPeriodoGracia} className="p-6 space-y-4">
              
              {/* Bloque Informativo de Regla de Negocio */}
              <div className="p-4 border border-indigo-100 bg-indigo-50/40 rounded-2xl flex items-start gap-3">
                <FiInfo className="text-indigo-600 text-lg mt-0.5 flex-shrink-0" />
                <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                  Se otorgará una prórroga rígida de 30 días calendario manteniendo la cobertura activa. Si el cliente no regulariza sus pagos en este plazo, la póliza pasará a CANCELADA.
                </p>
              </div>

              {/* Formulario de entrada */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Motivo de la Prórroga / Justificación
                </label>
                <textarea
                  rows={4}
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Escriba la justificación médica o financiera detallada de esta prórroga de pago..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-700 resize-none placeholder:text-slate-400"
                />
              </div>

              {/* Alertas de error */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <FiAlertTriangle className="flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseGraciaModal}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingGracia}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition text-xs shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submittingGracia ? (
                    <>
                      <FiLoader className="animate-spin" /> Concediendo...
                    </>
                  ) : (
                    "Conceder 30 Días"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}