import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL });

let _logoutHandler = null;
export function registerLogoutHandler(fn) { _logoutHandler = fn; }

export function clearToken() { localStorage.removeItem('token'); }

// Enlazar el token desde localStorage para cada solicitud
api.interceptors.request.use((cfg) => {
	try {
		const token = localStorage.getItem('token');
		if (token) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
	} catch (e) {}
	return cfg;
});

// On 401 -> call registered logout handler (if any)
// Para 401 -> llama al logout handler registrado (si existe)
api.interceptors.response.use(
	(r) => r,
	(err) => {
		if (err?.response?.status === 401) {
			try {
				if (_logoutHandler) _logoutHandler();
			} catch (e) {}
		}
		return Promise.reject(err);
	}
);

export default api;

