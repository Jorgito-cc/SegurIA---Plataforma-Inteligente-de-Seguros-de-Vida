import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notify } from "../../components/notifications/notify";

export default function RegisterTenantPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_agencia: "",
    email_admin: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre_agencia.trim()) {
      notify.error("El nombre de la agencia es requerido");
      return;
    }
    if (!formData.email_admin.includes("@")) {
      notify.error("Email inválido");
      return;
    }
    if (formData.password.length < 8) {
      notify.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      notify.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      // Guardar datos en sessionStorage para siguiente paso
      sessionStorage.setItem(
        "tenant_registration",
        JSON.stringify({
          nombre_agencia: formData.nombre_agencia,
          email_admin: formData.email_admin,
          password: formData.password,
        }),
      );

      notify.success("Información guardada. Selecciona tu plan...");
      navigate("/planes-saas");
    } catch (error) {
      notify.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registrar Agencia
        </h1>
        <p className="text-gray-600 mb-6">Comienza con SegurIA hoy</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre Agencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Agencia
            </label>
            <input
              type="text"
              name="nombre_agencia"
              value={formData.nombre_agencia}
              onChange={handleChange}
              placeholder="Ej: Seguros del Norte"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email Admin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email del Administrador
            </label>
            <input
              type="email"
              name="email_admin"
              value={formData.email_admin}
              onChange={handleChange}
              placeholder="admin@tuagencia.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirma tu contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:bg-gray-400"
          >
            {loading ? "Procesando..." : "Continuar a Planes"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
