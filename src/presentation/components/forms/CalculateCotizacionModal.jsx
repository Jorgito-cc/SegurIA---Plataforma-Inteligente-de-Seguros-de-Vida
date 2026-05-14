import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { notify } from "../notifications/notify";
import { FiX, FiActivity, FiUser, FiMap, FiCheck } from "react-icons/fi";
import { useAuth } from "../../../application/context/AuthContext";

export default function CalculateCotizacionModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [clausulas, setClausulas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [resultado, setResultado] = useState(null);
  
  const { user } = useAuth();
  const isCliente = user?.rol?.toUpperCase() === 'CLIENTE';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      capital_asegurado: 50000,
      plazo_anios: 10,
      frecuencia_pago: "MENSUAL",
      clausulas_adicionales: [],
    },
  });

  const selectedPlanId = watch("plan");
  const selectedPlan = planes.find((p) => p.id === parseInt(selectedPlanId));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cliRes, planRes, clauRes] = await Promise.all([
          apiClient.get(ENDPOINTS.clientes),
          apiClient.get(ENDPOINTS.planes),
          apiClient.get(ENDPOINTS.clausulas),
        ]);
        setClientes(cliRes.data.results || cliRes.data);
        setPlanes(planRes.data.results || planRes.data);
        setClausulas(clauRes.data.results || clauRes.data);
      } catch (error) {
        notify.error("Error al cargar datos necesarios");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      setCalculating(true);
      const payload = {
        ...data,
        plan: parseInt(data.plan),
        capital_asegurado: parseFloat(data.capital_asegurado),
        plazo_anios: parseInt(data.plazo_anios),
        peso_kg: parseFloat(data.peso_kg),
        altura_cm: parseInt(data.altura_cm),
        clausulas_adicionales: data.clausulas_adicionales.map((id) =>
          parseInt(id),
        ),
      };

      if (!isCliente) {
        payload.cliente_id = parseInt(data.cliente);
      }

      const response = await apiClient.post(
        `${ENDPOINTS.cotizaciones}calcular/`,
        payload,
      );
      setResultado(response.data);
      setStep(3);
      notify.success("Cotización calculada");
    } catch (error) {
      const msg = error.response?.data?.error || "Error al calcular";
      notify.error(msg);
    } finally {
      setCalculating(false);
    }
  };

  const handleAceptarCotizacion = async () => {
    try {
      setCalculating(true);
      const resAceptar = await apiClient.post(
        `${ENDPOINTS.cotizaciones}${resultado.cotizacion_id}/aceptar/`
      );
      
      if (resAceptar.data.requiere_examen_medico) {
        await apiClient.post(`${ENDPOINTS.ordenesMedicas}generar/`, {
          cotizacion_id: resultado.cotizacion_id
        });
        notify.success('Cotización aceptada y Orden Médica generada automáticamente.');
      } else {
        notify.success('Cotización aceptada exitosamente.');
      }
      onClose();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al aceptar cotización';
      notify.error(msg);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Calculadora de Seguros
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span
                className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-slate-200"}`}
              />
              <span
                className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`}
              />
              <span
                className={`h-2 w-16 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-slate-200"}`}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <FiX size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className={`grid grid-cols-1 ${!isCliente ? 'md:grid-cols-2' : ''} gap-6`}>
                {!isCliente && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <FiUser /> Seleccionar Cliente
                    </label>
                    <select
                      {...register("cliente", { required: !isCliente })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Seleccione un cliente...</option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.first_name} {c.last_name} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <FiMap /> Seleccionar Plan
                  </label>
                  <select
                    {...register("plan", { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Seleccione un plan...</option>
                    {planes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedPlan && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <h4 className="font-bold text-blue-900">
                    {selectedPlan.nombre}
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedPlan.descripcion}
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                      <span className="block text-xs text-slate-500 uppercase font-bold">
                        Capital Mín
                      </span>
                      <span className="font-black text-blue-600">
                        ${Number(selectedPlan.capital_minimo).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                      <span className="block text-xs text-slate-500 uppercase font-bold">
                        Capital Máx
                      </span>
                      <span className="font-black text-blue-600">
                        ${Number(selectedPlan.capital_maximo).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                      <span className="block text-xs text-slate-500 uppercase font-bold">
                        Edad Máx
                      </span>
                      <span className="font-black text-blue-600">
                        {selectedPlan.edad_maxima} años
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Capital Deseado ($)
                  </label>
                  <input
                    type="number"
                    {...register("capital_asegurado", { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Plazo (Años)
                  </label>
                  <input
                    type="number"
                    {...register("plazo_anios", { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Frecuencia de Pago
                  </label>
                  <select
                    {...register("frecuencia_pago", { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  >
                    <option value="MENSUAL">Mensual</option>
                    <option value="TRIMESTRAL">Trimestral</option>
                    <option value="SEMESTRAL">Semestral</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Siguiente: Evaluación de Salud
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FiActivity className="text-emerald-500" /> Evaluación de Riesgo
                (Cuestionario)
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("peso_kg", { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    {...register("altura_cm", { required: true })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("tiene_diabetes")}
                    className="w-5 h-5 rounded accent-blue-600"
                  />
                  <span className="font-medium text-slate-700">Diabetes</span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("tiene_hipertension")}
                    className="w-5 h-5 rounded accent-blue-600"
                  />
                  <span className="font-medium text-slate-700">
                    Hipertensión
                  </span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("tiene_enfermedad_cardiaca")}
                    className="w-5 h-5 rounded accent-blue-600"
                  />
                  <span className="font-medium text-slate-700">
                    Enfermedad Cardíaca
                  </span>
                </label>
                <label className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("consume_alcohol_frecuente")}
                    className="w-5 h-5 rounded accent-blue-600"
                  />
                  <span className="font-medium text-slate-700">
                    Consume Alcohol
                  </span>
                </label>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Cláusulas Adicionales
                </label>
                <div className="flex flex-wrap gap-2">
                  {clausulas.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full cursor-pointer hover:border-blue-400"
                    >
                      <input
                        type="checkbox"
                        value={c.id}
                        {...register("clausulas_adicionales")}
                        className="accent-blue-600"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        {c.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 font-bold hover:text-slate-800"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={calculating}
                  className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  {calculating ? "Analizando con IA..." : "Calcular Prima"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && resultado && (
            <div className="text-center space-y-6 animate-in zoom-in-95">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl ${resultado.nivel_riesgo === "RECHAZADO" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}
              >
                {resultado.nivel_riesgo === "RECHAZADO" ? <FiX /> : <FiCheck />}
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800">
                  {resultado.nivel_riesgo === "RECHAZADO"
                    ? "Cotización Rechazada"
                    : "¡Cotización Calculada!"}
                </h3>
                <p className="text-slate-500 mt-2">
                  Nuestra IA ha evaluado el perfil de riesgo del cliente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Evaluación de Riesgo
                  </span>
                  <div
                    className={`text-4xl font-black ${resultado.nivel_riesgo === "RECHAZADO" ? "text-red-600" : "text-slate-800"}`}
                  >
                    {typeof resultado.nivel_riesgo === "object"
                      ? resultado.nivel_riesgo.nombre // o la propiedad que sea texto
                      : resultado.evaluacion_riesgo?.nivel_riesgo ||
                        resultado.nivel_riesgo}
                  </div>
                  <div className="text-sm font-bold text-slate-500 mt-1">
                    Score:{" "}
                    {resultado.evaluacion_riesgo?.score_riesgo ||
                      resultado.score_riesgo}
                    /100
                  </div>
                  <div className="text-xs text-slate-600 mt-4 text-left border-t border-slate-200 pt-3">
                    <span className="font-bold block mb-2">Desglose de Puntos:</span>
                    <ul className="space-y-1">
                      {Object.values(resultado.evaluacion_riesgo?.detalle || resultado.detalle_riesgo || {}).map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>• {item.descripcion}</span>
                          <span className="font-bold text-slate-400">+{item.puntos} pts</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {resultado.prima && (
                  <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                    <span className="block text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">
                      Prima Resultante
                    </span>
                    <div className="text-5xl font-black text-emerald-700">
                      ${Number(resultado.prima.ajustada_anual).toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-emerald-600 mt-1">
                      Anual Ajustada
                    </div>
                    <div className="mt-6 flex justify-between items-center text-emerald-800 font-bold border-t border-emerald-200 pt-4">
                      <span>Pago {resultado.frecuencia_pago}</span>
                      <span className="text-xl">
                        $
                        {Number(
                          resultado.prima.por_mensual ||
                            resultado.prima.por_anual ||
                            0,
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
                {resultado.nivel_riesgo === "RECHAZADO" && (
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                    <span className="block text-xs font-black text-red-400 uppercase tracking-widest mb-4">
                      Motivo de Rechazo
                    </span>
                    <div className="text-2xl font-black text-red-700">
                      Riesgo No Asegurable
                    </div>
                    <p className="text-sm text-red-600 mt-2">
                      {resultado.mensaje}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-8">
                {resultado.nivel_riesgo !== "RECHAZADO" && (
                  <button
                    type="button"
                    disabled={calculating}
                    onClick={handleAceptarCotizacion}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition"
                  >
                    {calculating ? "Procesando..." : "Aceptar Cotización Ahora"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition"
                >
                  Guardar como Pendiente
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-500 font-bold hover:text-slate-800"
                >
                  Realizar otra cotización
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}