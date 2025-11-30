import api from './api';

export async function cambiarTurno(partidaId) {
	if (!partidaId) throw new Error('partidaId es requerido');
	try {
		const res = await api.put(`/partidas/${partidaId}/cambiarTurno`);
		return res.data;
	} catch (err) {
		const status = err?.response?.status;
		if (status && [404, 405].includes(status)) {
			// fallback
		} else {
			throw err;
		}
	}
}

export async function obtenerTurnoActivo(partidaId) {
  if (!partidaId) throw new Error('partidaId es requerido');
	const res = await api.get(`/partidas/${partidaId}/turnoActual`);
	return res?.data;
}

export function esMiTurno(turno, userId) {
  return (
    turno &&
    (String(turno.jugadorId) === String(userId) ||
     String(turno.jugador?.id) === String(userId))
  );
}

export async function lanzarDadoService(turnoId) {
  return api.post('/tirodados', { turnoId });
}

export async function obtenerPuntajes(partidaId) {
	if (!partidaId) throw new Error('partidaId es requerido');
    try {
        const res = await api.get(`/partidas/${partidaId}/puntajes`);
        return res.data;
    } catch (err) {
        const status = err?.response?.status;
        if (status && [404, 405].includes(status)) {
            // fallback
        } else {
            throw err;
        }
    }
}


export async function cambiarEstadoPartida(partidaId) {
  if (!partidaId) throw new Error('partidaId es requerido');

  try {
    const res = await api.put(`/partidas/${partidaId}/iniciar`);
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (!(status && [404, 405].includes(status))) {
      // error distinto: propagar
      throw err;
    }
    // si 404/405 -> fallback
  }
}

export async function obtenerJugadores(partidaId) {
  if (!partidaId) throw new Error('partidaId es requerido');
  const res = await api.get(`/partidas/${partidaId}/jugadores`);
  const d = res.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.jugadores)) return d.jugadores;
  if (Array.isArray(d.players)) return d.players;
  if (Array.isArray(d.data)) return d.data;
  console.warn('obtenerJugadores: respuesta inesperada, se devuelve arreglo vacío', d);
  return [];
}

// Nuevo: devuelve jugadores normalizados con campo `casa` (id de la casa) si existe.
export async function jugadores(partidaId) {
  const js = await obtenerJugadores(partidaId);
  // Normalizar forma: cada jugador tendrá { id, nombre, casa }
  return js.map(j => {
    const id = j.id || j._id || j.jugadorEnPartidaId || j.usuarioId || j.userId || null;
    const nombre = j.nombre || j.name || j.username || j.usuario || null;
    const casa = j.casa || j.casaId || j.house || j.houseId || (j.casa && (typeof j.casa === 'object' ? (j.casa.id || j.casaId) : j.casa)) || null;
    return { ...j, id, nombre, casa };
  });
}

export async function obtenerBases(partidaId) {
  if (!partidaId) throw new Error('partidaId es requerido');
  try {
    const res = await api.get(`/partidas/${partidaId}/obtenerBases`);
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.bases)) return d.bases;
    if (Array.isArray(d.data)) return d.data;
    console.warn('obtenerBases: respuesta inesperada, se devuelve arreglo vacío', d);
    return [];
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) {
      // fallback: no existe endpoint -> devolver vacío
      return [];
    }
    throw err;
  }
}

export async function recoleccion(partidaId, jugadorId) {
  if (!partidaId) throw new Error('partidaId es requerido');
  if (!jugadorId) throw new Error('jugadorId es requerido');
  try {
    const res = await api.post(`/partidas/${partidaId}/${jugadorId}/recoleccion`);
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) {
      // fallback
    } else {
      throw err;
    }
  }
}

export async function construirBase(partidaId, jugadorEnPartidaId, planetaId) {
  if (!partidaId) throw new Error('partidaId es requerido');
  if (!jugadorEnPartidaId) throw new Error('jugadorEnPartidaId es requerido');
  if (!planetaId) throw new Error('planetaId es requerido');
  try {
    const res = await api.post(`/partidas/${partidaId}/${jugadorEnPartidaId}/${planetaId}/construirBase`);
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) {
      // endpoint not available
      return null;
    }
    throw err;
  }
}


export async function obtenerPlanetas(partidaId) {
  if (!partidaId) throw new Error('partidaId es requerido');
  // Use the confirmed endpoint for planets and normalize response to an array
  try {
    const res = await api.get(`/partidas/${partidaId}/obtenerPlanetas`);
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.planetas)) return d.planetas;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.planets)) return d.planets;
    if (d && typeof d === 'object') {
      const arrKey = Object.keys(d).find(k => Array.isArray(d[k]));
      if (arrKey) return d[arrKey];
    }
    return [];
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) {
      // endpoint missing -> return empty list
      return [];
    }
    throw err;
  }
}


export async function obtenerTiposDeRecursos() {
  try {
    const res = await api.get('/recursos');
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    return [];
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) {
      // endpoint missing -> return empty list
      return [];
    }
    throw err;
  }
}



export async function obtenerRecursos(jugadorId) {
  if (!jugadorId) throw new Error('jugadorEnPartidaId es requerido');
  try {
    const res = await api.get(`/jugadoresenpartidas/${jugadorId}/recursos`);
    const d = res.data;
    // Normalizar a arreglo
    const arr = Array.isArray(d)
      ? d
      : Array.isArray(d.data)
      ? d.data
      : Array.isArray(d.recursos)
      ? d.recursos
      : [];

    // Construir mapas útiles:
    // - map: nombre original -> cantidad (conservar capitalización del servidor)
    // - mapLower: nombre en minúsculas -> cantidad (comodín para lookups)
    // - mapById: recursoId -> cantidad
    const map = {};
    const mapLower = {};
    const mapById = {};

    arr.forEach(item => {
      const nombre = item.Recurso?.nombre || item.recurso?.nombre || item.nombre || String(item.recursoId || item.id || 'recurso');
      const cantidad = typeof item.cantidad === 'number' ? item.cantidad : Number(item.cantidad) || 0;
      const recursoId = item.recursoId || (item.Recurso && item.Recurso.id) || item.id || null;

      map[nombre] = cantidad;
      mapLower[String(nombre).toLowerCase()] = cantidad;
      if (recursoId != null) mapById[String(recursoId)] = cantidad;
    });

    return { raw: arr, map, mapLower, mapById };
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) {
      // endpoint missing -> return empty
      return { raw: [], map: {}, mapLower: {}, mapById: {} };
    }
    throw err;
  }
}

export async function obtenerNaves(partidaId, jugadorEnPartidaId) {
  if (!partidaId) throw new Error('partidaId es requerido');
  try {
    const qs = [];
    qs.push(`partidaId=${encodeURIComponent(partidaId)}`);
    if (jugadorEnPartidaId) qs.push(`jugadorEnPartidaId=${encodeURIComponent(jugadorEnPartidaId)}`);
    const res = await api.get(`/naves?${qs.join('&')}`);
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.naves)) return d.naves;
    return [];
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) return [];
    throw err;
  }
}

export async function obtenerCasas() {
  try {
    const res = await api.get('/casas');
    const d = res.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    return [];
  } catch (err) {
    const status = err?.response?.status;
    if (status && [404, 405].includes(status)) {
      // endpoint missing -> return empty list
      return [];
    }
    throw err;
  }
}