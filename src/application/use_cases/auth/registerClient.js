import { authRepository } from '../../../infrastructure/repositories/authRepository';

export async function registerClient(payload) {
	const normalizedPayload = {
		email: String(payload.email || '').trim().toLowerCase(),
		username: String(payload.username || '').trim(),
		password: String(payload.password || ''),
		first_name: String(payload.first_name || '').trim(),
		last_name: String(payload.last_name || '').trim(),
		ci: String(payload.ci || '').trim(),
		telefono: String(payload.telefono || '').trim(),
		direccion: String(payload.direccion || '').trim(),
		fecha_nacimiento: String(payload.fecha_nacimiento || '').trim(),
		genero: String(payload.genero || '').trim(),
		profesion_oficio: String(payload.profesion_oficio || '').trim(),
		es_fumador: payload.es_fumador === true || payload.es_fumador === 'true',
		ingresos_mensuales:
			payload.ingresos_mensuales === '' || payload.ingresos_mensuales == null
				? null
				: Number(payload.ingresos_mensuales),
	};

	return authRepository.registerClient(normalizedPayload);
}

