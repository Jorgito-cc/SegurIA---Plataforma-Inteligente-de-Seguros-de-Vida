import React, { useState, useEffect } from "react";
import { 
  FiAlertTriangle, 
  FiSearch, 
  FiActivity, 
  FiFileText, 
  FiCpu, 
  FiDollarSign, 
  FiCheckCircle, 
  FiXCircle, 
  FiInfo, 
  FiClock, 
  FiArrowRight, 
  FiArrowLeft,
  FiExternalLink,
  FiLoader
} from "react-icons/fi";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { notify } from "../../components/notifications/notify";

export default function AgenteSiniestrosEvaluacionPage() {
  const [activeTab, setActiveTab] = useState("bandeja"); // bandeja | auditoria | liquidacion
  const [siniestros, setSiniestros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Siniestro seleccionado
  const [selectedSiniestro, setSelectedSiniestro] = useState(null);
  
  // Estados de Auditoría Médica e IA (Pestaña 2)
  const [validatingCarencia, setValidatingCarencia] = useState(false);
  const [resultadoCarencia, setResultadoCarencia] = useState(null);
  const [evaluatingIA, setEvaluatingIA] = useState(false);
  const [evaluacionIAData, setEvaluacionIAData] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resolucionCompletada, setResolucionCompletada] = useState(false);
  const [pdfDictamenUrl, setPdfDictamenUrl] = useState("");
  const [resolucionForm, setResolucionForm] = useState({
    decision: "APROBADO",
    justificacion: ""
  });

  // Estados de Liquidación Financiera (Pestaña 3)
  const [indemnizacionData, setIndemnizacionData] = useState(null);
  const [approvingMonto, setApprovingMonto] = useState(false);
  const [montoForm, setMontoForm] = useState({
    monto_aprobado: ""
  });
  const [paying, setPaying] = useState(false);
  const [pagoForm, setPagoForm] = useState({
    comprobante_url: ""
  });

  // Variables derivadas de indemnizacionData para unificación de endpoints y serializadores
  const targetIndemnizacionId = indemnizacionData?.id || indemnizacionData?.indemnizacion_id;
  const montoAprobado = indemnizacionData?.monto_aprobado || indemnizacionData?.monto_pagado;
  const comprobanteUrl = indemnizacionData?.comprobante_pago_url || indemnizacionData?.comprobante_url;
  const isLiquidada = 
    indemnizacionData?.estado === "PAGADA" || 
    indemnizacionData?.estado === "PAGADO" || 
    indemnizacionData?.estado_pago === "PAGADA" || 
    indemnizacionData?.estado_pago === "PAGADO" || 
    selectedSiniestro?.estado === "PAGADO" ||
    selectedSiniestro?.estado === "PAGADA";

  // Cargar siniestros al inicio
  const fetchSiniestros = async () => {
    try {
      setLoading(true);
      // Consume GET /api/siniestros/
      const response = await apiClient.get("/siniestros/");
      setSiniestros(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching siniestros:", error);
      notify.error("Error al cargar la bandeja de siniestros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiniestros();
  }, []);

  // Seleccionar y cambiar de pestaña
  const handleEvaluarSiniestro = (siniestro) => {
    setSelectedSiniestro(siniestro);
    
    // Resetear estados de evaluación asociados al siniestro anterior
    setResultadoCarencia(null);
    setEvaluacionIAData(null);
    setResolucionCompletada(false);
    setPdfDictamenUrl("");
    setResolucionForm({ decision: "APROBADO", justificacion: "" });
    setIndemnizacionData(null);
    setMontoForm({ monto_aprobado: "" });
    setPagoForm({ comprobante_url: "" });

    // Intentar precargar datos si el siniestro ya tiene evaluación o indemnización previa
    if (siniestro.evaluacion) {
      setEvaluacionIAData({
        analisis_ia: siniestro.evaluacion.analisis_ia,
        recomendacion_ia: siniestro.evaluacion.recomendacion_ia
      });
      if (siniestro.evaluacion.decision_final && siniestro.evaluacion.decision_final !== "PENDIENTE") {
        setResolucionCompletada(true);
        setResolucionForm({
          decision: siniestro.evaluacion.decision_final,
          justificacion: siniestro.evaluacion.justificacion_agente || ""
        });
        if (siniestro.evaluacion.dictamen_pdf_url) {
          setPdfDictamenUrl(siniestro.evaluacion.dictamen_pdf_url);
        }
      }
    }

    if (siniestro.indemnizacion) {
      setIndemnizacionData(siniestro.indemnizacion);
      setMontoForm({ monto_aprobado: siniestro.indemnizacion.monto_aprobado || "" });
      setPagoForm({ comprobante_url: siniestro.indemnizacion.comprobante_url || "" });
    }

    setActiveTab("auditoria");
    notify.success(`Siniestro #${siniestro.id} seleccionado`);
  };

  // Validar periodo de carencia
  const handleValidarCarencia = async () => {
    if (!selectedSiniestro) return;
    try {
      setValidatingCarencia(true);
      // POST /api/siniestros/{id}/validar_carencia/
      const response = await apiClient.post(`/siniestros/${selectedSiniestro.id}/validar_carencia/`);
      setResultadoCarencia(response.data);
      notify.success("Período de carencia validado correctamente");
    } catch (error) {
      console.error(error);
      notify.error("Error al validar el período de carencia");
    } finally {
      setValidatingCarencia(false);
    }
  };

  // Iniciar Evaluación Cognitiva con IA
  const handleIniciarIAEvaluacion = async () => {
    if (!selectedSiniestro) return;
    try {
      setEvaluatingIA(true);
      // POST /api/evaluaciones/{siniestro_id}/iniciar/
      const response = await apiClient.post(`/evaluaciones/${selectedSiniestro.id}/iniciar/`);
      setEvaluacionIAData(response.data.evaluacion);
      notify.success("Evaluación cognitiva con IA completada por Gemini");
    } catch (error) {
      console.error(error);
      notify.error("Error en la evaluación cognitiva con IA");
    } finally {
      setEvaluatingIA(false);
    }
  };

  // Resolver la evaluación por parte del Agente
  const handleResolverSiniestro = async (e) => {
    e.preventDefault();
    if (!selectedSiniestro) return;
    if (!resolucionForm.justificacion.trim()) {
      notify.error("La justificación es obligatoria");
      return;
    }
    if (resolucionForm.justificacion.trim().length < 20) {
      notify.error("La justificación debe tener al menos 20 caracteres");
      return;
    }

    const evaluacionId = selectedSiniestro.evaluacion?.id || evaluacionIAData?.id;
    if (!evaluacionId) {
      notify.error("Debe iniciar la evaluación cognitiva con IA antes de poder resolver el siniestro.");
      return;
    }

    try {
      setResolving(true);
      // POST /api/evaluaciones/{id}/resolver/
      const response = await apiClient.post(`/evaluaciones/${evaluacionId}/resolver/`, {
        decision: resolucionForm.decision,
        justificacion: resolucionForm.justificacion
      });
      
      setResolucionCompletada(true);
      if (response.data.dictamen_pdf_url) {
        setPdfDictamenUrl(response.data.dictamen_pdf_url);
      }
      
      // Actualizar el estado del siniestro seleccionado localmente
      const updatedSiniestro = {
        ...selectedSiniestro,
        estado: resolucionForm.decision,
        evaluacion: {
          ...selectedSiniestro.evaluacion,
          decision_final: response.data.decision,
          justificacion_agente: resolucionForm.justificacion,
          dictamen_pdf_url: response.data.dictamen_pdf_url
        }
      };
      setSelectedSiniestro(updatedSiniestro);
      
      // Si la evaluación fue aprobada, podemos estructurar los datos de la indemnización creada
      if (response.data.indemnizacion_creada) {
        setIndemnizacionData({
          id: response.data.indemnizacion_creada.id,
          monto_aprobado: "",
          estado_pago: "PENDIENTE",
          capital_asegurado: selectedSiniestro.poliza_capital_asegurado || 50000
        });
      } else {
        // Estructura por defecto para habilitar el flujo
        setIndemnizacionData({
          id: evaluacionId,
          monto_aprobado: "",
          estado_pago: "PENDIENTE",
          capital_asegurado: selectedSiniestro.poliza_capital_asegurado || 50000
        });
      }

      notify.success("Resolución de siniestro registrada exitosamente");
      fetchSiniestros(); // Recargar la bandeja principal
    } catch (error) {
      console.error(error);
      notify.error("Error al registrar la resolución del siniestro");
    } finally {
      setResolving(false);
    }
  };

  // Descargar dictamen PDF de evaluación de siniestro
  const handleDescargarDictamen = async () => {
    if (!selectedSiniestro) return;
    const evaluacionId = selectedSiniestro.evaluacion?.id || evaluacionIAData?.id;
    if (!evaluacionId) {
      notify.error("No se encontró el ID de la evaluación");
      return;
    }

    try {
      notify.info("Generando y descargando dictamen...");
      // GET /api/evaluaciones/{id}/descargar_dictamen/
      const response = await apiClient.get(`/evaluaciones/${evaluacionId}/descargar_dictamen/`, {
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `dictamen_siniestro_${selectedSiniestro.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success("Dictamen descargado correctamente");
    } catch (error) {
      console.error("Error downloading dictamen pdf:", error);
      notify.error("Error al descargar el dictamen en PDF");
    }
  };

  // Aprobar monto de liquidación
  const handleAprobarMonto = async (e) => {
    e.preventDefault();
    if (!indemnizacionData) return;
    if (!montoForm.monto_aprobado || parseFloat(montoForm.monto_aprobado) <= 0) {
      notify.error("Ingrese un monto aprobado válido");
      return;
    }

    try {
      setApprovingMonto(true);
      if (!targetIndemnizacionId) {
        notify.error("No se encontró el ID de la indemnización");
        return;
      }
      // POST /api/indemnizaciones/{id}/aprobar/
      const response = await apiClient.post(`/indemnizaciones/${targetIndemnizacionId}/aprobar/`, {
        monto_aprobado: parseFloat(montoForm.monto_aprobado)
      });
      
      setIndemnizacionData(response.data);
      notify.success("Monto de indemnización aprobado correctamente");
      fetchSiniestros();
    } catch (error) {
      console.error(error);
      notify.error("Error al aprobar el monto de liquidación");
    } finally {
      setApprovingMonto(false);
    }
  };

  // Pagar indemnización
  const handlePagarIndemnizacion = async (e) => {
    e.preventDefault();
    if (!indemnizacionData) return;
    if (!pagoForm.comprobante_url.trim()) {
      notify.error("Ingrese la URL del comprobante de transferencia");
      return;
    }

    try {
      setPaying(true);
      if (!targetIndemnizacionId) {
        notify.error("No se encontró el ID de la indemnización");
        return;
      }
      // POST /api/indemnizaciones/{id}/pagar/
      const response = await apiClient.post(`/indemnizaciones/${targetIndemnizacionId}/pagar/`, {
        comprobante_pago_url: pagoForm.comprobante_url
      });
      
      setIndemnizacionData(response.data);
      
      // Actualizar el estado local para reflejar que está pagada
      if (selectedSiniestro) {
        setSelectedSiniestro({
          ...selectedSiniestro,
          estado: "PAGADO",
          indemnizacion: response.data
        });
      }

      notify.success("¡Indemnización pagada y liquidada de forma masiva y exitosa!");
      fetchSiniestros();
    } catch (error) {
      console.error(error);
      notify.error("Error al registrar el pago de la indemnización");
    } finally {
      setPaying(false);
    }
  };

  // Filtrado de siniestros para la bandeja
  const filteredSiniestros = siniestros.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.id?.toString().includes(term) ||
      s.poliza_numero?.toLowerCase().includes(term) ||
      s.tipo_siniestro?.toLowerCase().includes(term) ||
      s.estado?.toLowerCase().includes(term)
    );
  });

  // Auxiliares de diseño de badges de estado
  const getEstadoBadge = (estado) => {
    const format = {
      REPORTADO: "bg-blue-50 text-blue-700 border-blue-100",
      APROBADO: "bg-emerald-50 text-emerald-700 border-emerald-100",
      RECHAZADO: "bg-rose-50 text-rose-700 border-rose-100",
      PAGADO: "bg-violet-50 text-violet-700 border-violet-100",
      PAGADA: "bg-violet-50 text-violet-700 border-violet-100",
      PROCESANDO: "bg-amber-50 text-amber-700 border-amber-100",
    };
    const style = format[estado?.toUpperCase()] || "bg-slate-50 text-slate-700 border-slate-100";
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
        {estado}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Título Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FiAlertTriangle className="text-indigo-600" /> Evaluación de Siniestros
          </h1>
          <p className="text-slate-500 font-medium">
            Gestión inteligente de auditoría médica, análisis de IA y liquidaciones financieras de siniestros reportados.
          </p>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex space-x-2 md:space-x-4 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("bandeja")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition px-2 whitespace-nowrap ${
            activeTab === "bandeja"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Bandeja de Siniestros
        </button>
        <button
          onClick={() => setActiveTab("auditoria")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition px-2 whitespace-nowrap ${
            activeTab === "auditoria"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Auditoría Médica
          {selectedSiniestro && (
            <span className="ml-1.5 bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.5 rounded-full font-black">
              S-{selectedSiniestro.id}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("analisis_ia")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition px-2 whitespace-nowrap ${
            activeTab === "analisis_ia"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Evaluación por IA
        </button>
        <button
          onClick={() => setActiveTab("resolucion")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition px-2 whitespace-nowrap ${
            activeTab === "resolucion"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Resolución Oficial
        </button>
        <button
          onClick={() => setActiveTab("liquidacion")}
          className={`pb-3 text-xs md:text-sm font-bold border-b-2 transition px-2 whitespace-nowrap ${
            activeTab === "liquidacion"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Liquidación Financiera
        </button>
      </div>

      {/* Contenido de Pestañas */}
      {activeTab === "bandeja" && (
        <div className="space-y-6">
          {/* Tarjeta del Buscador */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar siniestros por ID, código de póliza, tipo o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Tabla de Siniestros */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <FiLoader className="animate-spin text-indigo-600 text-4xl" />
              </div>
            ) : filteredSiniestros.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FiActivity className="mx-auto text-4xl text-slate-300 mb-2" />
                <p className="font-bold">No se encontraron siniestros reportados</p>
                <p className="text-xs text-slate-400">Verifique los filtros o busque otro término.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Póliza</th>
                      <th className="px-6 py-4">Tipo Siniestro</th>
                      <th className="px-6 py-4">Fecha Evento</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                    {filteredSiniestros.map((siniestro) => (
                      <tr key={siniestro.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          SIN-{siniestro.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-indigo-600">
                          {siniestro.poliza_numero || `POL-${siniestro.poliza}`}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {siniestro.tipo_siniestro}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {siniestro.fecha_siniestro || siniestro.fecha_evento}
                        </td>
                        <td className="px-6 py-4">
                          {getEstadoBadge(siniestro.estado)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleEvaluarSiniestro(siniestro)}
                            className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition px-3.5 py-2 rounded-xl font-bold border border-indigo-100"
                          >
                            Evaluar Siniestro <FiArrowRight />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "auditoria" && (
        <div>
          {!selectedSiniestro ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-xl mx-auto my-8">
              <FiFileText className="mx-auto text-5xl text-slate-300 mb-4" />
              <h3 className="text-lg font-black text-slate-800 mb-2">Ningún siniestro seleccionado</h3>
              <p className="text-slate-500 text-sm mb-6">
                Por favor, diríjase a la pestaña "Bandeja de Siniestros" y seleccione un caso para proceder con la auditoría médica.
              </p>
              <button
                onClick={() => setActiveTab("bandeja")}
                className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                Ir a la Bandeja
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">
                      Expediente de Siniestro
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-1">
                      Siniestro SIN-{selectedSiniestro.id}
                    </h2>
                  </div>
                  {getEstadoBadge(selectedSiniestro.estado)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Tipo de Siniestro</span>
                    <span className="text-slate-700 font-bold text-sm">{selectedSiniestro.tipo_siniestro}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Póliza Asociada</span>
                    <span className="text-indigo-600 font-bold text-sm">
                      {selectedSiniestro.poliza_numero || `POL-${selectedSiniestro.poliza}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Fecha del Evento</span>
                    <span className="text-slate-700 font-semibold">{selectedSiniestro.fecha_siniestro || selectedSiniestro.fecha_evento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase font-bold">Capital Asegurado</span>
                    <span className="text-emerald-600 font-black text-sm">
                      ${Number(selectedSiniestro.poliza_capital_asegurado || selectedSiniestro.poliza?.capital_asegurado || 0).toLocaleString()} USD
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-slate-400 block text-xs uppercase font-bold mb-1">Descripción del Evento</span>
                  <p className="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                    {selectedSiniestro.descripcion || "Sin descripción proporcionada."}
                  </p>
                </div>

                {/* Documento de Soporte Cloudinary */}
                {selectedSiniestro.documento_soporte_url || selectedSiniestro.documento_url ? (
                  <div className="flex items-center justify-between p-4 border border-indigo-100 bg-indigo-50/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiFileText className="text-indigo-600 text-2xl" />
                      <div>
                        <span className="block font-bold text-slate-800 text-xs">Documento de Soporte Médico</span>
                        <span className="text-[10px] text-slate-400">Hospedado en Cloudinary</span>
                      </div>
                    </div>
                    <a
                      href={selectedSiniestro.documento_soporte_url || selectedSiniestro.documento_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-black text-indigo-700 hover:underline"
                    >
                      Abrir Documento <FiExternalLink />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl text-xs text-center font-semibold">
                    No se ha adjuntado ningún documento de soporte médico.
                  </div>
                )}

                {/* Botón Periodo de Carencia */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleValidarCarencia}
                    disabled={validatingCarencia}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 text-sm shadow-sm"
                  >
                    {validatingCarencia ? (
                      <>
                        <FiLoader className="animate-spin" /> Validando período...
                      </>
                    ) : (
                      "Validar Período de Carencia"
                    )}
                  </button>

                  {resultadoCarencia && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      resultadoCarencia.carencia_superada 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      <FiInfo className="mt-0.5 text-lg flex-shrink-0" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold">Resultado de Validación de Carencia</p>
                        <p>{resultadoCarencia.mensaje || (resultadoCarencia.carencia_superada 
                          ? "El período de carencia ha sido superado correctamente." 
                          : "Alerta: El siniestro fue reportado dentro del período de carencia establecido.")}
                        </p>
                        <p className="font-semibold text-[10px]">
                          Días transcurridos: {resultadoCarencia.dias_transcurridos} días de carencia requerida.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checklist Booleans */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Checklist del Sistema</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      {selectedSiniestro.poliza_activa !== false ? (
                        <FiCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                      ) : (
                        <FiXCircle className="text-rose-500 text-lg flex-shrink-0" />
                      )}
                      <span className="text-slate-600 font-medium">Póliza Activa y Vigente</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {selectedSiniestro.pagos_al_dia !== false ? (
                        <FiCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                      ) : (
                        <FiXCircle className="text-rose-500 text-lg flex-shrink-0" />
                      )}
                      <span className="text-slate-600 font-medium">Pagos de Prima al Día</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {selectedSiniestro.documentos_kyc_validados !== false ? (
                        <FiCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                      ) : (
                        <FiXCircle className="text-rose-500 text-lg flex-shrink-0" />
                      )}
                      <span className="text-slate-600 font-medium">Documentos KYC Aprobados</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {selectedSiniestro.identidad_verificada !== false ? (
                        <FiCheckCircle className="text-emerald-500 text-lg flex-shrink-0" />
                      ) : (
                        <FiXCircle className="text-rose-500 text-lg flex-shrink-0" />
                      )}
                      <span className="text-slate-600 font-medium">Identidad Confirmada</span>
                    </div>
                  </div>
                </div>

                {/* Navegación al paso siguiente */}
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("analisis_ia")}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-xs shadow-md cursor-pointer"
                  >
                    Siguiente: Evaluación IA <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "analisis_ia" && (
        <div>
          {!selectedSiniestro ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-xl mx-auto my-8">
              <FiCpu className="mx-auto text-5xl text-slate-300 mb-4 animate-pulse" />
              <h3 className="text-lg font-black text-slate-800 mb-2">Ningún siniestro seleccionado</h3>
              <p className="text-slate-500 text-sm mb-6">
                Por favor, diríjase a la pestaña "Bandeja de Siniestros" y seleccione un caso para proceder con el análisis cognitivo por IA.
              </p>
              <button
                onClick={() => setActiveTab("bandeja")}
                className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                Ir a la Bandeja
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <FiCpu className="text-indigo-600 text-xl" />
                    <h2 className="text-xl font-black text-slate-900">Análisis Cognitivo con IA</h2>
                  </div>
                 
                </div>

                {!evaluacionIAData && !evaluatingIA ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl space-y-4">
                    <FiCpu className="mx-auto text-4xl text-slate-300 animate-pulse" />
                    <div className="max-w-xs mx-auto">
                      <p className="text-slate-700 text-xs font-bold">¿Listo para auditar con IA?</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Inicie la evaluación cognitiva para que la IA de Gemini analice los riesgos y validez del informe médico.
                      </p>
                    </div>
                    <button
                      onClick={handleIniciarIAEvaluacion}
                      className="bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm cursor-pointer"
                    >
                      Iniciar Evaluación Cognitiva con IA
                    </button>
                  </div>
                ) : evaluatingIA ? (
                  <div className="space-y-4 animate-pulse py-4">
                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded"></div>
                      <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-1/3 pt-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-100 rounded"></div>
                      <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                    </div>
                    <div className="flex items-center gap-2 justify-center py-6">
                      <FiLoader className="animate-spin text-indigo-600 text-lg" />
                      <span className="text-xs font-bold text-slate-500">Gemini está analizando la documentación...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-black uppercase text-indigo-800 tracking-wider">Análisis de la IA</h4>
                      <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line">
                        {evaluacionIAData.analisis_ia}
                      </p>
                    </div>

                    <div className="bg-purple-50/40 border border-purple-100 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-black uppercase text-purple-800 tracking-wider">Recomendación Sugerida</h4>
                      <div className="flex items-start gap-2">
                        <FiInfo className="text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-line font-medium">
                          {evaluacionIAData.recomendacion_ia}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab("auditoria")}
                    className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl transition text-xs cursor-pointer"
                  >
                    <FiArrowLeft /> Volver a Auditoría
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("resolucion")}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition text-xs shadow-md cursor-pointer"
                  >
                    Siguiente: Resolución <FiArrowRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "resolucion" && (
        <div>
          {!selectedSiniestro ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-xl mx-auto my-8">
              <FiCheckCircle className="mx-auto text-5xl text-slate-300 mb-4" />
              <h3 className="text-lg font-black text-slate-800 mb-2">Ningún siniestro seleccionado</h3>
              <p className="text-slate-500 text-sm mb-6">
                Por favor, diríjase a la pestaña "Bandeja de Siniestros" y seleccione un caso para registrar su decisión final.
              </p>
              <button
                onClick={() => setActiveTab("bandeja")}
                className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                Ir a la Bandeja
              </button>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FiCheckCircle className="text-emerald-600 text-xl" />
                  <h2 className="text-xl font-black text-slate-900">Resolución Oficial del Agente</h2>
                </div>

                <form onSubmit={handleResolverSiniestro} className="space-y-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Decisión Final
                    </label>
                    <select
                      value={resolucionForm.decision}
                      onChange={(e) => setResolucionForm({ ...resolucionForm, decision: e.target.value })}
                      disabled={resolucionCompletada}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm text-slate-700 bg-white"
                    >
                      <option value="APROBADO">APROBADO</option>
                      <option value="RECHAZADO">RECHAZADO</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Justificación y Observaciones (Mínimo 20 caracteres)
                    </label>
                    <textarea
                      rows={4}
                      value={resolucionForm.justificacion}
                      onChange={(e) => setResolucionForm({ ...resolucionForm, justificacion: e.target.value })}
                      disabled={resolucionCompletada}
                      placeholder="Describa la fundamentación detallada de su decisión..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-700 resize-none"
                    />
                  </div>

                  {!resolucionCompletada ? (
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("analisis_ia")}
                        className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl transition text-xs cursor-pointer"
                      >
                        <FiArrowLeft /> Volver a IA
                      </button>
                      <button
                        type="submit"
                        disabled={resolving}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl transition text-sm shadow-md disabled:opacity-50"
                      >
                        {resolving ? (
                          <>
                            <FiLoader className="animate-spin" /> Guardando decisión...
                          </>
                        ) : (
                          "Confirmar y Resolver Siniestro"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                        Resolución completada con éxito. El siniestro está registrado como {resolucionForm.decision}.
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab("analisis_ia")}
                          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl transition text-xs cursor-pointer"
                        >
                          <FiArrowLeft /> Volver a IA
                        </button>
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          {pdfDictamenUrl ? (
                            <button
                              type="button"
                              onClick={handleDescargarDictamen}
                              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition text-xs shadow cursor-pointer"
                            >
                              <FiFileText /> Descargar Dictamen
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => notify.info("Generando archivo dictamen, intente de nuevo en breve")}
                              className="bg-slate-100 text-slate-500 font-bold py-3 px-4 rounded-xl text-xs"
                            >
                              Dictamen no disponible
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => setActiveTab("liquidacion")}
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition text-xs shadow cursor-pointer"
                          >
                            Ir a Indemnización <FiArrowRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "liquidacion" && (
        <div>
          {!selectedSiniestro ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-xl mx-auto my-8">
              <FiDollarSign className="mx-auto text-5xl text-slate-300 mb-4" />
              <h3 className="text-lg font-black text-slate-800 mb-2">Ningún siniestro seleccionado</h3>
              <p className="text-slate-500 text-sm mb-6">
                Seleccione primero un siniestro en la bandeja y proceda a su resolución para habilitar los formularios de liquidación financiera.
              </p>
              <button
                onClick={() => setActiveTab("bandeja")}
                className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                Ver Bandeja
              </button>
            </div>
          ) : selectedSiniestro.estado !== "APROBADO" && selectedSiniestro.estado !== "PAGADO" && selectedSiniestro.estado !== "PAGADA" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center max-w-xl mx-auto my-8">
              <FiXCircle className="mx-auto text-5xl text-rose-500 mb-4" />
              <h3 className="text-lg font-black text-slate-800 mb-2">Siniestro no Aprobado</h3>
              <p className="text-slate-500 text-sm mb-6">
                El siniestro seleccionado actualmente se encuentra en estado <span className="font-bold text-slate-900">"{selectedSiniestro.estado}"</span>. 
                Los formularios financieros solo se desbloquean para siniestros debidamente APROBADOS en la pestaña de Auditoría Médica.
              </p>
              <button
                onClick={() => setActiveTab("auditoria")}
                className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm"
              >
                Volver a Auditoría
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Información General del Trámite Económico */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Liquidación de Trámite Financiero</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Siniestro: SIN-{selectedSiniestro.id} | Póliza: {selectedSiniestro.poliza_numero || `POL-${selectedSiniestro.poliza}`}</p>
                  </div>
                  {isLiquidada ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider">
                      Transacción Liquidada
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider animate-pulse">
                      Pendiente de Pago
                    </span>
                  )}
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-slate-400 text-xs block uppercase font-bold mb-1">Capital Asegurado de la Póliza</span>
                    <span className="text-slate-800 text-xl font-black">
                      ${Number(selectedSiniestro.poliza_capital_asegurado || selectedSiniestro.poliza?.capital_asegurado || 50000).toLocaleString()} USD
                    </span>
                  </div>
 
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <span className="text-indigo-600 text-xs block uppercase font-bold mb-1">Monto de Liquidación Aprobado</span>
                    <span className="text-indigo-900 text-xl font-black">
                      {montoAprobado 
                        ? `$${Number(montoAprobado).toLocaleString()} USD` 
                        : "No Determinado aún"}
                    </span>
                  </div>
 
                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                    <span className="text-purple-600 text-xs block uppercase font-bold mb-1">Estado del Pago</span>
                    <span className="text-purple-900 text-lg font-black uppercase flex items-center gap-1.5 mt-0.5">
                      {isLiquidada ? (
                        <>
                          <FiCheckCircle className="text-emerald-600" /> PAGADA
                        </>
                      ) : (
                        <>
                          <FiClock className="text-amber-600" /> PENDIENTE
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulario 1: Ingreso de Monto Aprobado para Liquidación */}
              {(!montoAprobado) && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-indigo-600 text-xl" />
                    <h3 className="text-md font-black text-slate-900">Aprobación del Monto Económico de Indemnización</h3>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Defina el capital monetario final aprobado para transferir al beneficiario del seguro de vida basándose en las conclusiones médicas y deducibles.
                  </p>

                  <form onSubmit={handleAprobarMonto} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Monto Aprobado para Liquidación (USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={montoForm.monto_aprobado}
                        onChange={(e) => setMontoForm({ ...montoForm, monto_aprobado: e.target.value })}
                        placeholder="Ej: 45000.00"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={approvingMonto}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-xs shadow-md disabled:opacity-50"
                    >
                      {approvingMonto ? "Guardando Monto..." : "Guardar Monto de Liquidación"}
                    </button>
                  </form>
                </div>
              )}

              {/* Formulario 2: Registro de Comprobante y Cierre del Pago */}
              {montoAprobado && !isLiquidada && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-600 text-xl" />
                    <h3 className="text-md font-black text-slate-900">Registrar Comprobante de Transferencia Bancaria</h3>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Al subir la referencia de pago de la transferencia completada en la cuenta bancaria del cliente, se cerrará el trámite económico de forma definitiva.
                  </p>

                  <form onSubmit={handlePagarIndemnizacion} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        URL del Comprobante de Pago
                      </label>
                      <input
                        type="url"
                        value={pagoForm.comprobante_url}
                        onChange={(e) => setPagoForm({ ...pagoForm, comprobante_url: e.target.value })}
                        placeholder="https://cloudinary.com/comprobante-de-pago-ejemplo.pdf"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium text-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={paying}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition text-xs shadow-md disabled:opacity-50"
                    >
                      {paying ? "Procesando Transacción..." : "Registrar Pago y Cerrar Siniestro"}
                    </button>
                  </form>
                </div>
              )}

              {/* Diseño de Éxito Masivo: Trámite Liquidada y Cerrado */}
              {isLiquidada && (
                <div className="bg-emerald-500 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl shadow-emerald-100">
                  <FiCheckCircle className="mx-auto text-6xl animate-bounce" />
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black">¡Siniestro Liquidado Exitosamente!</h3>
                    <p className="text-emerald-100 text-xs max-w-md mx-auto leading-relaxed">
                      El monto acordado de <span className="font-bold">${Number(montoAprobado).toLocaleString()} USD</span> ha sido transferido. 
                      El trámite financiero y el siniestro se marcan como completamente cerrados y pagados en el sistema SegurIA.
                    </p>
                  </div>
                  {comprobanteUrl && (
                    <div className="pt-2">
                      <a
                        href={comprobanteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-white text-emerald-700 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-emerald-50 transition shadow"
                      >
                        Ver Comprobante de Transferencia <FiExternalLink />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
