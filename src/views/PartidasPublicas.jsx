import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../assets/styles/partidas-publicas.css'; 

function StatusPill({ full, isMember, onClick }) {
  if (isMember) {
    return (
      <button className="pill danger" onClick={onClick}>
        Entrar
      </button>
    );
  }
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
  const navigate = useNavigate();
  const [joinedSet, setJoinedSet] = useState(new Set());
  const pollingRef = useRef(null);

 useEffect(() => {
    let mounted = true;

    async function fetchPartidas() {
      try {
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
    pollingRef.current = setInterval(fetchPartidas, 2500);

    return () => { mounted = false; if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [user]);

  // fetch joined partidas for the current user
  useEffect(() => {
    if (!user || !user.id) { setJoinedSet(new Set()); return; }
    let mounted = true;
    async function fetchJoined() {
      try {
        const res = await api.get('/jugadoresenpartidas', { params: { usuarioId: user.id } });
        const data = res?.data;
        if (!Array.isArray(data)) return;
        const partidasIds = new Set(data.map((j) => String(j.partidaId)));
        if (mounted) setJoinedSet(partidasIds);
      } catch (err) { console.error('Error fetching joined partidas', err); }
    }
    fetchJoined();
    const t = setInterval(fetchJoined, 3000);
    return () => { mounted = false; clearInterval(t); };
  }, [user]);
 
  function join(id) {
    return (async () => {
      const targetId = (typeof id === 'object') ? (id.id ?? id._id ?? id.partidaId) : id;
      if (!targetId) { console.error('join() llamado sin id válido:', id); alert('Identificador de partida inválido. Revisa la consola.'); return; }
      setJoining(targetId);

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
        // update joined set
        try {
          const r = await api.get('/jugadoresenpartidas', { params: { usuarioId: user?.id } });
          const d = r?.data || [];
          setJoinedSet(new Set(d.map((j) => String(j.partidaId))));
        } catch (e) { /* non-critical */ }
        navigate(`/partidas/${targetId}/lobby`);
        return;
      } catch (err) {
        const status = err?.response?.status;
        const respData = err?.response?.data;
        const remoteMessage = respData?.error?.message || respData?.message || (typeof respData === 'string' ? respData : null) || '';
        console.error('Error al unirse a partida', { status, remoteMessage, err, respData });

        if (status === 404) { alert('Partida no encontrada (404). Revisa la consola para más detalles.'); return; }
        if (status === 409) {
          const code = respData?.error?.code;
          if (code === 'ALREADY_JOINED' || /ALREADY|already|YA|ya estás|ya estas|YA_ESTAS/i.test(remoteMessage)) {
            navigate(`/partidas/${targetId}/lobby`); return;
          }
          if (code === 'FULL' || /full|llena/i.test(remoteMessage)) { alert('La partida está llena.'); return; }
        }

        if (/already in|already joined|ya estás|ya pertenece|ya existe/i.test(remoteMessage)) { navigate(`/partidas/${targetId}/lobby`); return; }
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
            const pid = p.id != null ? String(p.id) : '';
            const isMember = joinedSet.has(pid);
            return (
              <li key={p.id} className="board-row">
                <span className="name">{p.nombre}</span>
                <span className="count">{p.jugadores}/{p.max}</span>
                <StatusPill
                  full={full}
                  isMember={isMember}
                  onClick={isMember ? () => navigate(`/partidas/${pid}/lobby`) : () => join(p.id)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}