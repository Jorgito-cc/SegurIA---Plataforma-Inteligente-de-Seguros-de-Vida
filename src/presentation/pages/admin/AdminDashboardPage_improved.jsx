import { useEffect, useMemo, useState } from 'react';
import { FaUserTie, FaUsers, FaShieldAlt, FaListUl, FaKey, FaSpinner, FaFileExcel, FaFilePdf, FaDownload } from 'react-icons/fa';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { clientRepository } from '../../../infrastructure/repositories/clientRepository';
import { tipoSeguroRepository } from '../../../infrastructure/repositories/tipoSeguroRepository';
import { roleRepository } from '../../../infrastructure/repositories/roleRepository';
import { bitacoraRepository } from '../../../infrastructure/repositories/bitacoraRepository';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';

function StatCard({ title, value, icon, tone = 'blue' }) {
	const tones = {
		blue: 'from-blue-500 to-indigo-600',
		emerald: 'from-emerald-500 to-green-600',
		orange: 'from-orange-500 to-amber-600',
		violet: 'from-violet-500 to-fuchsia-600',
		slate: 'from-slate-600 to-slate-800',
	};

	return (
		<div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${tones[tone] || tones.blue}`}>
			<div className="flex items-center justify-between">
				<p className="text-sm font-medium opacity-90">{title}</p>
				<span className="text-xl opacity-90">{icon}</span>
			</div>
			<p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
		</div>
	);
}

function HorizontalBars({ title, data }) {
	const max = Math.max(...data.map((d) => d.value), 1);

	return (
		<div className="bg-white rounded-2xl shadow p-5 border border-slate-200">
			<h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
			<div className="space-y-3">
				{data.map((item) => (
					<div key={item.label}>
						<div className="flex justify-between text-sm text-slate-600 mb-1">
							<span>{item.label}</span>
							<span className="font-semibold">{item.value}</span>
						</div>
						<div className="h-2 rounded-full bg-slate-100 overflow-hidden">
							<div
								className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
								style={{ width: `${(item.value / max) * 100}%` }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function SimpleBarChart({ title, data, color = 'blue' }) {
	const max = Math.max(...data.map((d) => d.value), 1);
	const colors = {
		blue: 'bg-blue-500',
		green: 'bg-emerald-500',
		orange: 'bg-orange-500',
		violet: 'bg-violet-500',
		red: 'bg-red-500',
	};

	return (
		<div className="bg-white rounded-2xl shadow p-5 border border-slate-200">
			<h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{data.map((item) => (
					<div key={item.label} className="text-center">
						<div className="flex flex-col items-center">
							<div className="w-16 h-40 bg-slate-100 rounded-lg relative overflow-hidden mb-2">
								<div
									className={`${colors[color]} transition-all absolute bottom-0 w-full rounded-lg`}
									style={{ height: `${(item.value / max) * 100}%` }}
									title={item.label}
								/>
							</div>
							<p className="text-xs font-semibold text-slate-700">{item.label}</p>
							<p className="text-lg font-black text-slate-900">{item.value}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function AdminDashboardPage() {
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		agentes: { total: 0, activos: 0, inactivos: 0 },
		clientes: { total: 0, activos: 0, inactivos: 0, fumadores: 0 },
		tipos: { total: 0, activos: 0, inactivos: 0 },
		roles: { total: 0, permisosTotales: 0, promedioPorRol: 0 },
		bitacora: { total: 0, acciones: {} },
	});

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const [agentesRes, clientesRes, tiposRes, rolesRes, permisosRes, bitacoraRes] = await Promise.all([
					agentRepository.list(1, 500),
					clientRepository.list(1, 500),
					tipoSeguroRepository.list(1, 500),
					roleRepository.list(1, 500),
					roleRepository.getPermissions(),
					bitacoraRepository.list(1, 200),
				]);

				const agentes = agentesRes.results || agentesRes || [];
				const clientes = clientesRes.results || clientesRes || [];
				const tipos = tiposRes.results || tiposRes || [];
				const roles = rolesRes.results || rolesRes || [];
				const permisos = permisosRes.results || permisosRes || [];
				const bitacora = bitacoraRes.results || bitacoraRes || [];

				const accionesMap = bitacora.reduce((acc, row) => {
					acc[row.accion] = (acc[row.accion] || 0) + 1;
					return acc;
				}, {});

				const permisosTotalesRoles = roles.reduce((sum, role) => {
					const count = Array.isArray(role.permissions) ? role.permissions.length : 0;
					return sum + count;
				}, 0);

				setStats({
					agentes: {
						total: agentes.length,
						activos: agentes.filter((a) => a.is_active).length,
						inactivos: agentes.filter((a) => !a.is_active).length,
					},
					clientes: {
						total: clientes.length,
						activos: clientes.filter((c) => c.is_active).length,
						inactivos: clientes.filter((c) => !c.is_active).length,
						fumadores: clientes.filter((c) => c.es_fumador).length,
					},
					tipos: {
						total: tipos.length,
						activos: tipos.filter((t) => t.estado).length,
						inactivos: tipos.filter((t) => !t.estado).length,
					},
					roles: {
						total: roles.length,
						permisosTotales: permisos.length,
						promedioPorRol: roles.length ? (permisosTotalesRoles / roles.length).toFixed(1) : 0,
					},
					bitacora: {
						total: bitacora.length,
						acciones: accionesMap,
					},
				});
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const accionesData = useMemo(() => {
		const preferredOrder = ['LOGIN', 'LOGOUT', 'CREAR', 'EDITAR', 'ELIMINAR'];
		return preferredOrder.map((key) => ({
			label: key,
			value: stats.bitacora.acciones[key] || 0,
		}));
	}, [stats.bitacora.acciones]);

	const handleExportDashboardExcel = () => {
		const data = [
			['RESUMEN DEL SISTEMA - DASHBOARD ADMINISTRADOR'],
			['Generado el:', new Date().toLocaleDateString('es-ES')],
			[''],
			['ESTADÍSTICAS GENERALES'],
			['Métrica', 'Cantidad'],
			['Total Agentes', stats.agentes.total],
			['Agentes Activos', stats.agentes.activos],
			['Agentes Inactivos', stats.agentes.inactivos],
			['Total Clientes', stats.clientes.total],
			['Clientes Activos', stats.clientes.activos],
			['Clientes Inactivos', stats.clientes.inactivos],
			['Clientes Fumadores', stats.clientes.fumadores],
			['Tipos de Seguro', stats.tipos.total],
			['Tipos Activos', stats.tipos.activos],
			['Total Roles', stats.roles.total],
			['Permisos Totales', stats.roles.permisosTotales],
			['Promedio Permisos/Rol', stats.roles.promedioPorRol],
			['Eventos Bitácora', stats.bitacora.total],
			[''],
			['DESGLOSE DE ACTIVIDAD'],
			['Acción', 'Cantidad'],
			...Object.entries(stats.bitacora.acciones).map(([key, val]) => [key, val]),
		];
		exportToExcel('dashboard_resumen', 'Dashboard Resumen', data.map((row) => ({ data: row.join(' - ') })));
	};

	const handleExportDashboardPdf = () => {
		const headers = ['Métrica', 'Cantidad'];
		const rows = [
			['Total Agentes', stats.agentes.total],
			['Agentes Activos', stats.agentes.activos],
			['Agentes Inactivos', stats.agentes.inactivos],
			['Total Clientes', stats.clientes.total],
			['Clientes Activos', stats.clientes.activos],
			['Clientes Inactivos', stats.clientes.inactivos],
			['Clientes Fumadores', stats.clientes.fumadores],
			['Tipos de Seguro Activos', stats.tipos.activos],
			['Tipos de Seguro Inactivos', stats.tipos.inactivos],
			['Total Roles', stats.roles.total],
			['Permisos Totales', stats.roles.permisosTotales],
			['Promedio Permisos por Rol', stats.roles.promedioPorRol],
			['Eventos Bitácora', stats.bitacora.total],
		];
		exportToPdf('Reporte Dashboard Administrador', 'dashboard', headers, rows);
	};

	if (loading) {
		return (
			<div className="p-8 flex items-center justify-center text-slate-700">
				<FaSpinner className="animate-spin mr-3 text-3xl" /> Cargando dashboard...
			</div>
		);
	}

	return (
		<section className="p-6 space-y-6">
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-4xl md:text-4xl font-black text-slate-900">Dashboard Administrador</h1>
					<p className="mt-2 text-slate-600">
						Resumen de operación en tiempo real del sistema de seguros SegurIA
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={handleExportDashboardExcel}
						className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
					>
						<FaFileExcel size={16} /> Excel
					</button>
					<button
						onClick={handleExportDashboardPdf}
						className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2"
					>
						<FaFilePdf size={16} /> PDF
					</button>
				</div>
			</div>

			{/* 5 Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<StatCard title="Agentes" value={stats.agentes.total} icon={<FaUserTie />} tone="blue" />
				<StatCard title="Clientes" value={stats.clientes.total} icon={<FaUsers />} tone="emerald" />
				<StatCard title="Tipos Seguro" value={stats.tipos.total} icon={<FaShieldAlt />} tone="orange" />
				<StatCard title="Roles" value={stats.roles.total} icon={<FaListUl />} tone="violet" />
				<StatCard title="Permisos" value={stats.roles.permisosTotales} icon={<FaKey />} tone="slate" />
			</div>

			{/* Estado de Usuarios y Actividad */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<HorizontalBars
					title="Estado de Usuarios"
					data={[
						{ label: 'Agentes activos', value: stats.agentes.activos },
						{ label: 'Agentes inactivos', value: stats.agentes.inactivos },
						{ label: 'Clientes activos', value: stats.clientes.activos },
						{ label: 'Clientes inactivos', value: stats.clientes.inactivos },
						{ label: 'Clientes fumadores', value: stats.clientes.fumadores },
					]}
				/>

				<HorizontalBars title="Actividad en Bitácora" data={accionesData} />
			</div>

			{/* Tres metros pequeños */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow">
					<h4 className="text-slate-500 text-sm font-medium">Tipos de seguro activos</h4>
					<p className="text-3xl font-black text-slate-900 mt-2">{stats.tipos.activos}</p>
					<p className="text-xs mt-1 text-slate-500">Inactivos: {stats.tipos.inactivos}</p>
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow">
					<h4 className="text-slate-500 text-sm font-medium">Promedio permisos por rol</h4>
					<p className="text-3xl font-black text-slate-900 mt-2">{stats.roles.promedioPorRol}</p>
					<p className="text-xs mt-1 text-slate-500">En {stats.roles.total} roles totales</p>
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow">
					<h4 className="text-slate-500 text-sm font-medium">Eventos en bitácora</h4>
					<p className="text-3xl font-black text-slate-900 mt-2">{stats.bitacora.total}</p>
					<p className="text-xs mt-1 text-slate-500">Últimos registros analizados</p>
				</div>
			</div>

			{/* Gráficos de Barras */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<SimpleBarChart
					title="Distribución de Agentes por Estado"
					data={[
						{ label: 'Activos', value: stats.agentes.activos },
						{ label: 'Inactivos', value: stats.agentes.inactivos },
					]}
					color="blue"
				/>

				<SimpleBarChart
					title="Distribución de Clientes por Estado"
					data={[
						{ label: 'Activos', value: stats.clientes.activos },
						{ label: 'Inactivos', value: stats.clientes.inactivos },
						{ label: 'Fumadores', value: stats.clientes.fumadores },
					]}
					color="green"
				/>
			</div>

			{/* Tablas información adicional */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Tabla Bitácora */}
				<div className="bg-white border border-slate-200 rounded-2xl shadow overflow-hidden">
					<div className="bg-slate-50 border-b border-slate-200 p-4">
						<h3 className="font-bold text-slate-800">Acciones Registradas</h3>
					</div>
					<div className="p-4">
						<div className="space-y-2">
							{accionesData.map((item) => (
								<div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
									<span className="text-sm font-medium text-slate-700">{item.label}</span>
									<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
										{item.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Info Sistema */}
				<div className="bg-white border border-slate-200 rounded-2xl shadow overflow-hidden">
					<div className="bg-slate-50 border-b border-slate-200 p-4">
						<h3 className="font-bold text-slate-800">Información del Sistema</h3>
					</div>
					<div className="p-4 space-y-3">
						<div className="flex justify-between">
							<span className="text-slate-600 font-medium">Agentes Totales:</span>
							<span className="font-bold text-slate-900">{stats.agentes.total}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-600 font-medium">Clientes Totales:</span>
							<span className="font-bold text-slate-900">{stats.clientes.total}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-600 font-medium">Tipos de Seguro:</span>
							<span className="font-bold text-slate-900">{stats.tipos.total}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-600 font-medium">Roles Configurados:</span>
							<span className="font-bold text-slate-900">{stats.roles.total}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-slate-600 font-medium">Permisos Disponibles:</span>
							<span className="font-bold text-slate-900">{stats.roles.permisosTotales}</span>
						</div>
						<div className="border-t border-slate-200 pt-3">
							<div className="flex justify-between">
								<span className="text-slate-600 font-medium">Fecha Reporte:</span>
								<span className="text-sm text-slate-500">{new Date().toLocaleDateString('es-ES')}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
