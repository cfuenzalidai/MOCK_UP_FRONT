import Mapa from "./Mapa";
import { useState, useEffect, useRef } from 'react';
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
  const [naves, setNaves] = useState([]);
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
  const [improving, setImproving] = useState(false);
  const [usingNave, setUsingNave] = useState(false);
  const [selectedShipForUse, setSelectedShipForUse] = useState(null);
  const [selectingDestino, setSelectingDestino] = useState(false);
  const prevIsMyTurnRef = useRef(false);
  const initialisedTurnRef = useRef(false);


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

  // Helper para decidir si un turno pertenece al jugador dado
  function isTurnoParaJugador(turno, jugador) {
    if (!turno || !jugador) return false;
    const turnoJugadorId = turno.jugadorEnPartidaId || turno.jugadorId || turno.jugador?.id;
    const actorId = jugador.jugadorEnPartidaId || jugador.id || jugador.userId || jugador.usuarioId;
    if (!turnoJugadorId || !actorId) return false;
    return String(turnoJugadorId) === String(actorId);
  }

  // Inicializar la referencia de estado previo una sola vez cuando tengamos datos
  useEffect(() => {
    if (!initialisedTurnRef.current && miJugador && turnoActivo !== null) {
      prevIsMyTurnRef.current = isTurnoParaJugador(turnoActivo, miJugador);
      initialisedTurnRef.current = true;
    }
  }, [miJugador, turnoActivo]);

  // Polling: comprobar turno activo periódicamente y notificar al jugador cuando
  // pase a ser su turno. Esto evita que otros jugadores tengan que recargar.
  useEffect(() => {
    if (!partidaId) return;
    if (booting) return;
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const turno = await juego.obtenerTurnoActivo(partidaId);
        if (!mounted) return;
        setTurnoActivo(turno);
        const wasMyTurn = prevIsMyTurnRef.current;
        const nowMyTurn = isTurnoParaJugador(turno, miJugador);
        if (!wasMyTurn && nowMyTurn) {
          alert('¡Es tu turno!');
        }
        prevIsMyTurnRef.current = nowMyTurn;
      } catch (err) {
        // ignore transient errors
      }
    }, 2000);

    return () => { mounted = false; clearInterval(interval); };
  }, [partidaId, booting, miJugador]);


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


  // Cargar todas las naves de la partida (para mostrar en el mapa)
  useEffect(() => {
    if (!partidaId) { setNaves([]); return; }
    let mounted = true;
    async function cargarTodasNaves() {
      try {
        const todas = await juego.obtenerNaves(partidaId);
        if (!mounted) return;
        setNaves(todas || []);
      } catch (err) {
        console.error('Error al cargar naves de la partida:', err);
        if (mounted) setNaves([]);
      }
    }
    cargarTodasNaves();
    // refrescar cada 4s para mantener mapa actualizado
    const iv = setInterval(() => { if (partidaId) cargarTodasNaves(); }, 4000);
    return () => { mounted = false; clearInterval(iv); };
  }, [partidaId]);


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

  async function mejorarNaveHandler() {
    if (!partidaId) return alert('No se pudo determinar la partida.');
    if (!miJugador) return alert('No se pudo determinar tu jugador en la partida.');
    try {
      setImproving(true);
      const turno = await juego.obtenerTurnoActivo(partidaId);
      if (!turno) return alert('No hay un turno activo para esta partida.');
      const actorId = miJugador.jugadorEnPartidaId || miJugador.id || miJugador.userId || miJugador.usuarioId;
      const turnoJugadorId = turno.jugadorEnPartidaId || turno.jugadorId || turno.jugador?.id;
      if (!actorId) return alert('No se pudo determinar tu id de jugador.');
      if (String(turnoJugadorId) !== String(actorId)) return alert('No es tu turno. Solo puedes mejorar cuando sea tu turno activo.');

      // obtener naves del jugador
      const naves = await juego.obtenerNaves(partidaId, actorId);
      const upgradables = (naves || []).filter(n => {
        const lvl = (n.nivel || '').toString().toLowerCase();
        return lvl === 'basica' || lvl === 'intermedia';
      });
      if (!upgradables.length) return alert('No tienes naves mejorables (todas están en nivel máximo o no tienes naves).');

      // si hay varias, pedir elegir por id
      let selected = null;
      if (upgradables.length === 1) {
        selected = upgradables[0];
      } else {
        const list = upgradables.map(n => `${n.id}: ${n.nivel}${n.planetaId ? ' (planeta ' + n.planetaId + ')' : ''}`).join('\n');
        const entrada = window.prompt('Elige el id de la nave a mejorar:\n' + list);
        if (!entrada) return; // cancel
        const idSel = Number(entrada.trim());
        selected = upgradables.find(n => Number(n.id) === idSel);
        if (!selected) return alert('Id de nave inválido.');
      }

      const originalNivel = (selected.nivel || '').toString();
      const turnoId = turno.id || turno._id;
      if (!turnoId) return alert('Turno inválido (sin id).');

      const payload = { partidaId: Number(partidaId), turnoId: Number(turnoId), actorId: Number(actorId), tipo: 'mejorar_nave', payload: { naveId: Number(selected.id) } };
      const res = await api.post('/jugadas', payload);

      // leer resultado del servidor
      const resultado = res?.data?.resultado || res?.data || res;
      const nuevoNivel = resultado?.nivel || (resultado?.resultado && resultado.resultado.nivel) || null;

      // refrescar naves localmente
      try {
        const refreshed = await juego.obtenerNaves(partidaId, actorId);
        const counts = { basica: 0, intermedia: 0, avanzada: 0 };
        (refreshed || []).forEach(n => {
          const lvl = (n.nivel || n.level || '').toString().toLowerCase();
          if (lvl.includes('bas')) counts.basica += 1;
          else if (lvl.includes('inter')) counts.intermedia += 1;
          else if (lvl.includes('avanz') || lvl.includes('avanzada')) counts.avanzada += 1;
        });
        setNavesCount(counts);
      } catch (e) { /* ignore */ }

      alert(`Tu nave ${originalNivel} fue mejorada${nuevoNivel ? ' a ' + nuevoNivel : ''}.`);
      // refrescar puntajes/turno/recursos
      try { await cargarPuntajes(); } catch (e) {}
      try { const turnoNuevo = await juego.obtenerTurnoActivo(partidaId); setTurnoActivo(turnoNuevo); } catch (e) {}
      try { const id = actorId; const r = await juego.obtenerRecursos(id); setRecursos(r.map || {}); } catch (e) {}
      return res.data ?? res;
    } catch (err) {
      console.error('Error al mejorar nave:', err);
      if (err?.response) {
        console.error('Server response data:', err.response.data);
        const remote = err.response.data?.error || err.response.data;
        const msg = remote?.message || remote?.code || JSON.stringify(remote) || err.message || 'Error al mejorar nave';
        if (remote?.detalle) {
          alert(msg + ': ' + JSON.stringify(remote.detalle));
        } else {
          alert(msg);
        }
      } else {
        alert(err.message || 'Error al mejorar nave');
      }
    } finally {
      setImproving(false);
    }
  }

  async function usarNaveHandler() {
    if (!partidaId) return alert('No se pudo determinar la partida.');
    if (!miJugador) return alert('No se pudo determinar tu jugador en la partida.');
    try {
      setUsingNave(true);
      const turno = await juego.obtenerTurnoActivo(partidaId);
      if (!turno) return alert('No hay un turno activo para esta partida.');
      const actorId = miJugador.jugadorEnPartidaId || miJugador.id || miJugador.userId || miJugador.usuarioId;
      const turnoJugadorId = turno.jugadorEnPartidaId || turno.jugadorId || turno.jugador?.id;
      if (!actorId) return alert('No se pudo determinar tu id de jugador.');
      if (String(turnoJugadorId) !== String(actorId)) return alert('No es tu turno. Solo puedes usar una nave cuando sea tu turno activo.');

      // obtener naves disponibles (no usadas/consumidas) del jugador
      const naves = await juego.obtenerNaves(partidaId, actorId);
      const disponibles = (naves || []).filter(n => n.estado !== 'usada' && n.estado !== 'consumida');
      if (!disponibles.length) return alert('No tienes naves disponibles para usar.');

      // si hay varias, pedir seleccionar por id (mejor reemplazar luego por modal)
      let selected = null;
      if (disponibles.length === 1) selected = disponibles[0];
      else {
        const list = disponibles.map(n => `${n.id}: ${n.nivel}`).join('\n');
        const entrada = window.prompt('Elige el id de la nave a usar:\n' + list);
        if (!entrada) return; // cancel
        const idSel = Number(entrada.trim());
        selected = disponibles.find(n => Number(n.id) === idSel);
        if (!selected) return alert('Id de nave inválido.');
      }

      // Sugerir destino: filtrar planetas alcanzables según nivel de la nave y sin bases
      const planetasAll = await juego.obtenerPlanetas(partidaId);
      // obtener mapaId desde los planetas (si existen)
      const mapaId = (planetasAll && planetasAll.length > 0) ? (planetasAll[0].mapaId || planetasAll[0].MapaId || null) : null;

      let reachablePlanets = [];

      // niveles y alcance
      const nivel = (selected.nivel || '').toString().toLowerCase();
      const maxSaltos = nivel.includes('avanz') ? Infinity : (nivel.includes('inter') ? 2 : 1);

      if (!selected.planetaId) return alert('La nave no tiene planeta de origen asignado.');
      const origenId = Number(selected.planetaId);

      if (maxSaltos === Infinity) {
        // avanzado: puede viajar a cualquier planeta que no tenga base
        reachablePlanets = (planetasAll || []).filter(p => !bases.some(b => Number(b.planetaId) === Number(p.id)));
      } else {
        // básico/intermedio: necesitamos la lista de vecinos para calcular distancias
        if (!mapaId) {
          // si no tenemos mapaId, fallback a listar todos y confiar en backend
          reachablePlanets = (planetasAll || []).filter(p => !bases.some(b => Number(b.planetaId) === Number(p.id)));
        } else {
          // obtener aristas de vecinos para el mapa
          const pvRes = await api.get(`/planetasvecinos?mapaId=${encodeURIComponent(mapaId)}`);
          const pvRows = pvRes?.data || [];
          const adj = new Map();
          for (const r of pvRows) {
            const a = Number(r.planetaId ?? r.planeta?.id ?? r.planetaId);
            const b = Number(r.vecinoId ?? r.vecino?.id ?? r.vecinoId);
            if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
            if (!adj.has(a)) adj.set(a, new Set());
            if (!adj.has(b)) adj.set(b, new Set());
            adj.get(a).add(b);
            adj.get(b).add(a); // tratamos como no dirigido para robustez
          }

          // BFS limitado a maxSaltos
          const q = [origenId];
          const dist = new Map();
          dist.set(origenId, 0);
          while (q.length) {
            const u = q.shift();
            const d = dist.get(u);
            if (d >= maxSaltos) continue;
            const neighbors = Array.from(adj.get(u) || []);
            for (const v of neighbors) {
              if (!dist.has(v)) {
                dist.set(v, d + 1);
                q.push(v);
              }
            }
          }

          reachablePlanets = (planetasAll || []).filter(p => {
            const pid = Number(p.id);
            if (pid === origenId) return false; // no viajar al mismo
            if (bases.some(b => Number(b.planetaId) === pid)) return false; // excluir conquistados
            const d = dist.get(pid);
            return typeof d === 'number' && d <= maxSaltos;
          });
        }
      }

      if (!reachablePlanets.length) return alert('No hay planetas válidos alcanzables desde tu origen según el nivel de la nave.');

      // Activar modo de selección en el mapa: el usuario debe clickear la casilla destino
      setSelectedShipForUse(selected);
      setSelectingDestino(true);
      alert('Selecciona el planeta');
      // la acción real se ejecuta cuando el usuario cliquea la casilla (handleTerritorioSeleccionado)
      return null;
    } catch (err) {
      console.error('Error al usar nave:', err);
      if (err?.response) {
        console.error('Server response data:', err.response.data);
        const remote = err.response.data?.error || err.response.data;
        const msg = remote?.message || remote?.code || JSON.stringify(remote) || err.message || 'Error al usar nave';
        if (remote?.detalle) alert(msg + ': ' + JSON.stringify(remote.detalle)); else alert(msg);
      } else {
        alert(err.message || 'Error al usar nave');
      }
    } finally {
      // no forzar setUsingNave(false) aquí: lo controlamos durante la selección/ejecución
    }
  }

  // Handler que se invoca desde el mapa cuando el usuario hace click en una casilla
  async function handleTerritorioSeleccionado(territoryIndex, geometry) {
    if (!selectingDestino || !selectedShipForUse) return;
    try {
      setUsingNave(true);
      // buscar planeta correspondiente al territoryIndex
      let planeta = (planetas || []).find(p => p.idxTablero !== undefined && p.idxTablero !== null && Number(p.idxTablero) === Number(territoryIndex));
      // fallback: intentar emparejar por id o label usando la geometría provista
      if (!planeta && geometry) {
        const geomId = geometry.id;
        const geomLabel = geometry.label;
        planeta = (planetas || []).find(p => String(p.id) === String(geomId) || String(p.id) === String(geomLabel) || String(p.planetaId) === String(geomId) || String(p.idxTablero) === String(geomLabel));
      }
      if (!planeta) {
        alert('La casilla seleccionada no corresponde a un planeta válido. Elige otra.');
        return;
      }

      // validar que el planeta esté alcanzable (opcional: confiamos en backend de momento)
      const turno = await juego.obtenerTurnoActivo(partidaId);
      if (!turno) return alert('No hay un turno activo para esta partida.');
      const actorId = miJugador.jugadorEnPartidaId || miJugador.id || miJugador.userId || miJugador.usuarioId;
      const turnoJugadorId = turno.jugadorEnPartidaId || turno.jugadorId || turno.jugador?.id;
      if (!actorId) return alert('No se pudo determinar tu id de jugador.');
      if (String(turnoJugadorId) !== String(actorId)) return alert('No es tu turno.');

      const turnoId = turno.id || turno._id;
      if (!turnoId) return alert('Turno inválido (sin id).');

      const payload = { partidaId: Number(partidaId), turnoId: Number(turnoId), actorId: Number(actorId), tipo: 'usar_nave', payload: { naveId: Number(selectedShipForUse.id), destinoPlanetaId: Number(planeta.id) } };
      const res = await api.post('/jugadas', payload);

      // refrescar estado relevante
      try { await cargarPuntajes(); } catch (e) {}
      try { const turnoNuevo = await juego.obtenerTurnoActivo(partidaId); setTurnoActivo(turnoNuevo); } catch (e) {}
      try { const id = actorId; const r = await juego.obtenerRecursos(id); setRecursos(r.map || {}); } catch (e) {}
      try { const b = await juego.obtenerBases(partidaId); setBases(b || []); } catch (e) {}
      try { const refreshed = await juego.obtenerNaves(partidaId, actorId); const counts = { basica:0, intermedia:0, avanzada:0 }; (refreshed||[]).forEach(n=>{const lvl=(n.nivel||'').toString().toLowerCase(); if(lvl.includes('bas')) counts.basica+=1; else if(lvl.includes('inter')) counts.intermedia+=1; else if(lvl.includes('avanz')) counts.avanzada+=1;}); setNavesCount(counts); } catch (e) {}

      const resultado = res?.data?.resultado || res?.data || res;
      alert('Nave usada correctamente.' + (resultado && resultado.mensaje ? '\n' + resultado.mensaje : ''));
      return res.data ?? res;
    } catch (err) {
      console.error('Error al usar nave desde selección en mapa:', err);
      if (err?.response) {
        console.error('Server response data:', err.response.data);
        const remote = err.response.data?.error || err.response.data;
        const msg = remote?.message || remote?.code || JSON.stringify(remote) || err.message || 'Error al usar nave';
        if (remote?.detalle) alert(msg + ': ' + JSON.stringify(remote.detalle)); else alert(msg);
      } else {
        alert(err.message || 'Error al usar nave');
      }
    } finally {
      setUsingNave(false);
      setSelectedShipForUse(null);
      setSelectingDestino(false);
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
  {/* Acciones: cambiar apariencia cuando no es tu turno (clase + title) */}
  <button
    className={`accion-btn ${!esMiTurno ? 'accion-btn--blocked' : ''} ${buildingNave ? 'accion-btn--loading' : ''}`}
    onClick={construirNave}
    disabled={!esMiTurno || buildingNave}
    title={!esMiTurno ? 'No es tu turno' : (buildingNave ? 'Construyendo...' : 'Construir Nave')}
  >
    {buildingNave ? 'Construyendo...' : 'Construir Nave'}
  </button>
  <button
    className={`accion-btn ${!esMiTurno ? 'accion-btn--blocked' : ''} ${improving ? 'accion-btn--loading' : ''}`}
    onClick={mejorarNaveHandler}
    disabled={!esMiTurno || improving}
    title={!esMiTurno ? 'No es tu turno' : (improving ? 'Mejorando...' : 'Mejorar Nave')}
  >
    {improving ? 'Mejorando...' : 'Mejorar Nave'}
  </button>
  <button
    className={`accion-btn ${!esMiTurno ? 'accion-btn--blocked' : ''} ${usingNave ? 'accion-btn--loading' : ''}`}
    onClick={usarNaveHandler}
    disabled={!esMiTurno || usingNave}
    title={!esMiTurno ? 'No es tu turno' : (usingNave ? 'Usando nave...' : 'Usar Nave')}
  >{usingNave ? 'Usando...' : 'Usar Nave'}</button>
  {selectingDestino && (
    <button
      className="accion-btn accion-btn--cancel"
      onClick={() => { setSelectingDestino(false); setSelectedShipForUse(null); setUsingNave(false); }}
    >Cancelar selección</button>
  )}
  <button
    className={`accion-btn ${!esMiTurno ? 'accion-btn--blocked' : ''}`}
    onClick={() => {}}
    disabled={!esMiTurno}
    title={!esMiTurno ? 'No es tu turno' : 'Construir Base'}
  >Construir Base</button>
  <button
    className={`accion-btn ${!esMiTurno ? 'accion-btn--blocked' : ''}`}
    onClick={() => {}}
    disabled={!esMiTurno}
    title={!esMiTurno ? 'No es tu turno' : 'Origen'}
  >Origen</button>
      </div>

      {/* Tablero central */}
      <div className="tablero">
        <div className="map-wrapper">
           <Mapa bases={bases} jugadores={jugadores} planetas={planetas} naves={naves} onTerritorioClick={handleTerritorioSeleccionado} selectingDestino={selectingDestino} />
 
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


