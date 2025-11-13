import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/perfil.css';

export default function EditProfile() {
  const { user, updateMe } = useAuth();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return (
      <section className="hero perfil">
        <div className="perfil-panel">
          <h2 className="perfil-title">Editar usuario</h2>
          <p className="perfil-msg">Debes iniciar sesión para editar tu perfil.</p>
        </div>
      </section>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await updateMe({ nombre, email });
      navigate('/nosotros'); // o '/' si prefieres
    } catch (err) {
      setError(err?.response?.data?.error?.message || err.message || 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hero perfil">
      <div className="perfil-panel">
        <h2 className="perfil-title">Editar usuario</h2>

        <form className="perfil-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// Nota: el backend debe exponer PUT /usuarios/:id que actualice nombre/email. Ya existe en el API.
