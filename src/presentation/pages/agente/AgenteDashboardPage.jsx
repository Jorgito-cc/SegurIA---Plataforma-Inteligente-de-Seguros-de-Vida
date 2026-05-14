import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../application/context/AuthContext";
import { notify } from "../../components/notifications/notify";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";
import {
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
  FiAlertTriangle,
  FiChevronRight
} from "react-icons/fi";

export default function AgenteDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPolizas: 0,
    comisionsdelMes: 0,
    promedioPrima: 0,
  });
  const [proximasVencer, setProximasVencer] = useState([]);
  const [ultimosClientes, setUltimosClientes] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // 1. Stats y listas básicas
      const [clientesRes, polizasRes, proximasRes] = await Promise.all([
        apiClient.get(ENDPOINTS.clientes),
        apiClient.get(ENDPOINTS.polizas),
        apiClient.get(ENDPOINTS.proximasVencer)
      ]);

      const clientes = clientesRes.data.results || clientesRes.data;
      const polizas = polizasRes.data.results || polizasRes.data;
      const proximas = proximasRes.data.polizas || [];

      // Calcular stats
      const totalClientes = clientes.length;
      const polizasActivas = polizas.filter(p => p.estado === 'ACTIVA');
      const totalPolizas = polizasActivas.length;
      
      // Promedio prima (de polizas activas)
      const sumPrimas = polizasActivas.reduce((acc, p) => acc + parseFloat(p.prima_final_facturada || 0), 0);
      const promedio = totalPolizas > 0 ? sumPrimas / totalPolizas : 0;

      // Comisiones (usando un 10% base o si el usuario tuviera el dato en el token)
      const comisiones = sumPrimas * 0.1;

      setStats({
        totalClientes,
        totalPolizas,
        comisionsdelMes: comisiones,
        promedioPrima: promedio,
      });

      setUltimosClientes(clientes.slice(0, 5));
      setProximasVencer(proximas.slice(0, 5));

      notify.success("Dashboard actualizado");
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      notify.error("No se pudieron cargar todos los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Panel de Agente
          </h1>
          <p className="text-slate-500 font-medium">Bienvenido de nuevo, {user?.nombre || user?.email}</p>
        </div>
        <button
          onClick={cargarDatos}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Sincronizar Datos
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FiUsers size={24} />}
          title="Mis Clientes"
          value={stats.totalClientes}
          trend="+3 este mes"
          color="blue"
        />
        <StatCard
          icon={<FiFileText size={24} />}
          title="Pólizas Activas"
          value={stats.totalPolizas}
          trend="En vigor"
          color="emerald"
        />
        <StatCard
          icon={<FiDollarSign size={24} />}
          title="Comisiones Est."
          value={`$${stats.comisionsdelMes.toLocaleString()}`}
          trend="10% de cartera"
          color="purple"
        />
        <StatCard
          icon={<FiTrendingUp size={24} />}
          title="Ticket Promedio"
          value={`$${stats.promedioPrima.toLocaleString()}`}
          trend="Por póliza"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas de Renovación */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <FiAlertTriangle className="text-amber-500" /> Alertas de Renovación
              </h2>
              <Link to="/agente/polizas" className="text-xs font-bold text-blue-600 hover:underline">Ver todas</Link>
            </div>
            <div className="p-4 space-y-3">
              {proximasVencer.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-400">No hay pólizas por vencer próximamente.</p>
                </div>
              ) : (
                proximasVencer.map(pol => (
                  <div key={pol.id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition cursor-pointer">
                    <div>
                      <p className="text-sm font-black text-amber-900">{pol.numero_poliza}</p>
                      <p className="text-xs text-amber-700">Vence: {new Date(pol.fecha_vencimiento).toLocaleDateString()}</p>
                    </div>
                    <FiChevronRight className="text-amber-400" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-2">Potencia tus ventas</h3>
               <p className="text-slate-400 text-sm mb-6">Usa nuestra IA para predecir qué clientes tienen más probabilidad de renovar.</p>
               <Link to="/agente/cotizaciones" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
                 Nueva Cotización
               </Link>
             </div>
             <div className="absolute top-[-20px] right-[-20px] opacity-10">
               <FiTrendingUp size={150} />
             </div>
          </div>
        </div>

        {/* Clientes Recientes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800">Clientes Recientes</h2>
              <Link to="/agente/clientes" className="text-xs font-bold text-blue-600 hover:underline">Gestionar todos</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ultimosClientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700">{c.first_name} {c.last_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-500">{c.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${c.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {c.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to="/agente/clientes" className="text-slate-400 hover:text-blue-600 transition">
                          <FiChevronRight size={20} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <p className="text-[10px] font-bold text-slate-400 mt-1">{trend}</p>
      </div>
    </div>
  );
}
