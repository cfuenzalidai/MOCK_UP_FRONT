import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/perfil.css';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();
  const nav = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Validación cliente
    const errs = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Email inválido';
    if ((password || '').length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';
    if (Object.keys(errs).length) { setFieldErrors(errs); setLoading(false); return; }
    try{
      const res = await login({ email, password });
      if (res?.access_token) localStorage.setItem('token', res.access_token);
      nav('/');
    }catch(err){
      const apiErr = err?.response?.data?.error;
      if (apiErr?.code === 'INVALID_CREDENTIALS') setError('Email o contraseña incorrectos');
      else if (apiErr?.message) setError(apiErr.message);
      else setError(err?.response?.data?.message || err.message || 'Error al iniciar sesión');
    }finally{ setLoading(false); }
  }

  return (
    <section className="hero perfil">
      <div className="perfil-panel">
        <h2 className="perfil-title">Ingresar</h2>

        <form className="perfil-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>

          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <input id="login-password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="submit" className="btn primary" disabled={loading}>{loading? 'Entrando...' : 'Entrar'}</button>
            <Link to="/registro" className="btn">Crear cuenta</Link>
          </div>
        </form>
      </div>
    </section>
  );
}