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
  const [ownerLabel, setOwnerLabel] = useState(null);
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
        console.info('[Lobby] fetchAll partida:', partidaData);
        console.info('[Lobby] fetchAll jugadores:', jugadoresData);
        setPartida(partidaData);
         // Resolver label del owner de forma robusta: si no viene el nombre, intentar obtenerlo por ownerId
         (async () => {
           try {
             const ownerObj = partidaData?.owner;
             const ownerId = partidaData?.ownerId || (ownerObj && (ownerObj.id || ownerObj._id)) || ownerObj;
             if (!ownerId) {
               // si el objeto owner ya tiene nombre mostrarlo, si no, fallback
               const label = ownerObj?.nombre || ownerObj?.name || ownerObj?.email || ownerObj || null;
               setOwnerLabel(label);
               return;
             }
 
             // Si ownerObj es un objeto con nombre ya, úsalo
             if (ownerObj && (ownerObj.nombre || ownerObj.name || ownerObj.email)) {
               setOwnerLabel(ownerObj.nombre || ownerObj.name || ownerObj.email);
               return;
             }
 
             // Intentar consultar el usuario por id para obtener nombre legible
             try {
               const ures = await api.get(`/usuarios/${ownerId}`);
               const udata = ures?.data;
               const label = udata?.nombre || udata?.name || udata?.email || String(ownerId);
               setOwnerLabel(label);
             } catch {
               // fallback: usar ownerId o ownerObj tal cual
               setOwnerLabel(String(ownerId));
             }
           } catch {
            setOwnerLabel(null);
           }
         })();
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
        console.info('[Lobby] loaded casas:', arr, 'map:', map);
        setCasasMap(map);
      } catch (e) {
        console.info('[Lobby] no se pudieron cargar casas', e);
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

  async function toggleListo(jugador) {
    if (!jugador || !jugador.id) return;
    // solo el propio usuario puede cambiar su estado "listo"
    const miUsuarioId = user?.id;
    const jugadorUsuarioId = jugador.usuarioId || jugador.Usuario?.id || jugador.usuario?.id;
    if (String(miUsuarioId) !== String(jugadorUsuarioId)) {
      alert('Solo puedes cambiar tu propio estado.');
      return;
    }

    try {
      const nuevo = !jugador.listo;
      const res = await api.put(`/jugadoresenpartidas/${jugador.id}`, { listo: nuevo });
      // actualizar estado localmente para evitar esperar al siguiente polling
      // la API a veces devuelve solo el registro de JugadorEnPartida sin la relación Usuario;
      // se conserva la relación `Usuario` y otros campos locales si faltan en la respuesta.
      setJugadores((prev) => prev.map((p) => {
        if (String(p.id) !== String(jugador.id)) return p;
        const returned = res.data || {};
        return {
          ...p,
          ...returned,
          // preservar la relación Usuario si la respuesta no la incluye
          Usuario: returned.Usuario || p.Usuario,
        };
      }));
    } catch (err) {
      console.error('No se pudo actualizar estado listo', err);
      alert('No se pudo actualizar tu estado. Revisa la consola.');
    }
  }

  async function startGame() {
    if (!partida) return;
    if (!isOwner()) {
      alert('Solo el propietario puede iniciar la partida.');
      return;
    }

    const max = Number(partida.tamMax || partida.max || 0);
    if (Number(jugadores.length) < max) {
      alert('El lobby no está lleno aún. No puedes iniciar la partida hasta que se llene.');
      return;
    }

    try {
      setLoading(true); // crea/setea estado loading si no existe
      // Llamada al endpoint (usa el helper o api.put directamente)
      // await juego.cambiarEstadoPartida(partidaId);
      await api.put(`/partidas/${partidaId}/iniciar`);

      // éxito -> ir al tablero
      navigate(`/partidas/${partidaId}`);
    } catch (err) {
      console.error('Error iniciando la partida', err);
      const status = err?.response?.status;
      const code = err?.response?.data?.error?.code;
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message;

      // Si ya fue iniciada por otro, navegar también al tablero
      if (status === 409 || code === 'ALREADY_STARTED') {
        alert('La partida ya fue iniciada. Redirigiendo al tablero.');
        navigate(`/partidas/${partidaId}`);
        return;
      }

      // mostrar mensaje del servidor si existe
      alert(msg || 'No se pudo iniciar la partida. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    console.info('[Lobby] estado: loading');
    return null;
  }
  if (error) {
    console.info('[Lobby] estado: error', error);
    return null;
  }
  if (!partida) {
    console.info('[Lobby] estado: partida no encontrada');
    return null;
  }

  const maxPlayers = Number(partida.tamMax || partida.max || 0);
  const owner = partida.owner || { id: partida.ownerId };

  return (
    <section className="hero hero--center">
      <div className="panel lobby-panel">
        <h2 className="lobby-title">Lobby: {partida.nombre || `#${partidaId}`}</h2>
        <div className="lobby-meta">Propietario: {ownerLabel ?? owner?.nombre ?? owner?.email ?? owner?.id}</div>
        <div className="lobby-count">Jugadores: {jugadores.length}/{maxPlayers}</div>

        <ul className="lobby-list">
          {jugadores.map((j) => {
            const nombre = j.Usuario?.nombre || j.usuario?.nombre || (`Jugador ${  j.id}`);
            const isOwnerPlayer = Number(j.usuarioId || j.Usuario?.id || j.usuario?.id) === Number(owner?.id);
            // Obtener nombre de la casa: preferir relación incluida, luego objeto, luego mapa cargado, luego raw
            const casaNombre = j.Casa?.nombre || j.casa?.nombre || casasMap[String(j.casa)] || (j.casa ?? '-');
            return (
              <li key={j.id} className='lobby-row'>
                  <span className='lobby-player-name'>{nombre}</span>
                  <span className='lobby-player-meta'>Casa: {casaNombre}</span>
                <div className="lobby-actions">
                  {isOwner() && !isOwnerPlayer && (
                    <button className="btn danger small" onClick={() => expulsar(j)}>Expulsar</button>
                  )}
                  {/* Botón 'Listo' - solo el propio usuario puede presionarlo */}
                  {String(user?.id) === String(j.usuarioId || j.Usuario?.id || j.usuario?.id) ? (
                    <button
                      className={`btn small ${j.listo ? 'ready' : 'not-ready'}`}
                      onClick={() => toggleListo(j)}
                      title={j.listo ? 'Marcar como no listo' : 'Marcar como listo'}
                    >
                      {j.listo ? 'Listo' : 'Listo'}
                    </button>
                  ) : (
                    // mostrar el estado visualmente para otros (sin permitir interacción)
                    <button className={`btn small ${j.listo ? 'ready' : 'not-ready'}`} disabled>
                      {j.listo ? 'Listo' : 'Listo'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="lobby-controls">
          <button className="btn ghost" onClick={() => navigate('/partidas-publicas')}>Volver</button>
          {isOwner() ? (
            // Si la partida ya está en curso, el owner debe poder ingresar (misma acción que para otros)
            partida && partida.estado === 'en_curso' ? (
              <button
                className="btn primary"
                onClick={() => navigate(`/partidas/${partidaId}`)}
                title="Ingresar a la partida"
              >
                Ingresar
              </button>
            ) : (
              <button
                className="btn primary"
                onClick={startGame}
                disabled={jugadores.length < maxPlayers || loading}
                title={jugadores.length < maxPlayers ? 'El lobby no está lleno' : 'Iniciar partida'}
              >
                Iniciar partida
              </button>
            )
          ) : (
            <button
              className="btn primary"
              onClick={() => {
                // previene ingresar si la partida no ha comenzado
                if (!partida || partida.estado !== 'en_curso') {
                  alert('El propietario aún no inició la partida. Espera a que el owner la inicie.');
                  return;
                }
                navigate(`/partidas/${partidaId}`);
              }}
              disabled={!partida || partida.estado !== 'en_curso'}
              title={(!partida || partida.estado !== 'en_curso') ? 'Esperando a que el propietario inicie la partida' : 'Ingresar a la partida'}
            >
              Ingresar
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
