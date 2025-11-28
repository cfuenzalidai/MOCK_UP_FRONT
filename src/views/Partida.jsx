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
  const [buildingNave, setBuildingNave] = useState(false);
  const [navesCount, setNavesCount] = useState({ basica: 0, intermedia: 0, avanzada: 0 });


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

  // Cargar naves del jugador actual y contar por nivel
  useEffect(() => {
    if (!miJugador || !partidaId) { setNavesCount({ basica: 0, intermedia: 0, avanzada: 0 }); return; }
    let mounted = true;
    async function cargarNaves() {
      try {
        const actorId = miJugador.jugadorEnPartidaId || miJugador.id || miJugador.userId || miJugador.usuarioId;
        if (!actorId) { if (mounted) setNavesCount({ basica: 0, intermedia: 0, avanzada: 0 }); return; }
        const naves = await juego.obtenerNaves(partidaId, actorId);
        if (!mounted) return;
        const counts = { basica: 0, intermedia: 0, avanzada: 0 };
        (naves || []).forEach(n => {
          const lvl = (n.nivel || n.level || '').toString().toLowerCase();
          if (lvl.includes('bas')) counts.basica += 1;
          else if (lvl.includes('inter')) counts.intermedia += 1;
          else if (lvl.includes('avanz') || lvl.includes('avanzada')) counts.avanzada += 1;
        });
        setNavesCount(counts);
      } catch (err) {
        console.error('Error al cargar naves del jugador:', err);
        if (mounted) setNavesCount({ basica: 0, intermedia: 0, avanzada: 0 });
      }
    }
    cargarNaves();
    return () => (mounted = false);
  }, [miJugador, partidaId]);


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
        try {
          const tiro = resultado?.tiro || resultado?.roll || null;
          const recursos = resultado?.recursosOtorgados || resultado?.recursos || resultado?.recursosObtenidos || [];

          // Helper para obtener nombre legible del recurso
          const recursoNameFromId = (id) => {
            const map = { 1: 'Especia', 2: 'Metal', 3: 'Agua', 4: 'Liebre' };
            return map[id] || String(id);
          };

          const multiplicador = tiro?.multiplicador ?? tiro?.mult ?? null;
          const fallbackVal = tiro && (tiro.valor ?? tiro.id ?? tiro.face ?? tiro.numero)
            ? (tiro.valor ?? tiro.id ?? tiro.face ?? tiro.numero)
            : null;

          if (Array.isArray(recursos) && recursos.length > 0) {
            // Formatear múltiples recursos si es necesario
            const partes = recursos.map(r => {
              const cantidad = r.cantidad ?? r.cant ?? r.amount ?? 0;
              const nombre = r.Recurso?.nombre || r.recurso?.nombre || recursoNameFromId(r.recursoId || r.RecursoId || r.recursoId);
              return `${cantidad} ${nombre}`;
            });
            const recursosTxt = partes.join(', ');
            const tiroTxt = multiplicador != null
              ? `Te salió un x${multiplicador}, `
              : (fallbackVal != null ? `Te salió un ${fallbackVal}, ` : 'Resultado: ');
            const sad = multiplicador === 0 ? ' 😢' : '';
            alert(`${tiroTxt}obtienes ${recursosTxt}${sad}`);
          } else if (multiplicador != null || fallbackVal != null) {
            if (multiplicador != null) {
              const sad = multiplicador === 0 ? ' 😢' : '';
              alert(`Te salió un x${multiplicador}${sad}`);
            } else {
              alert(`Te salió un ${fallbackVal}`);
            }
          } else {
            alert('Resultado: ' + JSON.stringify(resultado));
          }
        } catch (e) {
          console.error('Error formateando resultado del dado:', e);
          alert('Resultado: ' + JSON.stringify(resultado));
        }
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

  async function construirNave() {
    if (!partidaId) return alert('No se pudo determinar la partida.');
    if (!miJugador) return alert('No se pudo determinar tu jugador en la partida.');

    // Re-evaluate turno activo from server to avoid stale data
    try {
      setBuildingNave(true);
      const turno = await juego.obtenerTurnoActivo(partidaId);
      if (!turno) {
        alert('No hay un turno activo para esta partida.');
        return;
      }

      const turnoJugadorId = turno.jugadorEnPartidaId || turno.jugadorId || turno.jugador?.id;
      const actorId = miJugador.jugadorEnPartidaId || miJugador.id || miJugador.userId || miJugador.usuarioId;
      if (!actorId) return alert('No se pudo determinar tu id de jugador.');

      if (String(turnoJugadorId) !== String(actorId)) {
        alert('No es tu turno. Solo puedes construir cuando sea tu turno activo.');
        return;
      }

      const turnoId = turno.id || turno._id;
      if (!turnoId) return alert('Turno inválido (sin id).');

      // Intentar crear la jugada de tipo construir_nave; el backend validará recursos
      const payload = { partidaId: Number(partidaId), turnoId: Number(turnoId), actorId: Number(actorId), tipo: 'construir_nave', payload: {} };
      console.debug('Construir nave - payload:', payload);
      const res = await api.post('/jugadas', payload);
      // refrescar datos relevantes
      try { await cargarPuntajes(); } catch (e) { /* no bloquear */ }
      try { const turnoNuevo = await juego.obtenerTurnoActivo(partidaId); setTurnoActivo(turnoNuevo); } catch (e) { /* ignore */ }
      try { const id = actorId; const r = await juego.obtenerRecursos(id); setRecursos(r.map || {}); } catch (e) { /* ignore */ }
      try { const b = await juego.obtenerBases(partidaId); setBases(b || []); } catch (e) { /* ignore */ }
      try {
        // actualizar contador de naves inmediatamente
        const actor = actorId;
        const naves = await juego.obtenerNaves(partidaId, actor);
        const counts = { basica: 0, intermedia: 0, avanzada: 0 };
        (naves || []).forEach(n => {
          const lvl = (n.nivel || n.level || '').toString().toLowerCase();
          if (lvl.includes('bas')) counts.basica += 1;
          else if (lvl.includes('inter')) counts.intermedia += 1;
          else if (lvl.includes('avanz') || lvl.includes('avanzada')) counts.avanzada += 1;
        });
        setNavesCount(counts);
      } catch (e) { /* ignore naves refresh errors */ }

      alert('Nave construida correctamente.');
      return res.data ?? res;
    } catch (err) {
      console.error('Error al construir nave:', err);
      if (err?.response) {
        console.error('Server response data:', err.response.data);
        const remote = err.response.data?.error || err.response.data;
        const msg = remote?.message || remote?.code || JSON.stringify(remote) || err.message || 'Error al construir nave';
        if (remote?.detalle) {
          alert(msg + ': ' + JSON.stringify(remote.detalle));
        } else {
          alert(msg);
        }
      } else {
        alert(err.message || 'Error al construir nave');
      }
    } finally {
      setBuildingNave(false);
    }
  }

  return (
    <div className="partida-container">
  {/* Panel izquierdo */}
      <div className="panel-izquierdo">
        <h3>Naves</h3>
          <div className="control">
           <img src={nave_b} alt="Nave Basica" className="icon-nave icon-nave--b" />
           <span>Naves Básicas: {navesCount.basica}</span>
         </div>
         <div className="control">
           <img src={nave_i} alt="Nave Intermedia" className="icon-nave icon-nave--i" />
           <span>Naves Intermedias: {navesCount.intermedia}</span>
         </div>
         <div className="control">
           <img src={nave_a} alt="Nave Avanzada" className="icon-nave icon-nave--a" />
           <span>Naves Avanzadas: {navesCount.avanzada}</span>
        </div>
        <h3>Bases</h3>
        <div className="control">
          <img src={baseImg} alt="Base" className="icon-base" />
          <span>Bases: {miBaseCount}</span>
        </div>
        {/* debug button removed */}
  <h3>Acciones</h3>
  <button
    className="accion-btn"
    onClick={construirNave}
    disabled={!esMiTurno || buildingNave}
  >
    {buildingNave ? 'Construyendo...' : 'Construir Nave'}
  </button>
  <button className="accion-btn">Mejorar Nave</button>
  <button className="accion-btn">Usar Nave</button>
  <button className="accion-btn">Construir Base</button>
  <button className="accion-btn">Origen</button>
      </div>

      {/* Tablero central */}
      <div className="tablero">
        <div className="map-wrapper">
           <Mapa bases={bases} jugadores={jugadores} planetas={planetas} />
 
           {/* Recursos posicionados a distancia fija respecto al mapa */}
           <div className="recursos">
             <div className="recurso">
               <img src={img_especia} alt="Especia" className="icon-recurso icon-recurso--especia" />
               <span>Especia: {recursos['Especia'] ?? recursos['especia'] ?? 0}</span>
             </div>
             <div className="recurso">
               <img src={img_metal} alt="Metal" className="icon-recurso icon-recurso--metal" />
               <span>Metal: {recursos['Metal'] ?? recursos['metal'] ?? 0}</span>
             </div>
             <div className="recurso">
               <img src={img_agua} alt="Agua" className="icon-recurso icon-recurso--agua" />
               <span>Agua: {recursos['Agua'] ?? recursos['agua'] ?? 0}</span>
             </div>
             <div className="recurso">
               <img src={img_liebre} alt="Liebre" className="icon-recurso icon-recurso--liebre" />
               <span>Liebre: {recursos['Liebre'] ?? recursos['liebre'] ?? 0}</span>
             </div>
           </div>
          </div>
      </div>

      {/* Panel derecho (wrapper to keep the dice button visually below the gray panel) */}
      <div className="panel-derecho-wrap">
        <div className="panel-derecho">
          <h3>Puntajes</h3>
          {puntajes.length === 0 ? (
            <p>Cargando...</p>
          ) : (
            <div className="puntajes-list">
              {puntajes.map((p, i) => (
                <div className="puntaje-item" key={i}>
                  <div className="puntaje-nombre">{p.nombre}</div>
                  <div className="puntaje-valor" aria-label={`Puntaje de ${p.nombre}`}>{p.puntaje}</div>
                </div>
              ))}
            </div>
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


