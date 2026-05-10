import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../components/notifications/notify";

export default function StripeCheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        setLoading(true);

        const registrationData = JSON.parse(
          sessionStorage.getItem("tenant_registration"),
        );
        const selectedPlan = sessionStorage.getItem("selected_plan");

        if (!registrationData || !selectedPlan) {
          notify("error", "Datos incompletos. Por favor, vuelve a intentar.");
          navigate("/registro-agencia");
          return;
        }

        // TODO: Reemplazar con llamada a API real
        // POST /api/tenants/crear-checkout-session/
        // {
        //   "nombre_agencia": "...",
        //   "email_admin": "...",
        //   "plan": "basico|pro|premium"
        // }

        // Por ahora simulamos
        const mockResponse = {
          session_id:
            "cs_test_a1ENZwTmM6jjC78F5OnpVdukk9vxYBNaI1ornu1aqxYwkpsWSLRDyFw1cf",
          stripe_public_key:
            "pk_test_51SQ8DcRwpyhYjFgrE2NpRvHhdPc9IAw3hJHfkPLgrtNYgp97EduEwLE0c8s8svC3SdtLvUSAzmOy1LC0IJhNgoYk00na5bJjBw",
        };

        sessionStorage.setItem("stripe_session_id", mockResponse.session_id);
        setSessionData(mockResponse);

        notify("success", "Sesión de pago creada");

        // En un caso real, aquí usarías Stripe.js para redirigir
        // window.location.href = `/verificar-pago?session_id=${mockResponse.session_id}`;

        // Para demostración, simulamos verificación automática después de 3s
        setTimeout(() => {
          navigate(`/verificar-pago?session_id=${mockResponse.session_id}`);
        }, 2000);
      } catch (error) {
        notify("error", error.message);
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
          <p className="text-gray-700">Preparando sesión de pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Completar Pago
        </h1>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-700 text-sm">
            Serás redirigido a Stripe para completar el pago de forma segura.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold capitalize">
              {sessionStorage.getItem("selected_plan")}
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t">
            <span className="font-semibold">Total:</span>
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

        <button
          onClick={() => {
            // En producción, redirigir a Stripe Checkout
            notify("info", "En demostración. Verificando pago...");
            navigate(
              `/verificar-pago?session_id=${sessionStorage.getItem(
                "stripe_session_id",
              )}`,
            );
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Proceder con el Pago
        </button>

        <p className="text-center text-gray-500 text-xs mt-4">
          Transacción segura con Stripe
        </p>
      </div>
    </div>
  );
}
