import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/crear.css';

export default function CreatePartida() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [tamano, setTamano] = useState(6);                 // 3–6
  const [permiteEspectadores, setPermiteEspectadores] = useState(true);
  const [visibilidad, setVisibilidad] = useState('publica'); // 'publica' | 'privada'
  const [clave, setClave] = useState('');                    // (desactivada por ahora)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return (
      <section className="hero crear">
        <div className="crear-panel">
          <h2 className="crear-title">Crear partida</h2>
          <p className="crear-msg">Debes iniciar sesión para crear una partida.</p>
        </div>
      </section>
    );
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const body = {
        nombre: nombre.trim(),
        ownerId: user.id,
        tamMin: 3,
        tamMax: Number(tamano),
        visibilidad,
        permiteEspectadores: Boolean(permiteEspectadores),
        // clavePrivadaHash: (visibilidad === 'privada' && clave) ? hash(clave) : undefined
      };

      const url = `${import.meta.env.VITE_API_URL}/partidas`;
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(token ? {} : { credentials: 'include' }),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = await res.json(); // devuelve { partida: { id, ... }, ... }
      console.debug('CreatePartida response:', data);
      const id = data?.partida?.id ?? data?.id ?? data?.partidaId ?? data?.partida?.partidaId ?? null;
      if (id) {
        navigate(`/partidas/${id}/lobby`);
      } else {
        console.error('No id found in create partida response', data);
        navigate('/partidas'); // fallback a listado
      }
    } catch (err) {
      setError(err.message || 'Error al crear la partida');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="hero crear">
      <div className="crear-panel">
        <h2 className="crear-title">Crear partida</h2>

        <form className="crear-form" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="nombre">Nombre de la partida</label>
            <input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Conquista Galáctica #1"
            />
          </div>

          <div className="field">
            <label htmlFor="tamano">Tamaño (3-6 jugadores)</label>
            <input
              id="tamano"
              type="number"
              min={3}
              max={6}
              value={tamano}
              onChange={(e) => setTamano(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Permitir espectadores</label>
            <div className="switch-row">
              <input
                id="espectadores"
                type="checkbox"
                checked={permiteEspectadores}
                onChange={(e) => setPermiteEspectadores(e.target.checked)}
              />
              <label htmlFor="espectadores" className="switch-label">
                {permiteEspectadores ? 'Sí' : 'No'}
              </label>
            </div>
          </div>

          <div className="field">
            <label>Visibilidad</label>
            <div className="radio-row">
              <label className="radio">
                <input
                  type="radio"
                  name="vis"
                  value="publica"
                  checked={visibilidad === 'publica'}
                  onChange={() => setVisibilidad('publica')}
                />
                Pública
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="vis"
                  value="privada"
                  checked={visibilidad === 'privada'}
                  onChange={() => setVisibilidad('privada')}
                />
                Privada
              </label>
            </div>
          </div>

          {/* Contraseña (lo dejamos inhabilitado hasta implementar hash) */}
          <div className="field disabled">
            <label htmlFor="clave">Contraseña para unirse (solo partidas privadas)</label>
            <input
              id="clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Próximamente"
              disabled
            />
            <small className="hint">Se habilitará cuando implementemos clavePrivadaHash en el backend.</small>
          </div>

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => navigate(-1)}>
              Cancelar
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Creando…' : 'Crear partida'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
