import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { notify } from "../../components/notifications/notify";

export default function VerifyPaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking"); // checking, success, error
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          setStatus("error");
          notify("error", "Session ID no encontrado");
          return;
        }

        // TODO: Reemplazar con llamada a API real
        // GET /api/tenants/verificar-pago/?session_id=cs_test_...
        // Response: {
        //   "status": "paid" | "pending" | "failed",
        //   "tenant": {
        //     "id": "...",
        //     "slug": "...",
        //     "nombre": "..."
        //   },
        //   "usuario": {
        //     "id": "...",
        //     "email": "...",
        //     "tenant_slug": "..."
        //   }
        // }

        // Simulamos verificación
        setTimeout(async () => {
          try {
            const registrationData = JSON.parse(
              sessionStorage.getItem("tenant_registration"),
            );

            // Simular pago exitoso
            const mockResponse = {
              status: "paid",
              tenant: {
                id: "tenant-uuid-123",
                slug: registrationData.nombre_agencia
                  .toLowerCase()
                  .replace(/\s+/g, "-"),
                nombre: registrationData.nombre_agencia,
              },
              usuario: {
                id: "user-uuid-456",
                email: registrationData.email_admin,
                tenant_slug: registrationData.nombre_agencia
                  .toLowerCase()
                  .replace(/\s+/g, "-"),
              },
            };

            // Aquí el tenant ya está creado en la BD
            setStatus("success");
            notify("success", "¡Pago verificado! Tu agencia ha sido creada.");

            // Limpiar sessionStorage
            sessionStorage.removeItem("tenant_registration");
            sessionStorage.removeItem("selected_plan");
            sessionStorage.removeItem("stripe_session_id");

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          } catch (error) {
            setStatus("error");
            notify("error", error.message);
          }
        }, 2000);
      } catch (error) {
        setStatus("error");
        notify("error", error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === "checking" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verificando Pago
            </h1>
            <p className="text-gray-600">
              Por favor espera mientras verificamos tu transacción...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">¡Éxito!</h1>
            <p className="text-gray-600 mb-6">
              Tu agencia ha sido creada exitosamente. Serás redirigido al
              login...
            </p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-700">
                Ahora puedes iniciar sesión con tu email de administrador
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">✕</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">
              No pudimos procesar tu pago. Por favor, intenta nuevamente.
            </p>
            <button
              onClick={() => navigate("/registro-agencia")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Volver a Intentar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
