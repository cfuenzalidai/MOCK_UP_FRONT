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
	} catch (error) { void error; }
	return cfg;
});

// Para 401 -> llama al logout handler registrado (si existe)
api.interceptors.response.use(
	(r) => r,
	(err) => {
		// Si recibimos 401, por defecto llamamos al logout handler. Sin embargo,
		// algunos endpoints (por ejemplo: cambio de contraseña) usan 401 como
		// código de negocio para "credenciales inválidas" y no deben forzar el
		// logout del usuario. Para permitir excepciones, el request puede enviar
		// la cabecera 'X-Suppress-Logout: 1' para evitar esta lógica.
		const status = err?.response?.status;
		const suppress = err?.config?.headers?.['X-Suppress-Logout'] === '1';
		if (status === 401 && !suppress) {
			try { if (_logoutHandler) _logoutHandler(); } catch (error) { void error; }
		}
		return Promise.reject(err);
	}
);

export default api;

