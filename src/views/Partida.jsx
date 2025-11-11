import Mapa from "./Mapa";
import "../assets/styles/Partida.css";
import img_especia from "../assets/img/especia.png";
import img_metal from "../assets/img/metal.png";
import img_agua from "../assets/img/agua.png";
import img_liebre from "../assets/img/liebre.png";
import nave_b from "../assets/img/nave_b.png";
import nave_i from "../assets/img/nave_i.png";
import nave_a from "../assets/img/nave_a.png";
import boton_acciones from "../assets/img/boton_acciones.png";

export default function Partida() {
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
  {/* Use inline style for backgroundImage so Vite resolves the imported asset reliably */}
  <button className="accion-btn" style={{ backgroundImage: `url(${boton_acciones})` }}>Construir Nave</button>
  <button className="accion-btn" style={{ backgroundImage: `url(${boton_acciones})` }}>Mejorar Nave</button>
  <button className="accion-btn" style={{ backgroundImage: `url(${boton_acciones})` }}>Usar Nave</button>
  <button className="accion-btn" style={{ backgroundImage: `url(${boton_acciones})` }}>Construir Base</button>
  <button className="accion-btn" style={{ backgroundImage: `url(${boton_acciones})` }}>Origen</button>
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
          <button className="btn-lanzar">Lanzar Dado</button>
          <button className="btn-lanzar">Terminar Turno</button>
        </div>
      </div>
    </div>
  );
}


