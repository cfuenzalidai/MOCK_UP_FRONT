import Insignia from '../assets/img/insignia.svg';
import UserIcon from '../assets/img/user.svg';
import { Link } from 'react-router-dom';

export default function NavBar(){
  return (
    <header className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">
          <img src={Insignia} alt="Apogeo" />
          <span>Apogeo</span>
        </Link>
        <Link to="/como-jugar">Cómo Jugar</Link>
        <Link to="/reglas">Reglas</Link>
        <Link to="/partidas">Partidas Públicas</Link>
      </div>
      <div className="nav-right">
        <Link to="/login">Ingresar</Link>
        <Link to="/registro">Registrarse</Link>
        <img className="avatar" src={UserIcon} alt="Perfil" />
      </div>
    </header>
  );
}
