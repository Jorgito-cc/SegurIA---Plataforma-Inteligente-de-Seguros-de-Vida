import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { notify } from '../../components/notifications/notify';
import { confirmPasswordReset } from '../../../application/use_cases/auth/confirmPasswordReset';

export default function PasswordResetConfirmPage() {
	const [searchParams] = useSearchParams();
	const initialUid = useMemo(() => searchParams.get('uid') || '', [searchParams]);
	const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams]);

	const [uid, setUid] = useState(initialUid);
	const [token, setToken] = useState(initialToken);
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!uid.trim() || !token.trim()) {
			notify.error('Debes proporcionar uid y token.');
			return;
		}

		if (newPassword.length < 8) {
			notify.error('La nueva contrasena debe tener al menos 8 caracteres.');
			return;
		}

		if (newPassword !== confirmPassword) {
			notify.error('Las contrasenas no coinciden.');
			return;
		}

		try {
			setLoading(true);
			await confirmPasswordReset({ uid, token, newPassword });
			setDone(true);
			notify.success('Contrasena actualizada correctamente.');
		} catch (error) {
			notify.error(error.message || 'No se pudo restablecer la contrasena.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className='mx-auto max-w-3xl px-4 py-12 sm:px-6'>
			<div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
				<h1 className='text-3xl font-black text-blue-900'>Restablecer contrasena</h1>
				<p className='mt-2 text-slate-600'>
					Ingresa el uid, token y tu nueva contrasena para completar la recuperacion.
				</p>

				<form onSubmit={handleSubmit} className='mt-6 space-y-4'>
					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>UID</label>
						<input
							type='text'
							value={uid}
							onChange={(e) => setUid(e.target.value)}
							placeholder='Mg'
							className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white'
							required
						/>
					</div>

					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Token</label>
						<input
							type='text'
							value={token}
							onChange={(e) => setToken(e.target.value)}
							placeholder='d62meq-c3617d47567ac11dc93eb739721e3156'
							className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white'
							required
						/>
					</div>

					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Nueva contrasena</label>
						<input
							type='password'
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder='Minimo 8 caracteres'
							className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white'
							required
						/>
					</div>

					<div>
						<label className='mb-2 block text-sm font-semibold text-slate-700'>Confirmar nueva contrasena</label>
						<input
							type='password'
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder='Repite la contrasena'
							className='w-full rounded-2xl border border-slate-200 bg-blue-50/70 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white'
							required
						/>
					</div>

					<button
						type='submit'
						disabled={loading || done}
						className='w-full rounded-2xl bg-blue-700 py-3.5 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70'
					>
						{loading ? 'Guardando...' : done ? 'Contrasena actualizada' : 'Actualizar contrasena'}
					</button>
				</form>

				{done && (
					<div className='mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'>
						Listo. Ya puedes iniciar sesion con tu nueva contrasena.
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
