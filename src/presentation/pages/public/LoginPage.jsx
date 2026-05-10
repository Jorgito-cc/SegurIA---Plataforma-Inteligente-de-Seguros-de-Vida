import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../application/context/AuthContext";
import { notify } from "../../components/notifications/notify";
import { getDashboardRouteByRole } from "../../routes/roleUtils";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await login({
        email: form.email.trim(),
        password: form.password,
      });
      notify.success("Inicio de sesion correcto");
      navigate(getDashboardRouteByRole(data?.usuario?.rol));
    } catch (error) {
      notify.error(error.message || "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-16">
      <div className="max-w-xl">
        <p className="mb-3 inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700 shadow-sm">
          Acceso seguro
        </p>
        <h1 className="text-4xl font-black tracking-tight text-blue-900 sm:text-5xl">
          Iniciar sesión
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
          Ingresa con tu correo y contraseña para acceder al panel según tu rol:
          administrador, agente o cliente.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-extrabold text-slate-900">Admin</p>
            <p className="mt-1 text-xs text-slate-600">Gestión total</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-extrabold text-slate-900">Agente</p>
            <p className="mt-1 text-xs text-slate-600">
              Seguimiento de cartera
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-extrabold text-slate-900">Cliente</p>
            <p className="mt-1 text-xs text-slate-600">
              Tus seguros y solicitudes
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] sm:p-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-0 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 rounded-lg px-4 py-2.5 font-semibold text-sm transition ${
              tab === "login"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📋 Iniciar Sesión
          </button>
          <button
            onClick={() => setTab("saas")}
            className={`flex-1 rounded-lg px-4 py-2.5 font-semibold text-sm transition ${
              tab === "saas"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✨ Nueva Agencia
          </button>
        </div>

        {/* Tab: Login */}
        {tab === "login" && (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correo
              </label>
              <input
                name="email"
                type="email"
                placeholder="admin@seguria.com"
                className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white"
                onChange={onChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white"
                onChange={onChange}
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-blue-700 py-3.5 font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Ingresando..." : "Entrar"}
            </button>

            <div className="flex flex-col gap-3 pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <Link
                to="/registro"
                className="font-semibold text-emerald-600 transition hover:text-emerald-700"
              >
                ¿No tienes cuenta? Regístrate como cliente
              </Link>
              <Link
                to="/recuperar-password"
                className="font-semibold text-blue-700 transition hover:text-blue-800"
              >
                Olvidé mi contraseña
              </Link>
            </div>
          </form>
        )}

        {/* Tab: SaaS Registration */}
        {tab === "saas" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 p-4">
              <h3 className="font-bold text-slate-900">
                🚀 Registra tu Agencia
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Comienza tu período de prueba y accede a planes de suscripción
                flexible
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Plan Básico
                  </p>
                  <p className="text-xs text-slate-500">Ideal para empezar</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Plan Pro
                  </p>
                  <p className="text-xs text-slate-500">Escalable y potente</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Plan Premium
                  </p>
                  <p className="text-xs text-slate-500">
                    Todas las características
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/registro-agencia")}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 font-bold text-white shadow-sm transition hover:from-purple-700 hover:to-blue-700"
            >
              Comenzar Registro de Agencia
            </button>

            <div className="text-center text-xs text-slate-600">
              <p>¿Ya tienes una agencia?</p>
              <button
                onClick={() => setTab("login")}
                className="text-blue-700 font-semibold transition hover:text-blue-800"
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
