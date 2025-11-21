import Mapa from "./Mapa";
import { useEffect, useState } from 'react';
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
import boton_acciones from "../assets/img/boton_acciones.png";
import api from '../services/api';

export default function Partida() {
  const [tirando, setTirando] = useState(false);
  const { user } = useAuth();
  const { partidaId } = useParams();

  async function lanzarDado() {
    if (!partidaId) {
      alert('No se pudo determinar la partida. Asegúrate de abrir la partida desde su URL.');
      return;
    }

    try {
      setTirando(true);

      // Obtener turno activo para la partida
      const resTurno = await api.get(`/tirodados/${partidaId}/activo`);
      const turno = resTurno?.data;

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

      const res = await api.post('/tirodados', { turnoId });
      const resultado = res?.data ?? res;
      console.log('Resultado lanzar dado:', resultado);
      // Si el backend devuelve un objeto de error (por ejemplo ALREADY_ROLLED), mostrar su mensaje
      if (resultado && resultado.error && resultado.error.message) {
        alert(resultado.error.message);
      } else {
        alert('Resultado: ' + JSON.stringify(resultado));
      }
    } catch (err) {
      console.error('Error al lanzar dado', err);
      // Si el backend devolvió un body con error.message dentro de la respuesta de error, mostrarlo
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
  <h3>Acciones</h3>
  <button className="accion-btn">Construir Nave</button>
  <button className="accion-btn">Mejorar Nave</button>
  <button className="accion-btn">Usar Nave</button>
  <button className="accion-btn">Construir Base</button>
  <button className="accion-btn">Origen</button>
      </div>

      {/* Tablero central */}
      <div className="tablero">
        <Mapa />

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
          <p>Jugador 1: 10</p>
          <p>Jugador 2: 12</p>
          <p>Jugador 3: 8</p>
          <p>Jugador 4: 8</p>
          <p>Jugador 5: 8</p>
          <p>Jugador 6: 8</p>
        </div>

        {/* Botones independientes bajo puntaje (fuera del fondo gris) */}
        <div className="lanzar-dado-container">
          <button
            className="btn-lanzar"
            onClick={lanzarDado}
            disabled={tirando}
          >
            {tirando ? 'Tirando...' : 'Lanzar Dado'}
          </button>
          <button className="btn-lanzar">Terminar Turno</button>
        </div>
      </div>
    </div>
  );
}


