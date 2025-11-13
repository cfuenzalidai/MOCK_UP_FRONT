import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../assets/styles/partidas-publicas.css'; 

function StatusPill({ full, onClick }) {
  const cls = full ? 'pill danger' : 'pill success';
  const text = full ? 'Llena' : 'Unirse';
  return (
    <button className={cls} disabled={full} onClick={onClick}>
      {text}
    </button>
  );
}

export default function PartidasPublicas() {
  const [rows, setRows] = useState([]);
  const [joining, setJoining] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function fetchPartidas() {
      try {
        // usa el axios instance que añade Authorization desde localStorage
        const res = await api.get('/partidas');
        const data = res?.data;
        if (mounted) setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error fetching partidas', e);
        if (mounted) setRows([]);
      }
    }
    fetchPartidas();
    return () => (mounted = false);
  }, [user]);

  function join(id) {
    // POST /partidas/:id/unirse - usa `api` para que incluya el JWT automáticamente
    return (async () => {
      try {
        setJoining(id);
        await api.post(`/partidas/${id}/unirse`);
        // refrescar lista
        const res = await api.get('/partidas');
        setRows(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error('Error al unirse a partida', err);
        alert('No se pudo unir a la partida. Revisa la consola.');
      } finally {
        setJoining(null);
      }
    })();
  }

  return (
    <section className="hero hero--center">
      <div className="panel board">
        <h1 className="board-title">Partidas</h1>
        <ul className="board-list">
          {rows.map((p) => {
            const full = p.jugadores >= p.max;
            return (
              <li key={p.id} className="board-row">
                <span className="name">{p.nombre}</span>
                <span className="count">{p.jugadores}/{p.max}</span>
                <StatusPill full={full} onClick={() => join(p.id)} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}