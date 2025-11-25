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
      alert('Turno cambiado');
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

  return (
    <div className="partida-container">
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
  <button className="accion-btn">Construir Base</button>
  <button className="accion-btn">Origen</button>
      </div>

      {/* Tablero central */}
      <div className="tablero">
        <Mapa bases={bases} jugadores={jugadores} planetas={planetas} />

        {/* Recursos debajo del tablero */}
        <div className="recursos">
            <div className="recurso">
                <img src={img_especia} alt="Especia" width={28} height={28} />
                <span>Especia: 4</span>
            </div>
            <div className="recurso">
                <img src={img_metal} alt="Metal" width={28} height={28} />
                <span>Metal: 2</span>
            </div>
            <div className="recurso">
                <img src={img_agua} alt="Agua" width={28} height={28} />
                <span>Agua: 5</span>
            </div>
            <div className="recurso">
                <img src={img_liebre} alt="Liebre" width={28} height={28} />
                <span>Liebre: 5</span>
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
       {esMiTurno && (
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


