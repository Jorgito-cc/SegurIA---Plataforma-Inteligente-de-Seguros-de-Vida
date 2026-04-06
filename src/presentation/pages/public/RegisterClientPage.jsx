import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authRepository } from '../../../infrastructure/repositories/authRepository';
import { notify } from '../../components/notifications/notify';

export default function RegisterClientPage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		username: '',
		email: '',
		password: '',
		first_name: '',
		last_name: '',
		ci: '',
		telefono: '',
		direccion: '',
	});

	const onChange = (event) => {
		setForm((state) => ({ ...state, [event.target.name]: event.target.value }));
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		try {
			setLoading(true);
			await authRepository.registerClient(form);
			notify.success('Cliente registrado correctamente');
			navigate('/login');
		} catch (error) {
			notify.error(error.message || 'No se pudo registrar el cliente');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className='mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8 lg:py-16'>
			<div>
				<p className='mb-3 inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700 shadow-sm'>
					Registro de cliente
				</p>
				<h1 className='text-4xl font-black tracking-tight text-blue-900 sm:text-5xl'>
					Crea tu cuenta de cliente
				</h1>
				<p className='mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base'>
					Este formulario coincide con los campos que tu backend Django acepta en <span className='font-semibold'>RegistroClienteSerializer</span>.
				</p>
				<div className='mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
					<p className='text-sm font-bold text-slate-900'>Campos que cuadran con tu backend</p>
					<ul className='mt-3 space-y-2 text-sm text-slate-600'>
						<li>• username, email, password</li>
						<li>• first_name, last_name</li>
						<li>• ci, telefono, direccion</li>
						<li>• Opcionales: fecha_nacimiento, genero, profesion_oficio, es_fumador, ingresos_mensuales</li>
					</ul>
				</div>
			</div>

			<div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] sm:p-7'>
				<form onSubmit={onSubmit} className='space-y-4'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Usuario</label>
							<input name='username' value={form.username} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='carlos_cliente1' />
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Correo</label>
							<input name='email' type='email' value={form.email} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='carlos1@correo.com' />
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Nombres</label>
							<input name='first_name' value={form.first_name} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='Carlos1' />
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Apellidos</label>
							<input name='last_name' value={form.last_name} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='Mendoza1' />
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Carnet de identidad</label>
							<input name='ci' value={form.ci} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='987654321' />
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Teléfono</label>
							<input name='telefono' value={form.telefono} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='71122334' />
						</div>
					</div>

					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Dirección</label>
						<input name='direccion' value={form.direccion} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='Av. Banzer, 4to Anillo' />
					</div>

					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Contraseña</label>
						<input name='password' type='password' value={form.password} onChange={onChange} className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white' placeholder='PasswordSeguro123!' />
					</div>

					<button disabled={loading} className='w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70'>
						{loading ? 'Registrando...' : 'Registrar cliente'}
					</button>

					<p className='pt-2 text-center text-sm text-slate-600'>
						¿Ya tienes cuenta?{' '}
						<Link to='/login' className='font-semibold text-blue-700 transition hover:text-blue-800'>
							Inicia sesión
						</Link>
					</p>
				</form>
			</div>
		</section>
	);
}
