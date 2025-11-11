import '../assets/styles/nosotros.css';

const TEAM = [
  { name: 'Cristóbal Briones', img: '/team/Cristóbal Briones.jpg', role: 'Estética' },
  { name: 'Benjamin Grassi', img: '/team/Benjamín Grassi.png', role: '"La mamá de Bakugo es Gaudi"' },
  { name: 'Cristóbal Fuenzalida', img: '/team/Cristóbal Fuenzalida.jpg', role: 'Registro y Deploy' },
];

export default function Nosotros() {
  return (
    <section className="hero nosotros">
      <div className="nos-board">
        <h1 className="nos-title">Nosotros</h1>

        <p className="nos-desc">
          {/* Escribe aquí la descripción del grupo: enfoque del proyecto, responsabilidades y herramientas usadas. */}
          <span className="c1">Frontenders</span> es un equipo que se caracteriza por su dedicación y pasión por el <span className="c2">desarrollo web</span>. En este proyecto,
          hemos trabajado en conjunto para crear una plataforma interactiva que permite a los usuarios disfrutar de partidas
          públicas de manera <span className="c3">sencilla</span> y <span className="c4">segura</span>. Cada miembro del equipo ha aportado sus habilidades únicas, desde el diseño de la interfaz hasta la
          <span className="c4"> implementación</span> de funcionalidades clave. Hemos utilizado herramientas modernas como <span className="c3">React</span> para el frontend y <span className="c2">Axios</span> para la comunicación con
          la <span className="c1">API</span>, asegurando una experiencia fluida y eficiente para nuestros usuarios.
        </p>

        <ul className="nos-grid">
          {TEAM.map((m) => (
            <li key={m.name} className="nos-card">
              <div className="avatar-wrap">
                <img src={m.img} alt={m.name} className="avatar" />
              </div>
              <div className="meta">
                <h3 className="name">{m.name}</h3>
                <p className="role">{m.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}