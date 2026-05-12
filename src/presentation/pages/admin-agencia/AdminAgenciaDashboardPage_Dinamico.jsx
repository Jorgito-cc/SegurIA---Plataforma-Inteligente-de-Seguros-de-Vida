import { useState, useEffect } from "react";
import { useAuth } from "../../../application/context/AuthContext";
import { notify } from "../../components/notifications/notify";
import apiClient from "../../../infrastructure/api/apiClient";
import {
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiUserCheck,
  FiRefreshCw,
} from "react-icons/fi";

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
  const [loading, setLoading] = useState(false);

  // 🔄 Función para cargar datos reales
  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log(
        "[Dashboard AdminAgencia] Cargando datos para tenant:",
        user?.tenant_slug,
      );

      // 1️⃣ Total de Clientes
      const clientesRes = await apiClient.get("clientes/");
      const totalClientes = clientesRes.data.count || 0;
      console.log("[Dashboard] Total clientes:", totalClientes);

      // 2️⃣ Pólizas Activas
      const polizasRes = await apiClient.get("polizas/?estado=ACTIVA");
      const totalPolizas = polizasRes.data.count || 0;
      console.log("[Dashboard] Total pólizas activas:", totalPolizas);

      // 3️⃣ Total de Agentes
      const agentesRes = await apiClient.get("agentes/");
      const totalAgentes = agentesRes.data.count || 0;
      console.log("[Dashboard] Total agentes:", totalAgentes);

      // 4️⃣ Últimos 3 Clientes
      const clientesRecientesRes = await apiClient.get(
        "clientes/?ordering=-id&limit=3",
      );
      const recientes = (clientesRecientesRes.data.results || []).map((c) => ({
        id: c.id,
        nombre: c.first_name || c.email,
        email: c.email,
        fecha: new Date(c.date_joined).toLocaleDateString("es-ES"),
      }));
      setUltimosClientes(recientes);
      console.log("[Dashboard] Últimos clientes:", recientes);

      // 5️⃣ Últimas 3 Pólizas
      const polizasRecientesRes = await apiClient.get(
        "polizas/?ordering=-id&limit=3",
      );
      const polizasRecientes = (polizasRecientesRes.data.results || []).map(
        (p) => ({
          id: p.id,
          numero: p.numero_poliza,
          cliente: p.cliente_nombre || "N/A",
          estado: p.estado,
          prima: parseFloat(p.prima || 0),
        }),
      );
      setUltimasPolizas(polizasRecientes);
      console.log("[Dashboard] Últimas pólizas:", polizasRecientes);

      // 6️⃣ Calcular Comisiones del Mes
      const comisiones = polizasRecientes.reduce((acc, pol) => {
        const comision = pol.prima * 0.1; // 10% de comisión
        return acc + comision;
      }, 0);
      console.log("[Dashboard] Comisiones calculadas:", comisiones);

      // Actualizar Stats
      setStats({
        totalClientes,
        totalPolizas,
        comisionesDelMes: comisiones,
        agentes: totalAgentes,
      });

      notify.success("✅ Dashboard actualizado");
    } catch (error) {
      console.error("[Dashboard] Error:", error);
      notify.error(
        "❌ Error: " + (error?.response?.data?.detail || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Cargar datos al montar o cambiar tenant
  useEffect(() => {
    if (user?.tenant_slug) {
      cargarDatos();
    }
  }, [user?.tenant_slug]);

  return (
    <div className="space-y-6 p-6">
      {/* 📋 Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            🏢 {user?.tenant_nombre || "Dashboard"}
          </h1>
          <p className="text-gray-600 mt-1">Bienvenido, {user?.email}</p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* 📊 Stats Grid - DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FiUsers size={24} />}
          title="Total Clientes"
          value={stats.totalClientes}
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard
          icon={<FiFileText size={24} />}
          title="Pólizas Activas"
          value={stats.totalPolizas}
          color="bg-green-500"
          loading={loading}
        />
        <StatCard
          icon={<FiDollarSign size={24} />}
          title="Comisiones (Mes)"
          value={`$${stats.comisionesDelMes.toFixed(2)}`}
          color="bg-purple-500"
          loading={loading}
        />
        <StatCard
          icon={<FiUserCheck size={24} />}
          title="Agentes"
          value={stats.agentes}
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      {/* 📈 Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 👥 Últimos Clientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">👥 Últimos Clientes</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : ultimosClientes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Sin clientes registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Nombre</th>
                      <th className="text-left py-2 px-3">Email</th>
                      <th className="text-left py-2 px-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosClientes.map((cliente) => (
                      <tr
                        key={cliente.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-3">{cliente.nombre}</td>
                        <td className="py-3 px-3">{cliente.email}</td>
                        <td className="py-3 px-3 text-gray-600">
                          {cliente.fecha}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 📄 Últimas Pólizas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📄 Últimas Pólizas</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : ultimasPolizas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Sin pólizas registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Número</th>
                      <th className="text-left py-2 px-3">Cliente</th>
                      <th className="text-left py-2 px-3">Estado</th>
                      <th className="text-left py-2 px-3">Prima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimasPolizas.map((poliza) => (
                      <tr
                        key={poliza.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-3 font-mono text-xs">
                          {poliza.numero}
                        </td>
                        <td className="py-3 px-3">{poliza.cliente}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              poliza.estado === "ACTIVA"
                                ? "bg-green-100 text-green-800"
                                : poliza.estado === "SUSPENDIDA"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {poliza.estado}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold">
                          ${poliza.prima.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* 🎯 Resumen Rápido */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow p-6 border border-indigo-200">
            <h2 className="text-lg font-semibold mb-4">📊 Resumen Ejecutivo</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Tenant:</span>
                <span className="font-bold text-indigo-600">
                  {user?.tenant_slug}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Clientes Activos:</span>
                <span className="font-bold text-green-600">
                  {stats.totalClientes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Pólizas Vigentes:</span>
                <span className="font-bold text-blue-600">
                  {stats.totalPolizas}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-700 font-semibold">
                  Comisiones Mes:
                </span>
                <span className="font-bold text-purple-600">
                  ${stats.comisionesDelMes.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 🚀 Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">🚀 Acciones Rápidas</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded transition font-medium text-blue-600">
                ➕ Agregar Cliente
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-green-50 rounded transition font-medium text-green-600">
                ➕ Nueva Cotización
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-purple-50 rounded transition font-medium text-purple-600">
                ➕ Agregar Agente
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-orange-50 rounded transition font-medium text-orange-600">
                📊 Ver Reportes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 📦 Componente Reutilizable
function StatCard({ icon, title, value, color, loading }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div
        className={`${color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white`}
      >
        {icon}
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2 text-gray-900">
        {loading ? "..." : value}
      </p>
    </div>
  );
}
