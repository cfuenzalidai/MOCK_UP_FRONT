import api from './api';

function parseJwt(token) {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
		return payload;
	} catch (e) { return null; }
}

export async function login({ email, password }) {
	const res = await api.post('/login', { email, password });
	// backend retorna { access_token, user }
	if (res?.data?.access_token) localStorage.setItem('token', res.data.access_token);
	return res.data; // incluye user
}

export async function signup(payload) {
	// backend/signup crea el usuario pero no retorna token
	const res = await api.post('/signup', payload);
	return res.data;
}

export async function me() {
	const token = localStorage.getItem('token');
	if (!token) throw new Error('No token');
	const payload = parseJwt(token);
	const userId = payload?.sub;
	if (!userId) throw new Error('Invalid token payload');
	const res = await api.get(`/usuarios/${userId}`);
	return res.data;
}

export async function updateMe(payload) {
	const token = localStorage.getItem('token');
	if (!token) throw new Error('No token');
	const payloadJwt = parseJwt(token);
	const userId = payloadJwt?.sub;
	if (!userId) throw new Error('Invalid token payload');
	return api.put(`/usuarios/${userId}`, payload);
}

export async function createPartida() {
	return api.post('/partidas');
}

export default { login, signup, me, updateMe, createPartida };

// Cambiar contraseña: requiere que el backend exponga POST /usuarios/:id/password
export async function changePassword({ userId, currentPassword, newPassword }) {
	if (!userId) throw new Error('userId requerido');
	return api.post(`/usuarios/${userId}/password`, { currentPassword, newPassword });
}

