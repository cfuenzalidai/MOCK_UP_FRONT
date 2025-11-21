import Insignia from '../assets/img/insignia.svg';
import DefaultAvatar from '../assets/img/user.svg'; // usa tu avatar por defecto
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';

export default function NavBar(){
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e){ if (!ref.current?.contains(e.target)) setOpen(false); }
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  function onLogout(){
    logout();
    nav('/');
  }

  const avatarSrc = user?.avatarUrl || DefaultAvatar;

  return (
    <header className="nav">
      <div className="nav-left">
        <Link to="/" className="brand">
          <img src={Insignia} alt="Apogeo" />
          <span>Apogeo</span>
        </Link>
        <Link to="/como-jugar">Cómo Jugar</Link>
        <Link to="/reglas">Reglas</Link>
        <Link to="/partidas-publicas">Partidas Públicas</Link>
        <Link to="/nosotros">Nosotros</Link>
      </div>

      <div className="nav-right">
        {!user ? (
          <>
            <Link to="/login">Ingresar</Link>
            <Link to="/registro">Registrarse</Link>
            <img className="avatar" src={DefaultAvatar} alt="Perfil" />
          </>
        ) : (
          // Agrupamos saludo + avatar en un contenedor flex para mantener orden
          <div className="user-actions">
            <div className="welcome">
              <span>{`¡Bienvenido ${user.nombre}!`}</span>
            </div>

            <div ref={ref} className="avatarWrap">
              <button className="avatarBtn" onClick={() => setOpen(v => !v)} aria-haspopup="menu" aria-expanded={open}>
                <img className="avatar" src={avatarSrc} alt={user.email || 'Usuario'} />
              </button>

              {open && (
                <div className="dropdown" role="menu">
                  <Link to="/usuario/editar" role="menuitem">Editar Usuario</Link>
                  <Link to="/usuario/clave" role="menuitem">Cambiar contraseña</Link>
                  <Link to="/config" role="menuitem">Configuración</Link>
                  {/* Admin links */}
                  {(user?.rol === 'admin' || user?.role === 'admin') && (
                    <>
                      <Link to="/admin/usuarios" role="menuitem">Usuarios</Link>
                      <Link to="/admin/partidas" role="menuitem">Partidas</Link>
                    </>
                  )}
                  <button onClick={onLogout} role="menuitem" className="danger">Finalizar sesión</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

