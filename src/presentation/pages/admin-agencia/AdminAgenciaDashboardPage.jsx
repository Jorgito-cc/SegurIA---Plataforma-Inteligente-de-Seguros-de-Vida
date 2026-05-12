import { useState, useEffect } from "react";
import { useAuth } from "../../../application/context/AuthContext";
import { clientRepository } from "../../../infrastructure/repositories/clientRepository";
import { notify } from "../../components/notifications/notify";
import apiClient from "../../../infrastructure/api/apiClient";

export default function AdminAgenciaDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPolizas: 0,
    comisionesDelMes: 0,
    agentes: 0,
  });
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [ultimasPolizas, setUltimasPolizas] = useState([]);
  const [miPlan, setMiPlan] = useState({
    planActual: "N/A",
    usuariosUtilizados: 0,
    clientesLimit: 0,
  });
  const [loading, setLoading] = useState(true);

  // Función para cargar todos los datos del dashboard
  const cargarDatos = async () => {
    try {
      setLoading(true);

      // 1️⃣ Total de Clientes
      const clientesRes = await apiClient.get("clientes/");
      const totalClientes = clientesRes.data.count || 0;

      // 2️⃣ Pólizas Activas
      const polizasRes = await apiClient.get("polizas/?estado=ACTIVA");
      const totalPolizas = polizasRes.data.count || 0;

      // 3️⃣ Total de Agentes
      const agentesRes = await apiClient.get("agentes/");
      const totalAgentes = agentesRes.data.count || 0;

      // 4️⃣ Últimos 3 Clientes
      const clientesRecientesRes = await apiClient.get(
        "clientes/?ordering=-id&limit=3",
      );
      const recientes = clientesRecientesRes.data.results || [];
      setUltimosClientes(recientes);

      // 5️⃣ Últimas 3 Pólizas
      const polizasRecientesRes = await apiClient.get(
        "polizas/?ordering=-id&limit=3",
      );
      const polizasRecientes = polizasRecientesRes.data.results || [];
      setUltimasPolizas(polizasRecientes);

      // 6️⃣ Calcular Comisiones del Mes (suma de primas de pólizas activas)
      const comisiones = polizasRecientes.reduce((acc, pol) => {
        const prima = parseFloat(pol.prima || 0);
        const comision = prima * 0.1; // 10% de comisión
        return acc + comision;
      }, 0);

      // 7️⃣ Información del Plan/Tenant
      const planRes = await apiClient.get("tenants/info/");
      const plan = planRes.data;
      setMiPlan({
        planActual: plan.plan || "Premium",
        usuariosUtilizados: plan.usuarios_utilizados || 0,
        clientesLimit: plan.clientes_limit || "Ilimitados",
      });

      // Actualizar Stats
      setStats({
        totalClientes,
        totalPolizas,
        comisionesDelMes: comisiones,
        agentes: totalAgentes,
      });

      notify.success("Dashboard cargado correctamente");
    } catch (error) {
      console.error("[Dashboard] Error cargando datos:", error);
      notify.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [user?.tenant_slug]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard - Agencia {user?.tenant_nombre}
        </h1>
        <p className="text-gray-600 mt-2">Bienvenido, {user?.email}</p>
      </div>

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
            {loading ? (
              <div className="text-center py-4 text-gray-500">Cargando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Nombre</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosClientes.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center py-4 text-gray-500"
                        >
                          No hay clientes registrados
                        </td>
                      </tr>
                    ) : (
                      ultimosClientes.map((cliente) => (
                        <tr
                          key={cliente.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3">
                            {cliente.first_name || cliente.email}
                          </td>
                          <td className="py-3">{cliente.email}</td>
                          <td className="py-3">
                            {new Date(cliente.date_joined).toLocaleDateString(
                              "es-ES",
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Policies */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Últimas Pólizas</h2>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Cargando...</div>
            ) : (
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
                    {ultimasPolizas.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center py-4 text-gray-500"
                        >
                          No hay pólizas registradas
                        </td>
                      </tr>
                    ) : (
                      ultimasPolizas.map((poliza) => (
                        <tr
                          key={poliza.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 font-mono">
                            {poliza.numero_poliza}
                          </td>
                          <td className="py-3">
                            {poliza.cliente_nombre || "N/A"}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                poliza.estado === "ACTIVA"
                                  ? "bg-green-100 text-green-800"
                                  : poliza.estado === "SUSPENDIDA"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : poliza.estado === "CANCELADA"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {poliza.estado}
                            </span>
                          </td>
                          <td className="py-3 font-bold">
                            ${parseFloat(poliza.prima || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Mi Plan</h2>
            {loading ? (
              <div className="text-center py-4 text-gray-500">Cargando...</div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-gray-600 text-sm">Plan Actual</p>
                  <p className="text-lg font-bold capitalize">
                    {miPlan.planActual}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Usuarios Utilizados</p>
                  <p className="text-lg font-bold">
                    {miPlan.usuariosUtilizados} / Ilimitados
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Clientes</p>
                  <p className="text-lg font-bold">
                    {stats.totalClientes} / {miPlan.clientesLimit}
                  </p>
                </div>
                <button
                  onClick={cargarDatos}
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                >
                  Actualizar
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition">
                + Agregar Cliente
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition">
                + Nueva Cotización
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition">
                + Agregar Agente
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition">
                Ver Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div
        className={`${color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center`}
      >
        <span className="text-white text-xl">📊</span>
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
