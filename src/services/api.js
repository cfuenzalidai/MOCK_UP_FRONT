import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL });

let _logoutHandler = null;
export function registerLogoutHandler(fn) { _logoutHandler = fn; }

export function clearToken() { localStorage.removeItem('token'); }

// Adjunta Authorization: Bearer <token> desde localStorage
api.interceptors.request.use((cfg) => {
  try {
    const token = localStorage.getItem('token');
    if (token) cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${token}` };
  } catch (error) { void error; }
  return cfg;
});

// 401 → logout (salvo si el request manda 'X-Suppress-Logout: 1')
api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(err) 
);

export default api;
