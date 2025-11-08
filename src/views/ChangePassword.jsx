import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/auth';

export default function ChangePassword(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function onSubmit(e){
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if(newPassword !== confirm){ setError('La nueva contraseña y la confirmación no coinciden'); return; }
    setLoading(true);
    try{
      // Llamamos a un endpoint backend que debe existir: POST /usuarios/:id/password
      await authService.changePassword({ currentPassword, newPassword, userId: user.id });
      setSuccess('Contraseña cambiada correctamente. Inicia sesión de nuevo.');
      // Forzar logout para obligar a re-login
      setTimeout(()=>{
        logout();
        navigate('/login');
      }, 1200);
    }catch(err){
      setError(err?.response?.data?.error?.message || err.message || 'Error al cambiar contraseña');
    }finally{ setLoading(false); }
  }

  if(!user) return <div style={{ padding:24 }}>Debes iniciar sesión para cambiar la contraseña.</div>;

  return (
    <div style={{ padding:24, maxWidth:600 }}>
      <h2>Cambiar contraseña</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom:12 }}>
          <label htmlFor="current">Contraseña actual</label><br />
          <input id="current" type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
        </div>

        <div style={{ marginBottom:12 }}>
          <label htmlFor="new">Nueva contraseña</label><br />
          <input id="new" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
        </div>

        <div style={{ marginBottom:12 }}>
          <label htmlFor="confirm">Confirmar nueva contraseña</label><br />
          <input id="confirm" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
        </div>

        {error && <div style={{ color:'red', marginBottom:12 }}>{error}</div>}
        {success && <div style={{ color:'green', marginBottom:12 }}>{success}</div>}

        <button type="submit" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</button>
      </form>
    </div>
  );
}

// AVISO: este componente asume que el backend ofrece una ruta para cambiar contraseña
// ejemplo: POST /usuarios/:id/password que valide currentPassword y guarde hashed password.
// Si el backend no tiene este endpoint, hay que implementarlo en `Frontenders_back_252s2`.
