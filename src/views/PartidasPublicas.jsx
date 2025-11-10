import { useEffect, useState } from 'react';

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

  useEffect(() => {
    const url = `${import.meta.env.VITE_API_URL}/partidas`; // ajusta si tu endpoint difiere
    (async () => {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        /* Normaliza a: { id, nombre, jugadores, max } */
        const list = (Array.isArray(data) ? data : data?.items || []).map((p, i) => ({
          id: p.id ?? i + 1,
          nombre: p.nombre ?? `Partida ${p.id ?? i + 1}`,
          jugadores: p.jugadores ?? p.current ?? 0,
          max: p.max ?? p.capacidad ?? 6,
        }));
        setRows(list);
      } catch {
        // Fallback de mock para diseño
        setRows([
          { id: 24, nombre: 'Partida 24', jugadores: 5, max: 5 },
          { id: 32, nombre: 'Partida 32', jugadores: 6, max: 6 },
          { id: 57, nombre: 'Partida 57', jugadores: 4, max: 6 },
          { id: 12, nombre: 'Partida 12', jugadores: 6, max: 6 },
          { id: 67, nombre: 'Partida 67', jugadores: 2, max: 6 },
          { id: 9,  nombre: 'Partida 9',  jugadores: 4, max: 4 },
        ]);
      }
    })();
  }, []);

  function join(id) {
    // TODO: POST /partidas/:id/unirse
    alert(`Unirse a partida ${id}`);
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
