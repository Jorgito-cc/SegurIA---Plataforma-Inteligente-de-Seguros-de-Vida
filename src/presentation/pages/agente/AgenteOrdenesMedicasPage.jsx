import { useState, useEffect } from "react";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { CrudTable } from "../../components/common/CrudTable";
import { notify } from "../../components/notifications/notify";
import {
  FiActivity,
  FiSearch,
  FiUpload,
  FiClipboard,
  FiEye,
} from "react-icons/fi";
import { useAuth } from "../../../application/context/AuthContext";
import { useForm } from "react-hook-form";

export default function AgenteOrdenesMedicasPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false); // NUEVO: Para el fetch individual
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDictamenModal, setShowDictamenModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [activeOrdenDetail, setActiveOrdenDetail] = useState(null); // NUEVO: Guarda el detalle profundo de la orden

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.ordenesMedicas);
      setOrdenes(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching ordenes:", error);
      notify.error("Error al cargar órdenes médicas");
    } finally {
      setLoading(false);
    }
  };

  // NUEVO: Función intermedia para traer los resultados y dictámenes reales antes de abrir un modal
  const fetchOrdenDetalle = async (id) => {
    try {
      setModalLoading(true);
      const response = await apiClient.get(`${ENDPOINTS.ordenesMedicas}${id}/`);
      setActiveOrdenDetail(response.data);
      return response.data;
    } catch (error) {
      notify.error("Error al cargar el detalle profundo de la orden");
      return null;
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const handleCargarResultado = async (data) => {
    try {
      const formData = new FormData();
      formData.append("tipo_examen", data.tipo_examen);
      formData.append("resultado", data.resultado);
      formData.append("es_normal", data.es_normal);
      if (data.archivo && data.archivo[0]) {
        formData.append("archivo", data.archivo[0]);
      }

      await apiClient.post(
        `${ENDPOINTS.ordenesMedicas}${selectedOrden.id}/resultados/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      notify.success("Resultado médico cargado exitosamente");
      setShowUploadModal(false);
      fetchOrdenes();
    } catch (error) {
      notify.error(error.response?.data?.error || "Error al cargar resultado");
    }
  };

  const handleEmitirDictamen = async (data) => {
    try {
      if (data.accion_final === "CANCELAR") {
        await apiClient.post(
          `${ENDPOINTS.ordenesMedicas}${selectedOrden.id}/cancelar/`,
          {
            observaciones: data.observaciones,
          },
        );
        notify.success("Orden médica cancelada exitosamente");
      } else {
        // CONSTRUCCIÓN DEL PAYLOAD CORRECTO PARA DJANGO
        const payload = {
          conclusion: data.conclusion,
          // Si es APTO_RESERVA convierte el porcentaje a número, si no, manda 0 de forma limpia
          impacto_prima_pct:
            data.conclusion === "APTO_RESERVA"
              ? parseFloat(data.impacto_prima_pct)
              : 0,
          observaciones: data.observaciones,
        };

        // Enviamos el payload estructurado al endpoint
        await apiClient.post(
          `${ENDPOINTS.ordenesMedicas}${selectedOrden.id}/dictamen/`,
          payload,
        );
        notify.success("Dictamen emitido y orden COMPLETADA");
      }
      setShowDictamenModal(false);
      fetchOrdenes();
    } catch (error) {
      console.error(error.response?.data);
      notify.error(
        error.response?.data?.error || "Error al procesar el dictamen",
      );
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (val) => (
        <span className="font-mono text-xs font-bold text-slate-600">
          OM-{val.toString().padStart(5, "0")}
        </span>
      ),
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">
            {item.cliente_nombre || "N/A"}
          </span>
          {item.cliente_email && (
            <span className="text-[10px] text-slate-400">
              {item.cliente_email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "cotizacion",
      label: "Cotización",
      render: (val) => (val ? `COT-${val}` : "N/A"),
    },
    {
      key: "estado",
      label: "Estado",
      render: (val) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
            val === "COMPLETADA"
              ? "bg-emerald-100 text-emerald-700"
              : val === "EN_PROCESO"
                ? "bg-blue-100 text-blue-700"
                : val === "PENDIENTE"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      key: "total_resultados",
      label: "Progreso Exámenes",
      render: (val, item) => (
        <span className="text-xs font-bold text-slate-500">
          {val || 0} / {item.total_examenes || 0} subidos
        </span>
      ),
    },
  ];

  const filteredOrdenes = ordenes.filter(
    (o) =>
      o.id.toString().includes(searchTerm) ||
      (o.cliente_nombre &&
        o.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.cliente_email &&
        o.cliente_email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FiActivity className="text-blue-600" /> Órdenes Médicas
          </h1>
          <p className="text-slate-500 font-medium">
            Evaluaciones de salud para la suscripción de pólizas de SegurIA.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID de orden o datos del cliente..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filteredOrdenes}
          loading={loading || modalLoading}
          customActions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setSelectedOrden(item);
                  const detalle = await fetchOrdenDetalle(item.id);
                  if (detalle) setShowViewModal(true);
                }}
                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                title="Visualizar Historial y Resultados"
              >
                <FiEye size={18} />
              </button>

              {item.estado !== "COMPLETADA" && item.estado !== "CANCELADA" && (
                <button
                  onClick={async () => {
                    setSelectedOrden(item);
                    const detalle = await fetchOrdenDetalle(item.id);
                    if (detalle) setShowUploadModal(true);
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                  title="Cargar Resultados Médicos"
                >
                  <FiUpload size={18} />
                </button>
              )}

              {item.estado !== "COMPLETADA" &&
                item.estado !== "CANCELADA" && (
                  <button
                    onClick={async () => {
                      setSelectedOrden(item);
                      const detalle = await fetchOrdenDetalle(item.id);
                      if (detalle) setShowDictamenModal(true);
                    }}
                    className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition"
                    title="Emitir Dictamen Final"
                  >
                    <FiClipboard size={18} />
                  </button>
                )}
            </div>
          )}
        />
      </div>

      {showViewModal && activeOrdenDetail && (
        <ViewResultadosModal
          orden={activeOrdenDetail}
          onClose={() => {
            setShowViewModal(false);
            setActiveOrdenDetail(null);
          }}
        />
      )}

      {showUploadModal && activeOrdenDetail && (
        <UploadResultModal
          orden={activeOrdenDetail}
          onClose={() => {
            setShowUploadModal(false);
            setActiveOrdenDetail(null);
          }}
          onSubmit={handleCargarResultado}
        />
      )}

      {showDictamenModal && activeOrdenDetail && (
        <DictamenModal
          orden={activeOrdenDetail}
          onClose={() => {
            setShowDictamenModal(false);
            setActiveOrdenDetail(null);
          }}
          onSubmit={handleEmitirDictamen}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Modals Ajustados para usar los datos hidratados
// ----------------------------------------------------

function ViewResultadosModal({ orden, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
          <h2 className="text-xl font-black text-slate-800">
            Resultados Subidos — OM-{orden.id}
          </h2>
          <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase">
            {orden.estado_display || orden.estado}
          </span>
        </div>

        <div className="overflow-y-auto space-y-4 flex-1 pr-1">
          {orden.resultados && orden.resultados.length > 0 ? (
            orden.resultados.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {res.tipo_examen}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Cargado por: {res.cargado_por_nombre || "Usuario"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${res.es_normal ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {res.es_normal ? "Normal" : "Anormal"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {res.resultado}
                </p>
                {res.archivo && (
                  <div className="pt-1">
                    <a
                      href={res.archivo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline"
                    >
                      <FiEye size={14} /> Ver documento adjunto (PDF/Imagen)
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 font-medium text-sm">
              No se han cargado resultados médicos para esta orden todavía.
            </div>
          )}

          {orden.dictamen && (
            <div className="mt-4 p-4 rounded-2xl border-2 border-purple-100 bg-purple-50/30">
              <h3 className="font-black text-purple-800 text-xs tracking-wider uppercase mb-2">
                Dictamen Médico Oficial
              </h3>
              <p className="text-xs font-bold text-slate-700">
                Conclusión:{" "}
                <span className="text-purple-700">
                  {orden.dictamen.conclusion_display}
                </span>
              </p>
              {parseFloat(orden.dictamen.impacto_prima_pct) > 0 && (
                <p className="text-xs font-bold text-amber-700">
                  Recargo Aplicado: {orden.dictamen.impacto_prima_pct}%
                </p>
              )}
              <p className="text-xs text-slate-600 mt-1 italic">
                "
                {orden.dictamen.observaciones ||
                  "Sin observaciones adicionales"}
                "
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadResultModal({ orden, onClose, onSubmit }) {
  const { register, handleSubmit } = useForm({
    defaultValues: { es_normal: true },
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6">
        <h2 className="text-xl font-black mb-4">
          Cargar Resultado (OM-{orden.id})
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Tipo de Examen
            </label>
            <select
              {...register("tipo_examen", { required: true })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccione examen --</option>
              {orden.examenes_requeridos?.map((ex, i) => (
                <option key={i} value={ex}>
                  {ex}
                </option>
              ))}
              <option value="Otro">Otro / Adicional</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Descripción / Resultado
            </label>
            <textarea
              {...register("resultado", { required: true })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Valores obtenidos..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Archivo Adjunto
            </label>
            <input
              type="file"
              {...register("archivo", { required: true })}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("es_normal")}
              className="w-4 h-4 accent-blue-600"
            />
            <label className="text-sm font-bold text-slate-700">
              El resultado está en los parámetros normales
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
            >
              Guardar Resultado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function DictamenModal({ orden, onClose, onSubmit }) {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      accion_final: "COMPLETAR",
      conclusion: "APTO",
      impacto_prima_pct: 0,
    },
  });
  const accionFinal = watch("accion_final");
  const conclusion = watch("conclusion");

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6">
        <h2 className="text-xl font-black mb-4 text-purple-700 flex items-center gap-2">
          <FiClipboard /> Resolver Orden Médica (OM-{orden.id})
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Acción Final de la Orden
            </label>
            <select
              {...register("accion_final", { required: true })}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500 font-bold"
            >
              <option value="COMPLETAR">
                ✓ Emitir Dictamen y COMPLETAR la Orden
              </option>
              <option value="CANCELAR">
                🛑 CANCELAR Orden Médica (Sin dictamen)
              </option>
            </select>
          </div>

          {/* ESTO SE RENDERIZA SI SE SELECCIONA COMPLETAR */}
          {accionFinal === "COMPLETAR" ? (
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                  Conclusión Médica
                </label>
                <select
                  {...register("conclusion", { required: true })}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="APTO">Apto</option>
                  <option value="APTO_RESERVA">
                    Apto con reserva (Recargo de Prima)
                  </option>
                  <option value="NO_APTO">No Apto (Rechazar Riesgo)</option>
                </select>
              </div>

              {conclusion === "APTO_RESERVA" && (
                <div>
                  <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
                    Recargo a la Prima (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("impacto_prima_pct", {
                      required: true,
                      min: 0.1,
                    })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej. 15.00"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700 font-medium">
              La orden pasará a estado **CANCELADA** inmediatamente sin aplicar
              cambios sobre la cotización.
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Observaciones / Justificación
            </label>
            <textarea
              {...register("observaciones", { required: true })}
              rows={3}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Escriba las notas o la justificación obligatoria..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white font-bold rounded-xl bg-purple-600 hover:bg-purple-700"
            >
              {accionFinal === "CANCELAR"
                ? "Confirmar Cancelación"
                : "Emitir Dictamen Final"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
