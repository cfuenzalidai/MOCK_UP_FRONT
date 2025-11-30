import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/auth';
import { registerLogoutHandler, clearToken } from '../services/api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const navigate = useNavigate();

  // Register API 401 handler -> logout
  useEffect(() => {
    registerLogoutHandler(() => {
      clearToken();
      setUser(null);
      navigate('/login');
    });
  }, [navigate]);

  // Sesión Bootstrap de token
  useEffect(() => {
    let mounted = true;
    async function bootstrap() {
      const token = localStorage.getItem('token');
      if (!token) {
        if (mounted) setBooting(false);
        return;
      }
      try {
        const u = await authService.me();
        if (mounted) setUser(u);
      } catch (error) {
        console.error('Error durante bootstrap de sesión:', error);
        // invalid token
        clearToken();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setBooting(false);
      }
    }
    bootstrap();
    return () => (mounted = false);
  }, []);

  async function login(creds) {
    const res = await authService.login(creds);
    // login retorna { access_token, user }
    const u = res?.user || null;
    setUser(u);
    return u;
  }

  async function signup(payload) {
    // crea el usuario y luego hace auto-login con las credenciales proporcionadas
    await authService.signup(payload);
    const res = await authService.login({ email: payload.email, password: payload.password });
    const u = res?.user || null;
    setUser(u);
    return u;
  }

  function logout() {
    clearToken();
    setUser(null);
    navigate('/');
  }

  async function updateMe(payload) {
    await authService.updateMe(payload);
    const u = await authService.me();
    setUser(u);
    return u;
  }

  async function createPartida() {
    const res = await authService.createPartida();
    // el backend podría retornar { id } o el recurso creado
    return res?.data?.id || res?.data?.partida?.id || res?.data?.id_partida || res?.data;
  }

  return (
    <Ctx.Provider value={{ user, booting, login, signup, logout, updateMe, createPartida }}>
      {children}
    </Ctx.Provider>
  );
}
