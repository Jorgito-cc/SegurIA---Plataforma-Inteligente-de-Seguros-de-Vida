import { authRepository } from '../../../infrastructure/repositories/authRepository';

export async function confirmPasswordReset({ uid, token, newPassword }) {
	const payload = {
		uid: String(uid || '').trim(),
		token: String(token || '').trim(),
		new_password: String(newPassword || '').trim(),
	};

	return authRepository.confirmPasswordReset(payload);
}

