import { useState, useEffect } from "react";
import { useAuth } from "../../../application/context/AuthContext";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { notify } from "../../components/notifications/notify";
import { 
  FiUsers, 
  FiFileText, 
  FiDollarSign, 
  FiBriefcase, 
  FiTrendingUp, 
  FiClock,
  FiChevronRight
} from "react-icons/fi";
import { Link } from "react-router-dom";

function StatCard({ icon, title, value, color, trend }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
          {trend && <p className="text-[10px] font-bold text-emerald-500 mt-1">{trend}</p>}
        </div>
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
  const [loading, setLoading] = useState(true);
  const [recentData, setRecentData] = useState({
    clientes: [],
    polizas: []
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [clientesRes, polizasRes, agentesRes] = await Promise.all([
        apiClient.get(ENDPOINTS.clientes),
        apiClient.get(ENDPOINTS.polizas),
        apiClient.get(ENDPOINTS.agentes),
      ]);

      const clientes = clientesRes.data.results || clientesRes.data;
      const polizas = polizasRes.data.results || polizasRes.data;
      const agentes = agentesRes.data.results || agentesRes.data;

      // Calcular comisiones estimadas (simuladas por ahora como el 10% de primas totales)
      const totalPrimas = polizas.reduce((acc, p) => acc + parseFloat(p.prima_final_facturada || 0), 0);

      setStats({
        totalClientes: clientes.length,
        totalPolizas: polizas.filter(p => p.estado === 'ACTIVA').length,
        comisionesDelMes: totalPrimas * 0.1,
        agentes: agentes.length,
      });

      setRecentData({
        clientes: clientes.slice(0, 5),
        polizas: polizas.slice(0, 5)
      });

    } catch (error) {
      notify.error("Error al cargar estadísticas del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Panel de Control
          </h1>
          <p className="text-slate-500 font-medium">Gestionando la agencia: <span className="text-blue-600 font-bold">{user?.tenant_slug?.toUpperCase() || "Global"}</span></p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchStats} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition">
             <FiClock /> Sincronizar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiUsers />}
          title="Total Clientes"
          value={loading ? "..." : stats.totalClientes}
          color="bg-blue-50 text-blue-600"
          trend="+5 nuevos hoy"
        />
        <StatCard
          icon={<FiFileText />}
          title="Pólizas Activas"
          value={loading ? "..." : stats.totalPolizas}
          color="bg-emerald-50 text-emerald-600"
          trend="Cartera en vigor"
        />
        <StatCard
          icon={<FiDollarSign />}
          title="Comisiones Est."
          value={loading ? "..." : `$${stats.comisionesDelMes.toLocaleString()}`}
          color="bg-purple-50 text-purple-600"
          trend="Mes actual"
        />
        <StatCard 
          icon={<FiBriefcase />}
          title="Fuerza de Ventas"
          value={loading ? "..." : stats.agentes} 
          color="bg-orange-50 text-orange-600" 
          trend="Agentes activos"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Clients */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">Últimos Clientes</h2>
              <Link to="/admin-agencia/agentes" className="text-xs font-black text-blue-600 hover:underline">Ver todos</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentData.clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-5 font-bold text-slate-700">{c.first_name} {c.last_name}</td>
                      <td className="px-8 py-5 text-slate-500">{c.email}</td>
                      <td className="px-8 py-5 text-slate-400 font-mono text-xs">{c.ci}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Policies */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">Pólizas Recientes</h2>
              <Link to="/agente/polizas" className="text-xs font-black text-blue-600 hover:underline">Gestionar</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Número</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentData.polizas.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-8 py-5 font-bold text-slate-700">{p.numero_poliza}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {p.estado}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-900">${parseFloat(p.prima_final_facturada).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Actions and Info */}
        <div className="space-y-8">
          {/* Plan Info */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
             <div className="relative z-10">
               <h2 className="text-xl font-black mb-6">Estado de Suscripción</h2>
               <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                   <span className="text-slate-400 text-xs font-bold">Plan</span>
                   <span className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Agencia Pro</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                   <span className="text-slate-400 text-xs font-bold">Agentes</span>
                   <span className="font-black">{stats.agentes} / ∞</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-slate-400 text-xs font-bold">Vencimiento</span>
                   <span className="font-black text-amber-400">Próximo Mes</span>
                 </div>
               </div>
               <button className="w-full mt-8 bg-white text-slate-900 py-3 rounded-2xl font-black hover:bg-slate-100 transition">
                 Mejorar Plan
               </button>
             </div>
             <FiTrendingUp className="absolute bottom-[-20px] right-[-20px] text-white/5" size={150} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-6">Acciones Rápidas</h2>
            <div className="space-y-3">
              <Link to="/admin-agencia/reportes" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition group">
                <span className="text-xs font-black text-slate-600 group-hover:text-blue-600">Generar Reporte IA</span>
                <FiChevronRight className="text-slate-300 group-hover:text-blue-500" />
              </Link>
              <Link to="/admin-agencia/backups" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition group">
                <span className="text-xs font-black text-slate-600 group-hover:text-emerald-600">Gestionar Backups</span>
                <FiChevronRight className="text-slate-300 group-hover:text-emerald-500" />
              </Link>
              <Link to="/admin-agencia/agentes" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-purple-50 transition group">
                <span className="text-xs font-black text-slate-600 group-hover:text-purple-600">Control de Agentes</span>
                <FiChevronRight className="text-slate-300 group-hover:text-purple-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
