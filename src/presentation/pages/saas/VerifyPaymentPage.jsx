import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notify } from "../../components/notifications/notify";
import { tenantRepository } from "../../../infrastructure/repositories/tenantRepository";

export default function VerifyPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking"); // checking, success, error
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          setStatus("error");
          setMessage("Session ID no encontrado");
          notify.error("Session ID no encontrado");
          return;
        }

        // Consumir endpoint real de verificación
        const response = await tenantRepository.verificarPago(sessionId);

        if (response.suscripcion_activa) {
          setStatus("success");
          setMessage(
            response.mensaje || "¡Pago verificado! Tu agencia ha sido creada.",
          );
          notify.success(response.mensaje || "¡Pago verificado!");

          // Limpiar sessionStorage
          sessionStorage.removeItem("tenant_registration");
          sessionStorage.removeItem("selected_plan");
          sessionStorage.removeItem("stripe_session_id");
          sessionStorage.removeItem("stripe_checkout_url");

          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          throw new Error(response.error || "El pago no fue verificado");
        }
      } catch (error) {
        setStatus("error");
        const errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Error al verificar el pago";
        setMessage(errorMessage);
        notify.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Verificando pago...</p>
          <p className="text-gray-500 text-sm mt-2">
            Por favor espera mientras procesamos tu información.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            ¡Pago Verificado!
          </h1>
          <p className="text-gray-600 mb-2">
            Tu agencia ha sido creada exitosamente.
          </p>
          <p className="text-gray-500 text-sm mb-6">{message}</p>

          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 text-sm font-semibold">
              Ya puedes iniciar sesión con tus credenciales
            </p>
          </div>

          <p className="text-gray-500 text-xs">
            Serás redirigido al login en unos momentos...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Error en Verificación
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>

          <button
            onClick={() => navigate("/planes-saas")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Volver a Intentar
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <p className="text-gray-600">Estado desconocido</p>
      </div>
    </div>
  );
}
