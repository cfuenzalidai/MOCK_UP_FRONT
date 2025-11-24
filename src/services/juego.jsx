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
    const res = await api.post(`/partidas/${partidaId}/iniciar`);
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