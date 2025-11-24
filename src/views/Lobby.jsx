import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../assets/styles/lobby.css';

export default function Lobby() {
  const { partidaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partida, setPartida] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [casasMap, setCasasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      const wasInitial = initialLoadRef.current;
      if (wasInitial) setLoading(true);
      try {
        const [pRes, jRes] = await Promise.all([
          api.get(`/partidas/${partidaId}`),
          api.get(`/partidas/${partidaId}/jugadores`),
        ]);
        if (!mounted) return;
        const partidaData = pRes?.data || null;
        const jugadoresData = (jRes?.data?.jugadores || []).map((j) => ({ ...j, id: j.id || j._id }));
        // Debug: mostrar shapes en consola
        console.debug('[Lobby] fetchAll partida:', partidaData);
        console.debug('[Lobby] fetchAll jugadores:', jugadoresData);
        setPartida(partidaData);
        setJugadores(jugadoresData);
        setError(null);
      } catch (err) {
        console.error('Error fetching lobby data', err);
        if (!mounted) return;
        setError('No se pudo cargar la información de la partida.');
      } finally {
        if (wasInitial && mounted) setLoading(false);
        initialLoadRef.current = false;
      }
    }

    fetchAll();

    // polling cada 2.5s para actualizar la lista de jugadores
    pollingRef.current = setInterval(() => {
      fetchAll();
    }, 2500);

    return () => {
      mounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [partidaId]);

  // Cargar nombres de casas una sola vez (para mostrar nombres en vez de IDs)
  useEffect(() => {
    let mounted = true;
    async function loadCasas() {
      try {
        const res = await api.get('/casas');
        if (!mounted) return;
        const arr = res?.data?.casas || res?.data || [];
        const map = {};
        for (const c of arr) {
          if (c && (c.id !== undefined)) map[String(c.id)] = c.nombre || c.name || String(c.id);
        }
        console.debug('[Lobby] loaded casas:', arr, 'map:', map);
        setCasasMap(map);
      } catch (e) {
        console.debug('[Lobby] no se pudieron cargar casas', e);
      }
    }
    loadCasas();
    return () => (mounted = false);
  }, []);

  function isOwner() {
    return user && partida && Number(user.id) === Number(partida.ownerId || partida.owner?.id);
  }

  async function expulsar(jugador) {
    if (!jugador || !jugador.id) return;
    if (!confirm(`¿Expulsar a ${jugador.Usuario?.nombre || jugador.usuario?.nombre || 'este jugador'}?`)) return;
    try {
      await api.delete(`/jugadoresenpartidas/${jugador.id}`);
      // refrescar
      const jRes = await api.get(`/partidas/${partidaId}/jugadores`);
      setJugadores(jRes?.data?.jugadores || []);
    } catch (err) {
      console.error('No se pudo expulsar jugador', err);
      alert('No se pudo expulsar al jugador. Revisa la consola.');
    }
  }

  async function startGame() {
    if (!partida) return;
    // Solo el owner puede iniciar
    if (!isOwner()) {
      alert('Solo el propietario puede iniciar la partida.');
      return;
    }
    // Validar que el lobby esté lleno (según tamMax)
    const max = Number(partida.tamMax || partida.max || 0);
    if (Number(jugadores.length) < max) {
      alert('El lobby no está lleno aún. No puedes iniciar la partida hasta que se llene.');
      return;
    }

    try {
      await api.put(`/partidas/${partidaId}`, { estado: 'en_curso', iniciadoEn: new Date().toISOString() });
      // navegar a la vista de partida
      navigate(`/partidas/${partidaId}`);
    } catch (err) {
      console.error('Error iniciando la partida', err);
      alert('No se pudo iniciar la partida. Revisa la consola.');
    }
  }

  if (loading) {
    console.debug('[Lobby] estado: loading');
    return null;
  }
  if (error) {
    console.debug('[Lobby] estado: error', error);
    return null;
  }
  if (!partida) {
    console.debug('[Lobby] estado: partida no encontrada');
    return null;
  }

  const maxPlayers = Number(partida.tamMax || partida.max || 0);
  const owner = partida.owner || { id: partida.ownerId };

  return (
    <section className="hero hero--center">
      <div className="panel lobby-panel">
        <h2 className="lobby-title">Lobby: {partida.nombre || `#${partidaId}`}</h2>
        <div className="lobby-meta">Propietario: {owner?.nombre || owner?.email || owner?.id}</div>
        <div className="lobby-count">Jugadores: {jugadores.length}/{maxPlayers}</div>

        <ul className="lobby-list">
          {jugadores.map((j) => {
            const nombre = j.Usuario?.nombre || j.usuario?.nombre || ('Jugador ' + j.id);
            const isOwnerPlayer = Number(j.usuarioId || j.Usuario?.id || j.usuario?.id) === Number(owner?.id);
            // Obtener nombre de la casa: preferir relación incluida, luego objeto, luego mapa cargado, luego raw
            const casaNombre = j.Casa?.nombre || j.casa?.nombre || casasMap[String(j.casa)] || (j.casa ?? '-');
            return (
              <li key={j.id} className="lobby-row">
                <span className="lobby-player-name">{nombre}</span>
                <span className="lobby-player-meta">Casa: {casaNombre}</span>
                <div className="lobby-actions">
                  {isOwner() && !isOwnerPlayer && (
                    <button className="btn danger small" onClick={() => expulsar(j)}>Expulsar</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="lobby-controls">
          <button className="btn ghost" onClick={() => navigate('/partidas-publicas')}>Volver</button>
          <button
            className="btn primary"
            onClick={startGame}
            disabled={!isOwner() || jugadores.length < maxPlayers}
            title={(!isOwner() ? 'Solo el propietario puede iniciar la partida' : jugadores.length < maxPlayers ? 'El lobby no está lleno' : 'Iniciar partida')}
          >
            Iniciar partida
          </button>
        </div>
      </div>
    </section>
  );
}
