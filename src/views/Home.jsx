import Logo from '../assets/img/logo-apogeo.svg';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home(){
  const { user } = useAuth();
  const ctaHref = user ? '/partidas/nueva' : '/registro';
  const ctaText = user ? '¡Iniciar una partida!' : '¡Regístrate Ahora!';

  return (
    <section className="hero">
      <div className="panel copy">
        <p>En los bordes de la <span className="c1">galaxia</span>, las <span className="c2">casas</span> alzan sus estandartes y cada planeta es una promesa <strong>brillando</strong> en la oscuridad.</p>
        <p>Tu nombre aún no pesa en el mapa, pero tus decisiones sí. Traza rutas, crea bases, <span className="c3">sella pactos</span>… y <span className="c4">rómpelos</span>.</p>
        <p>Entre órbitas silenciosas y flotas que despiertan, el destino no se hereda: el <strong>Apogeo</strong> se conquista.</p>
      </div>

      <div className="logoWrap"><img src={Logo} alt="Apogeo" /></div>

      <Link className="cta" to={ctaHref}>{ctaText}</Link>

      <div className="panel panel-right">
        <div className="chips">
          <div className="chip">3-6 jugadores</div>
          <div className="chip">Turnos asincrónicos</div>
          <div className="chip">Mapa de casillas</div>
          <div className="chip">Modo espectador</div>
        </div>
      </div>
    </section>
  );
}
