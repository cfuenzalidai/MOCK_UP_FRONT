import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/auth';
import '../assets/styles/perfil.css';

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const currentRef = useRef(null);
  const timerRef = useRef(null);
  const newRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!user) {
    return (
      <section className="hero perfil">
        <div className="perfil-panel">
          <h2 className="perfil-title">Cambiar contraseña</h2>
          <p className="perfil-msg">Debes iniciar sesión para cambiar tu contraseña.</p>
        </div>
      </section>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirm) {
      setError('La nueva contraseña y la confirmación no coinciden');
      return;
    }
    // Validación: nueva contraseña debe tener al menos 6 caracteres
    if ((newPassword || '').length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      setNewPassword('');
      setConfirm('');
      if (newRef.current) newRef.current.focus();
      return;
    }

    // La nueva contraseña no puede ser igual a la actual
    if (newPassword === currentPassword) {
      setError('La nueva contraseña no puede ser igual a la contraseña actual');
      // limpiar nuevos campos y enfocar el campo de nueva contraseña
      setNewPassword('');
      setConfirm('');
      if (newRef.current) newRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        userId: user.id,
      });
      setSuccess('Contraseña cambiada correctamente.');
      // Mantener la sesión y volver al landing (home) después de 2 segundos
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // limpiar campos y navegar a la landing
        setCurrentPassword('');
        setNewPassword('');
        setConfirm('');
        navigate('/');
      }, 900);
    } catch (err) {
      // Detectar error específico de contraseña actual inválida y mostrar mensaje claro
      const apiErr = err?.response?.data?.error;
      if (err?.response?.status === 401 && apiErr?.code === 'INVALID_CREDENTIALS') {
        setError('La contraseña actual es incorrecta');
        // limpiar y enfocar el campo de contraseña actual
        setCurrentPassword('');
        if (currentRef.current) currentRef.current.focus();
      } else if (apiErr?.message) {
        setError(apiErr.message);
      } else {
        setError(err?.response?.data?.message || err.message || 'Error al cambiar contraseña');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hero perfil">
      <div className="perfil-panel">
        <h2 className="perfil-title">Cambiar contraseña</h2>

        <form className="perfil-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="current">Contraseña actual</label>
            <input
              id="current"
              type="password"
              ref={currentRef}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="field">
            <label htmlFor="new">Nueva contraseña</label>
            <input
              id="new"
              type="password"
              ref={newRef}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirmar nueva contraseña</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Cambiando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
