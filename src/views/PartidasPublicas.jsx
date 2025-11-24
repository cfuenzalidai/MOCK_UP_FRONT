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
  const [_joining, setJoining] = useState(null);
  const { user } = useAuth();

 useEffect(() => {
     let mounted = true;
     async function fetchPartidas() {
       try {
         // usa el axios instance que añade Authorization desde localStorage
          const res = await api.get('/partidas');
          const data = res?.data;
          const rowsNormalized = Array.isArray(data)
            ? data.map((p) => ({ ...p, id: p.id ?? p._id ?? p.partidaId ?? null }))
            : [];
          if (mounted) setRows(rowsNormalized);
        } catch (error) {
          console.error('Error fetching partidas', error);
          if (mounted) setRows([]);
        }
     }
     fetchPartidas();
     return () => (mounted = false);
   }, [user]);
 
   function join(id) {
  // POST /partidas/:id/unirse
  return (async () => {
    const targetId = (typeof id === 'object') ? (id.id ?? id._id ?? id.partidaId) : id;
    if (!targetId) {
      console.error('join() llamado sin id válido:', id);
      alert('Identificador de partida inválido. Revisa la consola.');
      return;
    }

    setJoining(targetId);
    console.debug('Intentando unirse a partida id=', targetId);

    // helper para refrescar lista y normalizar ids
    async function refreshRows() {
      const res = await api.get('/partidas');
      const data = res?.data;
      const rowsNormalized = Array.isArray(data)
        ? data.map((p) => ({ ...p, id: p.id ?? p._id ?? p.partidaId ?? null }))
        : [];
      setRows(rowsNormalized);
    }

    try {
      await api.post(`/partidas/${targetId}/unirse`);
      await refreshRows();
      return;
    } catch (err) {
      // extraer info útil del error
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const remoteMessage =
        respData?.error?.message || respData?.message || (typeof respData === 'string' ? respData : null) || '';

      console.error('Error al unirse a partida', { status, remoteMessage, err, respData });

      // Casos específicos
      if (status === 404) {
        alert('Partida no encontrada (404). Revisa la consola para más detalles.');
        return;
      }

      // Si el backend usa 409 para "ya en la partida"
      if (status === 409 || /ALREADY|already|YA|ya estás|ya estas|YA_ESTAS/i.test(remoteMessage)) {
        alert('Ya estás en esta partida.');
        return;
      }

      // Fallback: si el mensaje remoto contiene texto indicando duplicado/usado
      if (/already in|already joined|ya estás|ya pertenece|ya existe/i.test(remoteMessage)) {
        alert('Ya estás en esta partida.');
        return;
      }

      // Si no lo detectamos, mostrar mensaje genérico
      alert('No se pudo unir a la partida. Revisa la consola para más detalles.');
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