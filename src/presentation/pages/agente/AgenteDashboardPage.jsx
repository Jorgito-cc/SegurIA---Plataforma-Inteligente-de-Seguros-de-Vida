import { useState, useEffect } from "react";
import { useAuth } from "../../../application/context/AuthContext";

export default function AgenteDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    misClientes: 0,
    cotizacionesDelMes: 0,
    polizasGestionadas: 0,
    comisionesDelMes: 0,
  });

  useEffect(() => {
    // TODO: Implementar llamadas a API para obtener estadísticas del agente
    setStats({
      misClientes: 24,
      cotizacionesDelMes: 8,
      polizasGestionadas: 42,
      comisionesDelMes: 3250.0,
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Mi Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Bienvenido, {user?.nombre || user?.email}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Mis Clientes"
          value={stats.misClientes}
          color="bg-blue-500"
          icon="👥"
        />
        <StatCard
          title="Cotizaciones (Mes)"
          value={stats.cotizacionesDelMes}
          color="bg-purple-500"
          icon="📝"
        />
        <StatCard
          title="Pólizas Gestionadas"
          value={stats.polizasGestionadas}
          color="bg-green-500"
          icon="📋"
        />
        <StatCard
          title="Comisiones (Mes)"
          value={`$${stats.comisionesDelMes.toFixed(2)}`}
          color="bg-orange-500"
          icon="💰"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wider */}
        <div className="lg:col-span-2 space-y-6">
          {/* Últimas Cotizaciones */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Últimas Cotizaciones</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Tipo Seguro</th>
                    <th className="text-left py-2">Prima</th>
                    <th className="text-left py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {/* TODO: Reemplazar con datos reales */}
                  {[1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3">Cliente {i}</td>
                      <td className="py-3">Vida</td>
                      <td className="py-3">
                        ${Math.floor(Math.random() * 1000) + 500}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            i % 2 === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {i % 2 === 0 ? "Pendiente" : "Convertida"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mis Clientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Clientes Principales</h2>
            <div className="space-y-3">
              {/* TODO: Obtener datos reales */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100"
                >
                  <div>
                    <p className="text-sm font-medium">Cliente {i}</p>
                    <p className="text-xs text-gray-500">
                      {Math.floor(Math.random() * 5) + 1} pólizas
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    ${Math.floor(Math.random() * 5000) + 1000}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mis Objetivos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Mis Objetivos</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Cotizaciones</span>
                  <span className="text-sm font-bold">8/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "53%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Conversión</span>
                  <span className="text-sm font-bold">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "42%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Comisiones</span>
                  <span className="text-sm font-bold">$3,250</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded transition">
                + Nueva Cotización
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded transition">
                + Nuevo Cliente
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded transition">
                Ver Mis Clientes
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded transition">
                Reportes
              </button>
            </div>
          </div>

          {/* Información Útil */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
            <h2 className="text-xl font-semibold mb-3 text-blue-900">
              Tip del Día
            </h2>
            <p className="text-sm text-blue-800">
              Aumenta tu tasa de conversión ofreciendo planes personalizados
              según el perfil de riesgo del cliente.
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
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-4xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}
