import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { registerClient } from '../../../application/use_cases/auth/registerClient';
import { notify } from '../../components/notifications/notify';

export default function RegisterClientPage() {
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm({
		defaultValues: {
			username: '',
			email: '',
			password: '',
			confirm_password: '',
			first_name: '',
			last_name: '',
			ci: '',
			telefono: '',
			direccion: '',
			fecha_nacimiento: '',
			genero: '',
			profesion_oficio: '',
			es_fumador: '',
			ingresos_mensuales: '',
		},
		mode: 'onTouched',
	});

	const passwordValue = watch('password');

	const inputBase = useMemo(
		() =>
			'w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white',
		[]
	);

	const renderError = (field) =>
		errors[field] ? <p className='mt-1 text-xs font-semibold text-red-600'>{errors[field].message}</p> : null;

	const onSubmit = async (values) => {
		const payload = {
			...values,
			es_fumador: values.es_fumador === 'true',
		};

		delete payload.confirm_password;

		try {
			await registerClient(payload);
			notify.success('Cliente registrado correctamente');
			navigate('/login');
		} catch (error) {
			notify.error(error.message || 'No se pudo registrar el cliente');
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
					Formulario validado con React Hook Form y alineado a RegistroClienteSerializer.
				</p>
				<div className='mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm'>
					<p className='text-sm font-bold text-slate-900'>Validaciones incluidas</p>
					<ul className='mt-3 space-y-2 text-sm text-slate-600'>
						<li>• Todos los campos del backend son obligatorios en el formulario</li>
						<li>• Correo valido, password minima, confirmacion de password</li>
						<li>• CI y telefono con formato numerico</li>
						<li>• Ingresos con monto mayor a cero</li>
					</ul>
				</div>
			</div>

			<div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.35)] sm:p-7'>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-4' noValidate>
					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Usuario</label>
							<input
								{...register('username', {
									required: 'El usuario es obligatorio',
									minLength: { value: 4, message: 'Minimo 4 caracteres' },
								})}
								className={inputBase}
								placeholder='carlos_cliente1'
							/>
							{renderError('username')}
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Correo</label>
							<input
								type='email'
								{...register('email', {
									required: 'El correo es obligatorio',
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: 'Formato de correo invalido',
									},
								})}
								className={inputBase}
								placeholder='carlos1@correo.com'
							/>
							{renderError('email')}
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Nombres</label>
							<input
								{...register('first_name', {
									required: 'El nombre es obligatorio',
									minLength: { value: 2, message: 'Minimo 2 caracteres' },
								})}
								className={inputBase}
								placeholder='Carlos1'
							/>
							{renderError('first_name')}
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Apellidos</label>
							<input
								{...register('last_name', {
									required: 'El apellido es obligatorio',
									minLength: { value: 2, message: 'Minimo 2 caracteres' },
								})}
								className={inputBase}
								placeholder='Mendoza1'
							/>
							{renderError('last_name')}
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Carnet de identidad</label>
							<input
								{...register('ci', {
									required: 'La cedula es obligatoria',
									pattern: {
										value: /^\d{6,15}$/,
										message: 'Solo numeros (6 a 15 digitos)',
									},
								})}
								className={inputBase}
								placeholder='987654321'
							/>
							{renderError('ci')}
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Telefono</label>
							<input
								{...register('telefono', {
									required: 'El telefono es obligatorio',
									pattern: {
										value: /^\d{7,15}$/,
										message: 'Solo numeros (7 a 15 digitos)',
									},
								})}
								className={inputBase}
								placeholder='71122334'
							/>
							{renderError('telefono')}
						</div>
					</div>

					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Direccion</label>
						<input
							{...register('direccion', {
								required: 'La direccion es obligatoria',
								minLength: { value: 6, message: 'Minimo 6 caracteres' },
							})}
							className={inputBase}
							placeholder='Av. Banzer, 4to Anillo'
						/>
						{renderError('direccion')}
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Fecha de nacimiento</label>
							<input
								type='date'
								{...register('fecha_nacimiento', {
									required: 'La fecha de nacimiento es obligatoria',
								})}
								className={inputBase}
							/>
							{renderError('fecha_nacimiento')}
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Genero</label>
							<select
								{...register('genero', {
									required: 'Selecciona un genero',
								})}
								className={inputBase}
							>
								<option value=''>Seleccionar...</option>
								<option value='M'>Masculino</option>
								<option value='F'>Femenino</option>
								<option value='O'>Otro</option>
							</select>
							{renderError('genero')}
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Profesion u oficio</label>
							<input
								{...register('profesion_oficio', {
									required: 'La profesion/oficio es obligatoria',
									minLength: { value: 3, message: 'Minimo 3 caracteres' },
								})}
								className={inputBase}
								placeholder='Analista de sistemas'
							/>
							{renderError('profesion_oficio')}
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Ingresos mensuales</label>
							<input
								type='number'
								step='0.01'
								{...register('ingresos_mensuales', {
									required: 'Los ingresos son obligatorios',
									min: { value: 1, message: 'Debe ser mayor a 0' },
								})}
								className={inputBase}
								placeholder='4500.00'
							/>
							{renderError('ingresos_mensuales')}
						</div>
					</div>

					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Es fumador</label>
						<div className='flex gap-5 rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3'>
							<label className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700'>
								<input
									type='radio'
									value='true'
									{...register('es_fumador', { required: 'Debes indicar si eres fumador' })}
								/>
								Si
							</label>
							<label className='inline-flex items-center gap-2 text-sm font-semibold text-slate-700'>
								<input
									type='radio'
									value='false'
									{...register('es_fumador', { required: 'Debes indicar si eres fumador' })}
								/>
								No
							</label>
						</div>
						{renderError('es_fumador')}
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Contrasena</label>
							<input
								type='password'
								{...register('password', {
									required: 'La contrasena es obligatoria',
									minLength: { value: 8, message: 'Minimo 8 caracteres' },
								})}
								className={inputBase}
								placeholder='PasswordSeguro123!'
							/>
							{renderError('password')}
						</div>
						<div>
							<label className='mb-2 block text-sm font-semibold text-slate-700'>Confirmar contrasena</label>
							<input
								type='password'
								{...register('confirm_password', {
									required: 'Confirma tu contrasena',
									validate: (value) => value === passwordValue || 'Las contrasenas no coinciden',
								})}
								className={inputBase}
								placeholder='Repite la contrasena'
							/>
							{renderError('confirm_password')}
						</div>
					</div>

					<button
						disabled={isSubmitting}
						className='w-full rounded-2xl bg-emerald-500 py-3.5 font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70'
					>
						{isSubmitting ? 'Registrando...' : 'Registrar cliente'}
					</button>

					<p className='pt-2 text-center text-sm text-slate-600'>
						¿Ya tienes cuenta?{' '}
						<Link to='/login' className='font-semibold text-blue-700 transition hover:text-blue-800'>
							Inicia sesion
						</Link>
					</p>
				</form>
			</div>
		</section>
	);
}
