import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

/* Guarda/lee solo 'user' desde localStorage.
   Integraremos login real más adelante. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  function setMockUser(u) {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  }

  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // por si ya existe
    setUser(null);
  }

  return <Ctx.Provider value={{ user, setUser: setMockUser, logout }}>{children}</Ctx.Provider>;
}
