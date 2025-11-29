import Mapa from "./Mapa";
import { useState } from 'react';
import { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../assets/styles/Partida.css";
import img_especia from "../assets/img/especia.png";
import img_metal from "../assets/img/metal.png";
import img_agua from "../assets/img/agua.png";
import img_liebre from "../assets/img/liebre.png";
import nave_b from "../assets/img/nave_b.png";
import nave_i from "../assets/img/nave_i.png";
import nave_a from "../assets/img/nave_a.png";
import baseImg from "../assets/img/base.png";
import api from '../services/api';
import * as juego from '../services/juego';

export default function Partida() {
  const [tirando, setTirando] = useState(false);
  const { user, booting } = useAuth();
  const { partidaId } = useParams();
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [cambiandoTurno, setCambiandoTurno] = useState(false);
  const [puntajes, setPuntajes] = useState([]);
  const [bases, setBases] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [planetas, setPlanetas] = useState([]);
  const [miJugador, setMiJugador] = useState(null);
  const [recursos, setRecursos] = useState({});
  const [partidaFinalizada, setPartidaFinalizada] = useState(false);
  const [ganador, setGanador] = useState(null);
  const [selectedTerritorio, setSelectedTerritorio] = useState(null);


  useEffect(() => {
    if (!partidaId || !user?.id) return;

    async function cargarJugadoresYMiJugador() {
      try {
        const js = await juego.jugadores(partidaId);
        setJugadores(js || []);
        const encontrado = (js || []).find(j =>
          String(j.usuarioId) === String(user.id) || String(j.userId) === String(user.id) || String(j.id) === String(user.id)
        );
        setMiJugador(encontrado || null);
      } catch (err) {
        console.error("Error al cargar mis datos de jugador:", err);
        setJugadores([]);
        setMiJugador(null);
      }
    }

    cargarJugadoresYMiJugador();
  }, [partidaId, user]);


  // Cargar bases asociadas a la partida (para mostrar bases en el mapa)
  useEffect(() => {
    if (!partidaId) return;
    if (booting) return;
    let mounted = true;
    async function cargarBases() {
      try {
        const b = await juego.obtenerBases(partidaId);
        if (mounted) setBases(b || []);
      } catch (err) {
        console.error('Error al cargar bases:', err);
        if (mounted) setBases([]);
      }
    }
    cargarBases();
    return () => (mounted = false);
  }, [partidaId, booting]);


  // Cargar planetas asociados a la partida (para obtener esOrigen por planeta)
  useEffect(() => {
    if (!partidaId) return;
    if (booting) return;
    let mounted = true;
    async function cargarPlanetas() {
      try {
        const p = await juego.obtenerPlanetas(partidaId);
        if (mounted) setPlanetas(p || []);
      } catch (err) {
        console.error('Error al cargar planetas:', err);
        if (mounted) setPlanetas([]);
      }
    }
    cargarPlanetas();
    return () => (mounted = false);
  }, [partidaId, booting]);


  // Cargar recursos del jugador actual (miJugador) para mostrar en el bloque de recursos
  useEffect(() => {
    if (!miJugador) {
      setRecursos({});
      return;
    }
    if (booting) return;
    let mounted = true;
    async function cargarRecursos() {
      try {
        const id = miJugador.jugadorEnPartidaId || miJugador.id || miJugador.userId || miJugador.usuarioId;
        if (!id) {
          if (mounted) setRecursos({});
          return;
        }
        const res = await juego.obtenerRecursos(id);
        if (!mounted) return;
        if (!res) {
          setRecursos({});
          return;
        }
        if (Array.isArray(res)) {
          // fallback: normalizar arreglo
          const map = {};
          res.forEach(item => {
            const nombre = item.Recurso?.nombre || item.recurso?.nombre || item.nombre || String(item.recursoId || item.id || 'recurso');
            const cantidad = typeof item.cantidad === 'number' ? item.cantidad : Number(item.cantidad) || 0;
            map[nombre] = cantidad;
          });
          setRecursos(map);
        } else if (res.map) {
          setRecursos(res.map || {});
        } else if (res.data && Array.isArray(res.data)) {
          const map = {};
          res.data.forEach(item => {
            const nombre = item.Recurso?.nombre || item.recurso?.nombre || item.nombre || String(item.recursoId || item.id || 'recurso');
            const cantidad = typeof item.cantidad === 'number' ? item.cantidad : Number(item.cantidad) || 0;
            map[nombre] = cantidad;
          });
          setRecursos(map);
        } else {
          setRecursos({});
        }
      } catch (err) {
        console.error('Error al cargar recursos del jugador:', err);
        if (mounted) setRecursos({});
      }
    }
    cargarRecursos();
    return () => (mounted = false);
  }, [miJugador, booting]);


  // Función reutilizable para cargar puntajes (se usa desde efectos y tras cambios de turno)
  async function cargarPuntajes() {
    try {
      const data = await juego.obtenerPuntajes(partidaId);
      setPuntajes(data);
    } catch (err) {
      console.error("Error al cargar puntajes:", err);
    }
  }

  // Cargar puntajes cuando tengamos partidaId y bootstrap de auth finalizado
  useEffect(() => {
    if (!partidaId) return;
    if (booting) return; // esperar a que AuthContext termine
    cargarPuntajes();
  }, [partidaId, booting]);

  // Cargar turno activo cuando tengamos partidaId y auth listo
  useEffect(() => {
    if (!partidaId) return;
    if (booting) return;
    let mounted = true;
    async function cargarTurno() {
      try {
        const turno = await juego.obtenerTurnoActivo(partidaId);
        if (mounted) setTurnoActivo(turno);
      } catch (err) {
        console.error('Error al obtener turno activo:', err);
        if (mounted) setTurnoActivo(null);
      }
    }
    cargarTurno();
    return () => (mounted = false);
  }, [partidaId, booting]);

  // Comparación robusta contra distintos shapes que pueda devolver el backend
  const esMiTurno = (() => {
    if (!miJugador) return false;
    if (!turnoActivo) return false;

    const turnoJugadorId = turnoActivo.jugadorEnPartidaId || turnoActivo.jugadorId;

    return String(miJugador.id) === String(turnoJugadorId);
  })();

  // Contar cuántas bases pertenecen al jugador actual (miJugador)
  const miBaseCount = (() => {
    if (!miJugador || !Array.isArray(bases)) return 0;
    const candidateIds = [miJugador.id, miJugador.userId, miJugador.usuarioId, miJugador.jugadorEnPartidaId].filter(Boolean).map(String);
    return bases.filter(b => {
      const bvals = [b.jugadorId, b.userId, b.usuarioId, b.jugadorEnPartidaId, b.ownerId].filter(Boolean);
      return bvals.some(v => candidateIds.includes(String(v)));
    }).length;
  })();










  async function lanzarDado() {
    if (!partidaId) {
      alert('No se pudo determinar la partida. Asegúrate de abrir la partida desde su URL.');
      return;
    }

    try {
      setTirando(true);

      // Obtener turno activo para la partida
      const turno = await juego.obtenerTurnoActivo(partidaId);

      if (!turno) {
        alert('No se encontró un turno activo para esta partida.');
        return;
      }

      const turnoJugadorId =
        turno.jugadorId ||
        (turno.jugador && (turno.jugador.id || turno.jugador)) ||
        turno.userId;

      if (user && turnoJugadorId && String(user.id) !== String(turnoJugadorId)) {
        alert('No es tu turno. Solo puedes tirar cuando sea tu turno activo.');
        return;
      }

      const turnoId = turno.id || turno._id;
      if (!turnoId) {
        alert('Respuesta del servidor inválida: turno sin identificador. Revisa la consola.');
        console.error('Turno inválido:', turno);
        return;
      }

      // Usar el service de juego para lanzar dado
      const res = await juego.lanzarDadoService(turnoId);
      const turnoNuevo = await juego.obtenerTurnoActivo(partidaId);
      setTurnoActivo(turnoNuevo);

      const resultado = res?.data ?? res;
      console.log('Resultado lanzar dado:', resultado);
      if (resultado && resultado.error && resultado.error.message) {
        alert(resultado.error.message);
      } else {
        alert('Resultado: ' + JSON.stringify(resultado));
      }
      // Refrescar recursos del jugador actual después del lanzamiento
      try {
        const jugadorIdForRecursos = miJugador?.jugadorEnPartidaId || miJugador?.id || miJugador?.userId || miJugador?.usuarioId;
        const extractDiceValue = r => {
          if (r == null) return null;
          if (typeof r === 'number') return r;
          if (Array.isArray(r) && r.length > 0) return extractDiceValue(r[0]);
          const candidates = ['valor', 'value', 'dado', 'resultado', 'roll', 'result', 'dice'];
          for (const k of candidates) {
            const v = r[k];
            if (typeof v === 'number') return v;
            if (typeof v === 'string' && !Number.isNaN(Number(v))) return Number(v);
          }
          for (const k of Object.keys(r)) {
            const v = r[k];
            if (typeof v === 'number') return v;
            if (typeof v === 'string' && !Number.isNaN(Number(v))) return Number(v);
          }
          return null;
        };

        const diceValue = extractDiceValue(resultado) || 0;
        if (jugadorIdForRecursos) {
          // try to get base recoleccion (per-1) from backend or compute locally using bases/planetas
          const perOne = await juego.recoleccion(partidaId, jugadorIdForRecursos, { bases, planetas });

          // perOne is a map like { Especia: 1, Metal: 1 }
          if (perOne && Object.keys(perOne).length > 0 && diceValue > 0) {
            const increments = {};
            Object.keys(perOne).forEach(k => {
              const per = typeof perOne[k] === 'number' ? perOne[k] : Number(perOne[k]) || 0;
              if (per > 0) increments[k] = per * diceValue;
            });

            // Apply increments to local state (merge) using only recoleccion (no obtenerRecursos)
            const newMap = { ...recursos };
            Object.keys(increments).forEach(name => {
              const current = newMap[name] ?? newMap[name.toLowerCase()] ?? 0;
              newMap[name] = (Number(current) || 0) + increments[name];
            });
            setRecursos(newMap);

            // Notify player which resources were gained
            const parts = Object.keys(increments).map(k => `${k}: +${increments[k]}`);
            if (parts.length > 0) alert('Recolección: ' + parts.join(', '));
          }
        }
      } catch (e) {
        console.error('Error al procesar recolección tras tirar dado', e);
      }
    } catch (err) {
      console.error('Error al lanzar dado', err);
      const remoteMessage = err?.response?.data?.error?.message || err?.response?.data?.message;
      if (remoteMessage) {
        alert(remoteMessage);
      } else {
        alert('No se pudo lanzar el dado. Revisa la consola.');
      }
    } finally {
      setTirando(false);
    }
  }

  async function terminarTurno() {
    if (!partidaId) {
      alert('No se pudo determinar la partida.');
      return;
    }
    try {
      setCambiandoTurno(true);
      const res = await juego.cambiarTurno(partidaId);
      const turnoNuevo = await juego.obtenerTurnoActivo(partidaId);
      setTurnoActivo(turnoNuevo);

      console.log('Cambiar turno result:', res);
      // Verificar puntajeCache de jugadores para detectar ganador
      try {
        const js = await juego.jugadores(partidaId);
        // Buscar jugador con puntajeCache === 5
        const winner = (Array.isArray(js) ? js : []).find(j => {
          let val;
          if (typeof j.puntajeCache !== 'undefined' && j.puntajeCache !== null) val = j.puntajeCache;
          else if (typeof j.puntaje_cache !== 'undefined' && j.puntaje_cache !== null) val = j.puntaje_cache;
          else if (typeof j.puntaje !== 'undefined' && j.puntaje !== null) val = j.puntaje;
          else val = undefined;
          return Number(val) === 5;
        });
        if (winner) {
          const nombre = winner.nombre || winner.name || winner.usuario || winner.username || `Jugador ${winner.id || winner.userId || ''}`;
          setPartidaFinalizada(true);
          setGanador(nombre);
          alert(`Partida finalizada. Ganador: ${nombre}`);
          // redirigir al inicio después de 2s
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return; // no seguir con el flujo normal
        }

        alert('Turno cambiado');
      } catch (e) {
        console.error('Error al verificar ganador tras cambiar turno', e);
        alert('Turno cambiado');
      }
    } catch (err) {
      console.error('Error al cambiar turno', err);
      const remoteMessage = err?.response?.data?.message || err?.message;
      alert(remoteMessage || 'No se pudo cambiar el turno. Revisa la consola.');
    } finally {
      setCambiandoTurno(false);
      // refrescar puntajes tras cambio de turno
      try { await cargarPuntajes(); } catch (e) { /* ya logueado por la función */ }
    }
  }

  async function construirBase() {
    if (!partidaId) {
      alert('No se pudo determinar la partida.');
      return;
    }
    const planetaId = selectedTerritorio;
    if (!planetaId) {
      alert('Selecciona un territorio donde construir la base.');
      return;
    }
    const jugadorIdForRecursos = miJugador?.jugadorEnPartidaId || miJugador?.id || miJugador?.userId || miJugador?.usuarioId;
    if (!jugadorIdForRecursos) {
      alert('No se pudo determinar el jugador.');
      return;
    }

    try {
      const res = await juego.construirBase(partidaId, jugadorIdForRecursos, planetaId);
      // res may be null if endpoint missing; treat non-error as success if server responds
      alert('Base construida correctamente');
      // Refresh bases and planetas to reflect new base
      try {
        const b = await juego.obtenerBases(partidaId);
        setBases(b || []);
      } catch (e) { console.warn('No se pudieron refrescar las bases', e); }
      try {
        const p = await juego.obtenerPlanetas(partidaId);
        setPlanetas(p || []);
      } catch (e) { console.warn('No se pudieron refrescar los planetas', e); }
      // clear selection
      setSelectedTerritorio(null);
    } catch (err) {
      console.error('Error al construir base', err);
      const remoteMessage = err?.response?.data?.message || err?.message;
      alert(remoteMessage || 'No se pudo construir la base. Revisa la consola.');
    }
  }

  return (
    <div className="partida-container">
      {partidaFinalizada && ganador && (
        <div className="final-banner" style={{padding: '12px', background: '#fde68a', textAlign: 'center', width: '100%'}}>
          <strong>Partida finalizada.</strong> Ganador: {ganador}
        </div>
      )}
  {/* Panel izquierdo */}
      <div className="panel-izquierdo">
        <h3>Naves:</h3>
        <div className="control">
        <img src={nave_b} alt="Nave Basica" width={28} height={28} />
        <span>Naves B: 2</span>
        </div>
        <div className="control">
        <img src={nave_i} alt="Nave Intermedia" width={28} height={28} />
        <span>Naves I: 2</span>
        </div>
        <div className="control">
            <img src={nave_a} alt="Nave Avanzada" width={28} height={28} />
            <span>Naves A: 1</span>
        </div>
        <h3>Bases</h3>
        <div className="control">
          <img src={baseImg} alt="Base" width={28} height={28} />
          <span>Bases: {miBaseCount}</span>
        </div>
        {/* debug button removed */}
  <h3>Acciones</h3>
  <button className="accion-btn">Construir Nave</button>
  <button className="accion-btn">Mejorar Nave</button>
  <button className="accion-btn">Usar Nave</button>
  <button
    className="accion-btn"
    onClick={construirBase}
    disabled={
      partidaFinalizada || !selectedTerritorio || !esMiTurno ||
      bases.some(b => String(b.planetaId) === String(selectedTerritorio) || String(b.planetaId) === `T${selectedTerritorio}`)
    }
  >
    Construir Base
  </button>
  <button className="accion-btn">Origen</button>
      </div>

      {/* Tablero central */}
      <div className="tablero">
        <Mapa bases={bases} jugadores={jugadores} planetas={planetas} mapaId={partidaId} onSelect={setSelectedTerritorio} selectedId={selectedTerritorio} />

        {/* Recursos debajo del tablero */}
        <div className="recursos">
            <div className="recurso">
                <img src={img_especia} alt="Especia" width={28} height={28} />
              <span>Especia: {recursos['Especia'] ?? recursos['especia'] ?? 0}</span>
            </div>
            <div className="recurso">
                <img src={img_metal} alt="Metal" width={28} height={28} />
              <span>Metal: {recursos['Metal'] ?? recursos['metal'] ?? 0}</span>
            </div>
            <div className="recurso">
                <img src={img_agua} alt="Agua" width={28} height={28} />
              <span>Agua: {recursos['Agua'] ?? recursos['agua'] ?? 0}</span>
            </div>
            <div className="recurso">
                <img src={img_liebre} alt="Liebre" width={28} height={28} />
              <span>Liebre: {recursos['Liebre'] ?? recursos['liebre'] ?? 0}</span>
            </div>
        </div>
      </div>

      {/* Panel derecho (wrapper to keep the dice button visually below the gray panel) */}
      <div className="panel-derecho-wrap">
        <div className="panel-derecho">
          <h3>Puntaje</h3>
          {puntajes.length === 0 ? (
            <p>Cargando...</p>
          ) : (
            puntajes.map((p, i) => (
              <p key={i}>
                {p.nombre}: {p.puntaje}
              </p>
            ))
          )}
        </div>

        {/* Botones independientes bajo puntaje (fuera del fondo gris) */}
      {esMiTurno && !partidaFinalizada && (
        <div className="lanzar-dado-container">
          <button
            className="btn-lanzar"
            onClick={lanzarDado}
            disabled={tirando}
          >
            {tirando ? 'Tirando...' : 'Lanzar Dado'}
          </button>

          <button
            className="btn-lanzar"
            onClick={terminarTurno}
            disabled={cambiandoTurno || tirando}
          >
            {cambiandoTurno ? 'Cambiando...' : 'Terminar Turno'}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}


