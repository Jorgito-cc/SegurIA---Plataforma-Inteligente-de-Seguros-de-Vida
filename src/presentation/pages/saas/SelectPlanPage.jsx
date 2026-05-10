import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../components/notifications/notify";

export default function SelectPlanPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Reemplazar con llamada a API real
    // GET /api/tenants/planes/
    setPlans([
      {
        id: "basico",
        nombre: "Básico",
        precio_mensual: 150,
        limite_usuarios: 3,
        limite_clientes: 100,
        caracteristicas: [
          "Hasta 3 usuarios",
          "Gestión de 100 clientes",
          "Soporte estándar",
        ],
      },
      {
        id: "pro",
        nombre: "Pro",
        precio_mensual: 300,
        limite_usuarios: 10,
        limite_clientes: 1000,
        caracteristicas: [
          "Hasta 10 usuarios",
          "Gestión de 1000 clientes",
          "Soporte prioritario 24/7",
        ],
      },
      {
        id: "premium",
        nombre: "Premium",
        precio_mensual: 600,
        limite_usuarios: -1,
        limite_clientes: -1,
        caracteristicas: [
          "Usuarios ilimitados",
          "Clientes ilimitados",
          "Soporte prioritario 24/7",
          "Integraciones personalizadas",
        ],
      },
    ]);
  }, []);

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan) {
      notify.error("Selecciona un plan para continuar");
      return;
    }

    try {
      setLoading(true);

      // Guardar plan seleccionado en sessionStorage
      sessionStorage.setItem("selected_plan", selectedPlan);

      notify.success("Plan seleccionado. Procediendo al pago...");
      navigate("/stripe-checkout");
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Elige tu Plan</h1>
          <p className="text-blue-100 text-lg">
            Selecciona el plan perfecto para tu agencia
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition hover:scale-105 ${
                selectedPlan === plan.id
                  ? "ring-4 ring-yellow-400 bg-white"
                  : "bg-white"
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold">{plan.nombre}</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.precio_mensual}
                  </span>
                  <span className="text-blue-100">/mes</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Limits */}
                <div className="mb-6 pb-6 border-b">
                  <p className="text-gray-600 text-sm">
                    <strong>Usuarios:</strong>{" "}
                    {plan.limite_usuarios === -1
                      ? "Ilimitados"
                      : `Hasta ${plan.limite_usuarios}`}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Clientes:</strong>{" "}
                    {plan.limite_clientes === -1
                      ? "Ilimitados"
                      : `Hasta ${plan.limite_clientes}`}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.caracteristicas.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Select Indicator */}
                {selectedPlan === plan.id && (
                  <div className="text-center py-2 bg-green-100 rounded text-green-700 font-semibold">
                    Seleccionado
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/registro-agencia")}
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Atrás
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedPlan || loading}
            className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Procesando..." : "Continuar al Pago"}
          </button>
        </div>

        {/* Info */}
        <div className="text-center mt-12 text-blue-100 text-sm">
          <p>
            Todos los planes incluyen período de prueba de 14 días sin tarjeta
            de crédito
          </p>
        </div>
      </div>
    </div>
  );
}
