import '../assets/styles/nosotros.css';
import '../assets/styles/reglas.css';

export default function ComoJugar() {
  return (
    <section className="hero nosotros">
      <div className="nos-board">
        <h1 className="nos-title">Cómo jugar</h1>

        <div className="nos-desc">
          {/* Quickstart */}
          <section>
            <h2><span className="c1">Resumen</span></h2>
            <ol>
              <li>Crea o únete a una <span className="c2">partida</span>.</li>
              <li>Elige tu <span className="c3">planeta de origen</span> y recibe tus primeras <span className="c4">naves</span> y <span className="c4">base</span>.</li>
              <li>En tu turno: lanza el <span className="c3">dado de eficiencia</span>, cobra recursos de tus bases, <span className="c2">mueve</span> naves y <span className="c2">construye</span> bases.</li>
              <li>Expándete a planetas libres y asegura recursos clave.</li>
              <li>Gana al alcanzar la cantidad objetivo de <span className="c2">planetas</span>.</li>
            </ol>
          </section>

          {/* Flujo de turno */}
          <section>
            <h2><span className="c1">Flujo de turno</span></h2>
            <ol>
              <li><strong>Inicio:</strong> Lanza el <span className="c3">dado de eficiencia</span> (x0/x1/x2) y cobra según tus <span className="c4">bases</span>.</li>
              <li><strong>Acciones:</strong> Con tus recursos puedes:
                <ul>
                  <li><span className="c2">Construir base</span> en un planeta donde tengas nave y aún no exista base.</li>
                  <li><span className="c2">Construir nave</span> (empieza en nivel básico) o <span className="c2">mejorar</span> una existente (básico→intermedio→avanzado).</li>
                  <li><span className="c2">Mover nave</span> a un planeta libre (alcance según nivel).</li>
                </ul>
              </li>
              <li><strong>Cierre:</strong> Finaliza turno y pasa al siguiente jugador.</li>
            </ol>
          </section>

          {/* Primeros pasos guiados */}
          <section>
            <h2><span className="c1">Tus primeros turnos</span></h2>
            <ol>
              <li><strong>Turno 1:</strong> Mueve una nave a un planeta libre adyacente. Evalúa construir <span className="c4">base</span> si cubres el coste.</li>
              <li><strong>Turno 2:</strong> Prioriza un planeta con el <span className="c3">recurso</span> que te falta para futuros upgrades.</li>
              <li><strong>Turno 3:</strong> Mejora una nave a <span className="c2">intermedia</span> para alcanzar planetas a 2 saltos.</li>
            </ol>
          </section>

          {/* Economía práctica */}
          <section>
            <h2><span className="c1">Economía y costos</span></h2>
            <ul>
              <li><strong>Base:</strong> 1 Metal, 2 Agua, 2 Liebres.</li>
              <li><strong>Nave (nueva):</strong> 1 Especia, 1 Metal, 1 Agua.</li>
              <li><strong>Mejora de nave:</strong> 1 Especia, 1 Metal.</li>
              <li><strong>Producción:</strong> Cada <span className="c4">base</span> activa produce según el planeta (1 recurso → 2 uds; 2 recursos → 1 de cada).</li>
            </ul>
            <p>Evita quedarte sin <span className="c3">Agua</span> o <span className="c3">Metal</span>; bloquean tanto bases como naves.</p>
          </section>

          {/* Naves y bases en la práctica */}
          <section>
            <h2><span className="c1">Naves y bases</span></h2>
            <ul>
              <li><strong>Nivel básico:</strong> Vecinos adyacentes.</li>
              <li><strong>Nivel intermedio:</strong> Hasta 2 casillas.</li>
              <li><strong>Nivel avanzado:</strong> Cualquier planeta.</li>
            </ul>
            <p>Las naves <em>no</em> se usan el mismo turno que se construyen o mejoran. El planeta queda “tomado” cuando alguien construye <span className="c4">base</span>; las naves en ese planeta se retiran.</p>
          </section>

          {/* Mapa y visibilidad */}
          <section>
            <h2><span className="c1">Mapa y visibilidad</span></h2>
            <p>Explora planetas libres. Las <span className="c2">partidas públicas</span> permiten observadores; en privadas, necesitas invitación o clave.</p>
          </section>

          {/* Estrategia y errores comunes */}
          <section>
            <h2><span className="c1">Estrategias</span></h2>
            <ul>
              <li><strong>Abrir economía:</strong> 2-3 bases tempranas para estabilizar ingresos.</li>
              <li><strong>Alcance:</strong> Mejora una nave a intermedia pronto para saltos de 2.</li>
              <li><strong>Sinergias:</strong> Prioriza planetas que completen tus costos faltantes.</li>
              <li><strong>Tiempo:</strong> Construir base antes que el rival vale más que una mejora tardía.</li>
            </ul>
            <h3><span className="c1">Errores frecuentes</span></h3>
            <ul>
              <li>Construir nave sin poder usarla ese turno y sin plan de ruta.</li>
              <li>Olvidar que no se puede viajar a planetas con base.</li>
              <li>Quedarte sin recursos críticos para la siguiente ronda.</li>
            </ul>
          </section>

          {/* FAQ breve */}
          <section>
            <h2><span className="c1">Preguntas Frecuentes</span></h2>
            <ol>
              <li><strong>¿Puedo mover dos veces la misma nave?</strong> No; cada nave viaja una vez.</li>
              <li><strong>¿Puedo construir base sin nave?</strong> No; necesitas una nave en el planeta y que no haya base.</li>
              <li><strong>¿Qué pasa si sale 0 en el dado?</strong> No produces ese turno.</li>
              <li><strong>¿Se puede “quitar” un planeta?</strong> No; una vez con base, la propiedad no cambia.</li>
            </ol>
          </section>
        </div>
      </div>
    </section>
  );
}
