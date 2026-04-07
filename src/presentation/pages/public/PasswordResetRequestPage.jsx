import { useState } from 'react';
import { Link } from 'react-router-dom';
import { notify } from '../../components/notifications/notify';
import { requestPasswordReset } from '../../../application/use_cases/auth/requestPasswordReset';

export default function PasswordResetRequestPage() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const value = email.trim();

		if (!value) {
			notify.error('Debes ingresar un correo.');
			return;
		}

		try {
			setLoading(true);
			await requestPasswordReset(value);
			setSubmitted(true);
			notify.success('Solicitud enviada. Revisa tu correo.');
		} catch (error) {
			notify.error(error.message || 'No se pudo enviar la solicitud de recuperacion.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className='mx-auto max-w-3xl px-4 py-12 sm:px-6'>
			<div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
				<h1 className='text-3xl font-black text-blue-900'>Recuperar contrasena</h1>
				<p className='mt-2 text-slate-600'>
					Ingresa tu correo y te enviaremos un enlace para restablecer la contrasena.
				</p>

				<form onSubmit={handleSubmit} className='mt-6 space-y-4'>
					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Correo</label>
						<input
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='beimar@gmail.com'
							className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white'
							required
						/>
					</div>

					<button
						type='submit'
						disabled={loading}
						className='w-full rounded-2xl bg-blue-700 py-3.5 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70'
					>
						{loading ? 'Enviando...' : 'Enviar enlace'}
					</button>
				</form>

				{submitted && (
					<div className='mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'>
						Si el correo esta registrado, se envio un enlace de recuperacion.
					</div>
				)}

				<div className='mt-6 text-sm'>
					<Link to='/login' className='font-semibold text-blue-700 hover:text-blue-800'>
						Volver a iniciar sesion
					</Link>
				</div>
			</div>
		</section>
	);
}
