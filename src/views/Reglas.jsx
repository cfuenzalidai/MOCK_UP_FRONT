import React from "react";
import '../assets/styles/nosotros.css';
import '../assets/styles/reglas.css';

export default function Reglas() {
  return (
    <section className="hero nosotros">
      <div className="nos-board">
        <h1 className="nos-title">Reglas</h1>

        <div className="nos-desc">
          <section>
            <h2>
              <span className="c1">Tipo de juego</span>
            </h2>
            <p>
              <span className="c2">Conquista</span> de territorios.
            </p>
          </section>

          <section>
            <h2>
              <span className="c1">Objetivo</span>
            </h2>
            <p>
              Los jugadores deberán elegir qué <span className="c2">planetas</span> habitar
              inicialmente para así hacerse camino por la galaxia, habitando nuevos
              planetas y quedándose con sus <span className="c3">recursos</span>. El
              primero que llega obtiene el recurso del planeta. Los jugadores deberán
              planear la expansión de sus <span className="c4">casas</span> a otros
              planetas, llegando antes que las demás y acumulando la mayor cantidad de
              territorios posible.
            </p>
          </section>

          <section>
            <h2>
              <span className="c1">Tablero</span>
            </h2>
            <p>
              El tablero consiste de <span className="c2">24 triángulos</span>, cada
              uno representa un planeta.
            </p>
          </section>

          <section>
            <h2>
              <span className="c1">Entidades del juego</span>
            </h2>
            <ol>
              <li>
                <strong>
                  <span className="c2">Casas:</span>
                </strong>{' '}
                Cada jugador pertenece a una casa: Atryd, Hark, Fen, Frem, Raad y Rino.
              </li>

              <li>
                <strong>
                  <span className="c2">Planetas:</span>
                </strong>{' '}
                Cada casilla está representada por un planeta que tendrá uno o dos
                recursos. Cada casa tiene su planeta de origen (uno solo). Esto no
                cambia durante la partida.
              </li>

              <li>
                <strong>
                  <span className="c2">Recursos:</span>
                </strong>{' '}
                Cada planeta entrega entre 1 o 2 recursos: <span className="c3">Especia</span>,{' '}
                <span className="c3">Metal</span>, <span className="c3">Agua</span> y{' '}
                <span className="c3">Liebres</span>. Estos recursos son necesarios
                para desarrollar las casas: construir naves, mejorarlas y construir
                bases consume recursos. La cantidad de cada recurso es limitada.
              </li>

              <li>
                <strong>
                  <span className="c2">Naves:</span>
                </strong>{' '}
                Sirven para viajar desde el planeta de origen a otros planetas no
                conquistados. Las naves tienen niveles:
                <ul>
                  <li>
                    <span className="c4">Nivel básico:</span> sólo pueden llegar a
                    planetas vecinos (casillas adyacentes).
                  </li>
                  <li>
                    <span className="c4">Nivel intermedio:</span> pueden llegar hasta
                    dos planetas de distancia (puede pasar dos casillas, sin contar la
                    inicial).
                  </li>
                  <li>
                    <span className="c4">Nivel avanzado:</span> puede llegar a cualquier
                    planeta de la galaxia.
                  </li>
                </ul>
                Todas las naves empiezan desde el planeta de origen y sólo pueden
                viajar una vez; los viajes solo pueden ser a territorios sin bases.
              </li>

              <li>
                <strong>
                  <span className="c2">Base:</span>
                </strong>{' '}
                Se construyen en planetas y son necesarias para explotar recursos. Sin
                base, nadie recibe recursos del planeta. Cuando un jugador tiene una
                base en un planeta, recibirá todos los recursos que el planeta tenga:
                si el planeta tiene un recurso, la base entregará dos unidades; si tiene
                dos recursos, entregará una unidad de cada uno.
              </li>

              <li>
                <strong>
                  <span className="c2">Dado de eficiencia:</span>
                </strong>{' '}
                Dado de 4 caras que afecta la producción del imperio: puede resultar en
                <code>x1</code> (producción normal), <code>x2</code> (dobla la
                producción) o <code>x0</code> (detiene la producción).
              </li>
            </ol>
          </section>

          <section>
            <h2>
              <span className="c1">Reglas</span>
            </h2>
            <ol>
              <li>
                <strong>Previo al juego:</strong>
                <ol>
                  <li>
                    Apogeo requiere mínimo <span className="c2">3 jugadores</span> y
                    máximo <span className="c2">6</span>. Cada jugador lidera una casa.
                  </li>
                  <li>
                    En orden al azar, cada jugador elige un <span className="c3">planeta
                    de origen</span>. Luego se hace otra ronda donde eligen un segundo
                    planeta; ambos contarán con bases desde el inicio.
                  </li>
                  <li>
                    Se le otorgará a cada jugador dos <span className="c4">naves</span> de
                    nivel básico y una <span className="c4">base</span>; podrán decidir
                    cómo usarlas en sus turnos.
                  </li>
                </ol>
              </li>

              <li>
                <strong>Inicio:</strong>
                <ol>
                  <li>
                    En la primera ronda no se repartirán recursos, pero los jugadores
                    pueden usar naves y/o bases; luego de la primera ronda se empezarán a
                    repartir recursos al jugador de turno al inicio de este.
                  </li>
                  <li>
                    Al inicio del turno, el jugador debe lanzar el dado de eficiencia. Si
                    no hay cartas suficientes para suplir la producción, recibirá sólo las
                    que queden disponibles.
                  </li>
                  <li>
                    Cada jugador busca obtener la mayor cantidad de recursos para expandir
                    su territorio y proclamar la victoria al alcanzar la meta de planetas.
                  </li>
                  <li>
                    Durante el turno, el jugador puede usar una nave para llegar a un
                    nuevo planeta y luego construir una base para explotarlo. Sólo puede
                    haber una base por planeta. El planeta no tiene dueño hasta que una
                    casa con una nave construya una base; cuando esto ocurra, todas las
                    naves presentes desaparecen.
                  </li>
                  <li>
                    Un jugador sólo puede conquistar planetas que no pertenezcan a otra
                    casa; la propiedad se mantiene hasta el final de la partida y queda
                    definida cuando se construye una base.
                  </li>
                  <li>
                    En su turno, el jugador puede armar naves, mejorarlas, usarlas y/o
                    construir bases en planetas donde tenga naves. No hay límite para
                    estas acciones (más allá de recursos y reglas de uso).
                  </li>
                </ol>
              </li>

              <li>
                <strong>Construcciones y Uso:</strong>
                <ol>
                  <li>Todas las construcciones y mejoras consumen recursos (vuelven al banco).</li>
                  <li>
                    Para construir una base:{' '}
                    <span className="c3">1 Metal, 2 Agua y 2 Liebres</span>. Las bases
                    se construyen de inmediato en el planeta correspondiente y sólo si el
                    jugador tiene una nave en un planeta sin base.
                  </li>
                  <li>
                    Para construir una nave:{' '}
                    <span className="c3">1 Especia, 1 Metal y 1 Agua</span>. Las naves
                    siempre empiezan siendo de nivel básico. Las naves no pueden usarse el
                    mismo turno en que son construidas; sus viajes empiezan desde el
                    planeta de origen y nunca pueden viajar a un planeta con base ya
                    construida.
                  </li>
                  <li>
                    Para mejorar una nave (básico → intermedio o intermedio → avanzado):{' '}
                    <span className="c3">1 Especia y 1 Metal</span>. Las naves no pueden
                    usarse en el mismo turno que fueron mejoradas.
                  </li>
                </ol>
              </li>

              <li>
                <strong>Turnos:</strong>
                <p>
                  Al inicio del turno se lanza el dado de eficiencia; según el resultado
                  y las bases del jugador recibirá recursos. Luego podrá construir,
                  evolucionar y usar naves, además de construir bases.
                </p>
              </li>

              <li>
                <strong>Fin del juego:</strong>
                <p>
                  Una vez que un jugador conquiste una cantidad de planetas insuperable,
                  su casa gana. Por ejemplo, con 3 jugadores y 24 planetas, la primera casa
                  en tener 9 planetas se llevaría la victoria.
                </p>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </section>
  );
}