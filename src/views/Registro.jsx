import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/perfil.css';

export default function Registro(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const { signup } = useAuth();
  const nav = useNavigate();

  async function onSubmit(e){
    e.preventDefault();
    setLoading(true); setError(null); setFieldErrors({});

    // Validación en cliente
    const errs = {};
    if (!nombre || nombre.trim().length < 2) errs.nombre = 'Nombre muy corto';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Email inválido';
    if ((password || '').length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';
    if (Object.keys(errs).length) { setFieldErrors(errs); setLoading(false); return; }

    try{
      // enviar nombre como 'nombre' para coincidir con el backend
      await signup({ nombre, email, password });
      nav('/');
    }catch(err){
      const apiErr = err?.response?.data?.error;
      if (apiErr?.code === 'EMAIL_TAKEN') setError('El email ya está registrado');
      else if (apiErr?.code === 'VALIDATION_ERROR') setError(apiErr.message || 'Datos inválidos');
      else if (apiErr?.message) setError(apiErr.message);
      else setError(err?.response?.data?.message || err.message || 'Error al registrarse');
    }finally{ setLoading(false); }
  }

  return (
    <section className="hero perfil">
      <div className="perfil-panel">
        <h2 className="perfil-title">Registro</h2>

        <form className="perfil-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required />
            {fieldErrors.nombre && <div className="field-error">{fieldErrors.nombre}</div>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input id="password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="submit" className="btn primary" disabled={loading}>{loading? 'Creando...' : 'Crear cuenta'}</button>
            <Link to="/login" className="btn">Ya tengo cuenta</Link>
          </div>
        </form>
      </div>
    </section>
  );
}