import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function EditProfile(){
  const { user, updateMe } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e){
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      await updateMe({ nombre, email });
      navigate('/');
    }catch(err){
      setError(err?.response?.data?.error?.message || err.message || 'Error al actualizar');
    }finally{ setLoading(false); }
  }

  if(!user) return <div style={{ padding:24 }}>Debes iniciar sesión para editar tu perfil.</div>;

  return (
    <div style={{ padding:24, maxWidth:600 }}>
      <h2>Editar usuario</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom:12 }}>
          <label htmlFor="nombre">Nombre</label><br />
          <input id="nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required />
        </div>
        <div style={{ marginBottom:12 }}>
          <label htmlFor="email">Email</label><br />
          <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>

        {error && <div style={{ color:'red', marginBottom:12 }}>{error}</div>}

        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</button>
      </form>
    </div>
  );
}

// Nota: el backend debe exponer PUT /usuarios/:id que actualice nombre/email. Ya existe en el API.
