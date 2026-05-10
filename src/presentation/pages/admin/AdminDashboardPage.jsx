import { useState, useEffect } from "react";
import { useAuth } from "../../../application/context/AuthContext";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalUsuarios: 0,
    planesActivos: 0,
    ingresosMensuales: 0,
  });

  useEffect(() => {
    // TODO: Implementar llamadas a API para obtener estadísticas del sistema
    setStats({
      totalTenants: 127,
      totalUsuarios: 3456,
      planesActivos: 89,
      ingresosMensuales: 45320.0,
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard del Sistema
        </h1>
        <p className="text-gray-600 mt-2">
          Administrador: {user?.nombre || user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Agencias Activas"
          value={stats.totalTenants}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          icon="🏢"
        />
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsuarios}
          color="bg-gradient-to-br from-green-500 to-emerald-600"
          icon="👥"
        />
        <StatCard
          title="Planes Activos"
          value={stats.planesActivos}
          color="bg-gradient-to-br from-purple-500 to-indigo-600"
          icon="📦"
        />
        <StatCard
          title="Ingresos (Mes)"
          value={`$${stats.ingresosMensuales.toLocaleString("es-ES", { maximumFractionDigits: 0 })}`}
          color="bg-gradient-to-br from-orange-500 to-red-600"
          icon="💵"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wider */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agencias Recientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Agencias Recientes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Agencia
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Plan
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">
                      Usuarios
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* TODO: Reemplazar con datos reales */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-3 px-2">Agencia {i}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            i % 3 === 0
                              ? "bg-green-100 text-green-800"
                              : i % 3 === 1
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {i % 3 === 0
                            ? "BÁSICO"
                            : i % 3 === 1
                              ? "PRO"
                              : "PREMIUM"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Activo
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold">
                        {i * 5}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-4 w-full py-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm font-semibold">
              Ver Todas las Agencias →
            </button>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Actividad Reciente
            </h2>
            <div className="space-y-3">
              {/* TODO: Obtener datos reales de bitácora */}
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3 border-b last:border-b-0"
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                      i % 2 === 0 ? "bg-green-500" : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {i % 2 === 0
                        ? "Nueva agencia registrada"
                        : "Pago procesado"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Agencia {i} - Hace {i} horas
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {i % 2 === 0 ? "✓" : "$"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Estado del Sistema */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Estado del Sistema
            </h2>
            <div className="space-y-4">
              <StatusItem label="API" status="operativo" />
              <StatusItem label="Base de Datos" status="operativo" />
              <StatusItem label="Stripe" status="conectado" />
              <StatusItem label="Gemini AI" status="activo" />
            </div>
          </div>

          {/* Distribución de Planes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Distribución de Planes
            </h2>
            <div className="space-y-3">
              <PlanDistribution plan="BÁSICO" percentage={35} color="green" />
              <PlanDistribution plan="PRO" percentage={45} color="blue" />
              <PlanDistribution plan="PREMIUM" percentage={20} color="purple" />
            </div>
          </div>

          {/* Acciones Admin */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Acciones
            </h2>
            <div className="space-y-2">
              <AdminButton label="Usuarios del Sistema" />
              <AdminButton label="Auditoría de Cambios" />
              <AdminButton label="Reportes" />
              <AdminButton label="Configuración" />
            </div>
          </div>

          {/* Información */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow p-6 border border-indigo-200">
            <h3 className="text-sm font-semibold text-indigo-900 mb-2">
              ℹ️ Sistema Operativo
            </h3>
            <p className="text-xs text-indigo-700">
              Todos los servicios funcionan correctamente. No hay alertas
              activas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div className={`${color} rounded-lg shadow p-6 text-white`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-90 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}

function StatusItem({ label, status }) {
  const statusColor =
    status === "operativo" || status === "activo"
      ? "text-green-600 bg-green-50"
      : "text-blue-600 bg-blue-50";

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <span className="text-sm text-gray-700">{label}</span>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}
      >
        {status}
      </span>
    </div>
  );
}

function PlanDistribution({ plan, percentage, color }) {
  const bgClass = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
  }[color];

  const lightClass = {
    green: "bg-green-100",
    blue: "bg-blue-100",
    purple: "bg-purple-100",
  }[color];

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{plan}</span>
        <span className="text-sm font-bold text-gray-700">{percentage}%</span>
      </div>
      <div className={`w-full rounded-full h-2.5 ${lightClass}`}>
        <div
          className={`${bgClass} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function AdminButton({ label }) {
  return (
    <button className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded transition font-medium text-gray-700">
      {label} →
    </button>
  );
}
