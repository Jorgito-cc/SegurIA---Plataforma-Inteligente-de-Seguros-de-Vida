import { authRepository } from '../../../infrastructure/repositories/authRepository';

export async function requestPasswordReset(email) {
	const normalizedEmail = String(email || '').trim().toLowerCase();
	return authRepository.requestPasswordReset(normalizedEmail);
}

