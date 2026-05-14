import { useState, useEffect } from "react";
import { useAuth } from "../../../application/context/AuthContext";
import { notify } from "../../components/notifications/notify";
import apiClient from "../../../infrastructure/api/apiClient";
import {
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiHome,
  FiRefreshCw,
} from "react-icons/fi";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalTenants: 0,
    totalPolizas: 0,
    totalComisiones: 0,
  });
  const [ultimosUsuarios, setUltimosUsuarios] = useState([]);
  const [ultimosTenants, setUltimosTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔄 Función para cargar datos reales
  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log(
        "[Dashboard Admin] Cargando datos globales - Usuario:",
        user?.email,
      );

      // 1️⃣ Total de Usuarios en el Sistema
      const usuariosRes = await apiClient.get("usuarios/?is_staff=false");
      const totalUsuarios = usuariosRes.data.count || usuariosRes.data.length || 0;
      console.log("[Admin Dashboard] Total usuarios:", totalUsuarios);

      // 2️⃣ Total de Tenants/Agencias
      const tenantsRes = await apiClient.get("tenants/admin/lista/");
      const totalTenants = tenantsRes.data.count || tenantsRes.data.length || 0;
      const tenantsList = Array.isArray(tenantsRes.data)
        ? tenantsRes.data
        : tenantsRes.data.results || [];
      console.log("[Admin Dashboard] Total tenants:", totalTenants);

      // 3️⃣ Total de Pólizas en el Sistema
      const polizasRes = await apiClient.get("polizas/?estado=ACTIVA");
      const totalPolizas = polizasRes.data.count || polizasRes.data.length || 0;
      console.log("[Admin Dashboard] Total pólizas activas:", totalPolizas);

      // 4️⃣ Últimos 3 Usuarios
      const usuariosRecientesRes = await apiClient.get(
        "usuarios/?ordering=-date_joined&limit=3",
      );
      const usuariosData = Array.isArray(usuariosRecientesRes.data) 
        ? usuariosRecientesRes.data 
        : (usuariosRecientesRes.data.results || []);
      const recientesUsuarios = usuariosData.slice(0, 3).map(
        (u) => ({
          id: u.id,
          email: u.email,
          nombre: u.first_name || "N/A",
          fecha: new Date(u.date_joined).toLocaleDateString("es-ES"),
          esStaff: u.is_staff ? "✅ Staff" : "👤 Usuario",
        }),
      );
      setUltimosUsuarios(recientesUsuarios);
      console.log("[Admin Dashboard] Últimos usuarios:", recientesUsuarios);

      // 5️⃣ Últimos 3 Tenants
      const recentesTenants = (tenantsList.slice(0, 3) || []).map((t) => ({
        id: t.id,
        nombre: t.nombre_agencia || t.nombre || "N/A",
        slug: t.slug,
        plan: t.plan || "N/A",
        fecha: new Date(t.date_created || t.created_at).toLocaleDateString(
          "es-ES",
        ),
      }));
      setUltimosTenants(recentesTenants);
      console.log("[Admin Dashboard] Últimos tenants:", recentesTenants);

      // 6️⃣ Total de Comisiones (suma de todas las primas * 10%)
      const polizasRecientesRes = await apiClient.get("polizas/?limit=100");
      const polizasData = Array.isArray(polizasRecientesRes.data)
        ? polizasRecientesRes.data
        : (polizasRecientesRes.data.results || []);
        
      const totalComisiones = polizasData.reduce((acc, pol) => {
        const prima = parseFloat(pol.prima || 0);
        const comision = prima * 0.1;
        return acc + comision;
      }, 0);
      console.log("[Admin Dashboard] Total comisiones:", totalComisiones);

      // Actualizar Stats
      setStats({
        totalUsuarios,
        totalTenants,
        totalPolizas,
        totalComisiones,
      });

      notify.success("✅ Dashboard actualizado");
    } catch (error) {
      console.error("[Admin Dashboard] Error:", error);
      notify.error(
        "❌ Error: " + (error?.response?.data?.detail || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* 📋 Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            🔐 Dashboard Administrador
          </h1>
          <p className="text-gray-600 mt-1">
            Panel de Control Global - {user?.email}
          </p>
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
          title="Total Usuarios"
          value={stats.totalUsuarios}
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard
          icon={<FiHome size={24} />}
          title="Total Agencias"
          value={stats.totalTenants}
          color="bg-green-500"
          loading={loading}
        />
        <StatCard
          icon={<FiFileText size={24} />}
          title="Total Pólizas"
          value={stats.totalPolizas}
          color="bg-purple-500"
          loading={loading}
        />
        <StatCard
          icon={<FiDollarSign size={24} />}
          title="Total Comisiones"
          value={`$${stats.totalComisiones.toFixed(2)}`}
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      {/* 📈 Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* 👥 Últimos Usuarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              👥 Últimos Usuarios Registrados
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : ultimosUsuarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Sin usuarios registrados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Email</th>
                      <th className="text-left py-2 px-3">Nombre</th>
                      <th className="text-left py-2 px-3">Tipo</th>
                      <th className="text-left py-2 px-3">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosUsuarios.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-3 font-medium">
                          {usuario.email}
                        </td>
                        <td className="py-3 px-3">{usuario.nombre}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              usuario.esStaff === "✅ Staff"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {usuario.esStaff}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {usuario.fecha}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 🏢 Últimas Agencias */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              🏢 Últimas Agencias Registradas
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : ultimosTenants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Sin agencias registradas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Nombre</th>
                      <th className="text-left py-2 px-3">Slug</th>
                      <th className="text-left py-2 px-3">Plan</th>
                      <th className="text-left py-2 px-3">Fecha Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosTenants.map((tenant) => (
                      <tr
                        key={tenant.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-3 font-medium">
                          {tenant.nombre}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs">
                          {tenant.slug}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              tenant.plan === "premium"
                                ? "bg-purple-100 text-purple-800"
                                : tenant.plan === "pro"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {tenant.plan}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {tenant.fecha}
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
          {/* 📊 Resumen del Sistema */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow p-6 border border-indigo-200">
            <h2 className="text-lg font-semibold mb-4">
              📊 Resumen del Sistema
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Usuarios Totales:</span>
                <span className="font-bold text-blue-600">
                  {stats.totalUsuarios}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Agencias/Tenants:</span>
                <span className="font-bold text-green-600">
                  {stats.totalTenants}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Pólizas Activas:</span>
                <span className="font-bold text-purple-600">
                  {stats.totalPolizas}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-700 font-semibold">
                  Comisiones Totales:
                </span>
                <span className="font-bold text-orange-600">
                  ${stats.totalComisiones.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 🚀 Acciones del Admin */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              🚀 Acciones del Admin
            </h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 hover:bg-blue-50 rounded transition font-medium text-blue-600">
                👥 Gestionar Usuarios
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-green-50 rounded transition font-medium text-green-600">
                🏢 Gestionar Agencias
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-purple-50 rounded transition font-medium text-purple-600">
                📋 Ver Bitácora Global
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-orange-50 rounded transition font-medium text-orange-600">
                📊 Reportes Globales
              </button>
            </div>
          </div>

          {/* ⚠️ Alertas */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-xs text-yellow-700 font-semibold">
              ⚠️ Este es el panel de control global del sistema. Los datos se
              actualizan automáticamente cada vez que entras.
            </p>
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
