import { useEffect, useMemo, useState } from 'react';
import { FaUserTie, FaUsers, FaShieldAlt, FaListUl, FaKey, FaSpinner } from 'react-icons/fa';
import { agentRepository } from '../../../infrastructure/repositories/agentRepository';
import { clientRepository } from '../../../infrastructure/repositories/clientRepository';
import { tipoSeguroRepository } from '../../../infrastructure/repositories/tipoSeguroRepository';
import { roleRepository } from '../../../infrastructure/repositories/roleRepository';
import { bitacoraRepository } from '../../../infrastructure/repositories/bitacoraRepository';

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

	if (loading) {
		return (
			<div className="p-8 flex items-center justify-center text-slate-700">
				<FaSpinner className="animate-spin mr-3" /> Cargando dashboard...
			</div>
		);
	}

	return (
		<section className="p-6 space-y-6">
			<div>
				<h1 className="text-3xl md:text-4xl font-black text-slate-900">Dashboard Administrador</h1>
				<p className="mt-2 text-slate-600">Resumen de operación en tiempo real del sistema de seguros.</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<StatCard title="Agentes" value={stats.agentes.total} icon={<FaUserTie />} tone="blue" />
				<StatCard title="Clientes" value={stats.clientes.total} icon={<FaUsers />} tone="emerald" />
				<StatCard title="Tipos de Seguro" value={stats.tipos.total} icon={<FaShieldAlt />} tone="orange" />
				<StatCard title="Roles" value={stats.roles.total} icon={<FaListUl />} tone="violet" />
				<StatCard title="Permisos" value={stats.roles.permisosTotales} icon={<FaKey />} tone="slate" />
			</div>

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

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow">
					<h4 className="text-slate-500 text-sm">Tipos de seguro activos</h4>
					<p className="text-3xl font-black text-slate-900 mt-2">{stats.tipos.activos}</p>
					<p className="text-xs mt-1 text-slate-500">Inactivos: {stats.tipos.inactivos}</p>
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow">
					<h4 className="text-slate-500 text-sm">Promedio permisos por rol</h4>
					<p className="text-3xl font-black text-slate-900 mt-2">{stats.roles.promedioPorRol}</p>
					<p className="text-xs mt-1 text-slate-500">Basado en roles existentes</p>
				</div>

				<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow">
					<h4 className="text-slate-500 text-sm">Eventos en bitácora</h4>
					<p className="text-3xl font-black text-slate-900 mt-2">{stats.bitacora.total}</p>
					<p className="text-xs mt-1 text-slate-500">Últimos registros analizados</p>
				</div>
			</div>
		</section>
	);
}
