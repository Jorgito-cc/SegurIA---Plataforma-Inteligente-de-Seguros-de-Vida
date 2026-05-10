import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../components/notifications/notify";
import { tenantRepository } from "../../../infrastructure/repositories/tenantRepository";

export default function StripeCheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const registrationData = JSON.parse(
          sessionStorage.getItem("tenant_registration"),
        );
        const selectedPlan = sessionStorage.getItem("selected_plan");

        if (!registrationData || !selectedPlan) {
          notify.error("Datos incompletos. Por favor, vuelve a intentar.");
          navigate("/registro-agencia");
          return;
        }

        // Consumir endpoint real de Stripe
        const response = await tenantRepository.crearCheckoutSession({
          nombre_agencia: registrationData.nombre_agencia,
          email_admin: registrationData.email_admin,
          plan: selectedPlan,
        });

        if (response.checkout_url) {
          // Guardar session ID para verificación posterior
          sessionStorage.setItem("stripe_checkout_url", response.checkout_url);
          setSessionData({ checkout_url: response.checkout_url });
          notify.success("Sesión de pago creada. Redirigiendo a Stripe...");

          // Redirigir directamente a Stripe después de 2 segundos
          setTimeout(() => {
            window.location.href = response.checkout_url;
          }, 2000);
        } else {
          throw new Error("No se recibió URL de checkout");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.error ||
          err.message ||
          "Error al crear sesión de pago";
        notify.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    createCheckoutSession();
  }, [navigate]);

  if (loading || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">
            Preparando sesión de pago...
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Serás redirigido a Stripe en unos momentos
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/planes-saas")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Volver a Seleccionar Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Procesando Pago
        </h1>

        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-700 text-sm font-semibold">
            ✓ Sesión de pago lista
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Serás redirigido a Stripe en unos momentos para completar tu pago de
            forma segura.
          </p>
        </div>

        <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold capitalize">
              {sessionStorage.getItem("selected_plan")}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t">
            <span className="font-semibold">Pago:</span>
            <span className="font-bold text-lg">
              $
              {{
                basico: "150",
                pro: "300",
                premium: "600",
              }[sessionStorage.getItem("selected_plan")] || "0"}
              /mes
            </span>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs">
          💳 Transacción segura con Stripe
        </p>
      </div>
    </div>
  );
}
