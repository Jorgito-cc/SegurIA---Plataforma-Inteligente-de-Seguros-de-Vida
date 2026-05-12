import { useState, useEffect } from "react";
import { useAuth } from "../../../application/context/AuthContext";

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} opacity-10 p-8 rounded-lg`}></div>
      </div>
    </div>
  );
}

export default function AdminAgenciaDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPolizas: 0,
    comisionesDelMes: 0,
    agentes: 0,
  });

  useEffect(() => {
    // TODO: Implementar llamadas a API para obtener estadísticas de la agencia
    setStats({
      totalClientes: 45,
      totalPolizas: 82,
      comisionesDelMes: 5250.0,
      agentes: 5,
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Clientes"
          value={stats.totalClientes}
          color="bg-blue-500"
        />
        <StatCard
          title="Pólizas Activas"
          value={stats.totalPolizas}
          color="bg-green-500"
        />
        <StatCard
          title="Comisiones (Mes)"
          value={`$${stats.comisionesDelMes.toFixed(2)}`}
          color="bg-purple-500"
        />
        <StatCard title="Agentes" value={stats.agentes} color="bg-orange-500" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Clients */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Últimos Clientes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Nombre</th>Últimas Pólizas
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3">Cliente {i}</td>
                      <td className="py-3">cliente{i}@example.com</td>
                      <td className="py-3">2026-05-10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Policies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Últimas Pólizas</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Número</th>
                    <th className="text-left py-2">Cliente</th>
                    <th className="text-left py-2">Estado</th>
                    <th className="text-left py-2">Prima</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3">POL-{String(i).padStart(4, "0")}</td>
                      <td className="py-3">Cliente {i}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Activa
                        </span>
                      </td>
                      <td className="py-3">$500.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Mi Plan</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Plan Actual</p>
                <p className="text-lg font-bold">
                  {user?.tenant_slug || "Premium"}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Usuarios Utilizados</p>
                <p className="text-lg font-bold">5 / Ilimitados</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Clientes</p>
                <p className="text-lg font-bold">45 / Ilimitados</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition">
                📋 Ver todos los clientes
              </button>
              <button className="w-full text-left px-4 py-2 text-green-600 hover:bg-green-50 rounded transition">
                📊 Ver todas las pólizas
              </button>
              <button className="w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50 rounded transition">
                👥 Gestionar agentes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
