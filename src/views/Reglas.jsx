import React from "react";

export default function Reglas() {
  return (
    <main style={{ maxWidth: 900, margin: "24px auto" }}>
      <div className="rules-block">

      <section>
        <h2>Tipo de juego</h2>
        <p>Conquista de territorios.</p>
      </section>

      <section>
        <h2>Objetivo</h2>
        <p>
          Los jugadores deberán elegir qué planetas habitar inicialmente para así hacerse
          camino por la galaxia, habitando nuevos planetas y quedándose con sus recursos,
          donde el primero que llega es quien se lo queda. Así tendrán que planear la
          expansión de sus casas a otros planetas, llegando a cada lugar antes que las
          otras y hacerse con la mayor cantidad de territorios posibles.
        </p>
      </section>

      <section>
        <h2>Tablero</h2>
        <p>
          El tablero consiste de 48 triángulos, cada uno representa un planeta.
        </p>
      </section>

      <section>
        <h2>Entidades del juego</h2>
        <ol>
          <li>
            <strong>Casas:</strong> Cada jugador pertenece a una casa: Atryd, Hark, Fen, Frem,
            Raad y Rino.
          </li>
          <li>
            <strong>Planetas:</strong> Cada casilla está representada por un planeta, que tendrá uno o dos
            recursos. Cada casa tiene su planeta de origen (uno solo). Esto no cambia durante la partida.
          </li>
          <li>
            <strong>Recursos:</strong> Cada planeta entrega entre 1 o 2 recursos: Especia, Metal, Agua y Liebres.
            Estos recursos son necesarios para el desarrollo de las casas; construir naves, mejorarlas y bases consume recursos.
            Hay una cantidad limitada de cada recurso.
          </li>
          <li>
            <strong>Naves:</strong> Sirven para viajar desde el planeta de origen a otros planetas no conquistados.
            Las naves tienen niveles:
            <ul>
              <li>Nivel básico: sólo pueden llegar a planetas vecinos (casillas adyacentes).</li>
              <li>Nivel intermedio: pueden llegar hasta dos planetas de distancia (puede pasar dos casillas, sin contar la inicial).</li>
              <li>Nivel avanzado: puede llegar a cualquier planeta de la galaxia.</li>
            </ul>
            Todas las naves empiezan desde el planeta de origen y solo pueden viajar una vez; los viajes solo pueden ser a territorios sin bases.
          </li>
          <li>
            <strong>Base:</strong> Se construyen en planetas y son necesarias para explotar recursos. Sin base, nadie recibe recursos del planeta.
            Cuando un jugador tiene una base en un planeta, recibirá todos los recursos que el planeta tenga:
            si el planeta tiene un recurso, la base entregará dos unidades; si tiene dos recursos, entregará una unidad de cada uno.
          </li>
          <li>
            <strong>Dado de eficiencia:</strong> Dado de 4 caras que afecta la producción del imperio: puede resultar en
            <code>x1</code> (producción normal), <code>x2</code> (dobla la producción) o <code>x0</code> (detiene la producción).
          </li>
        </ol>
      </section>

      <section>
        <h2>Reglas</h2>
        <ol>
          <li>
            <strong>Previo al juego:</strong>
            <ol>
              <li>Apogeo requiere mínimo 3 jugadores y máximo 6. Cada jugador lidera una casa.</li>
              <li>En orden al azar, cada jugador elige un planeta de origen. Luego se hace otra ronda donde eligen un segundo planeta; ambos contarán con bases desde el inicio.</li>
              <li>Se le otorgará a cada jugador dos naves de nivel básico y una base; podrán decidir cómo usarlas en sus turnos.</li>
            </ol>
          </li>

          <li>
            <strong>Inicio:</strong>
            <ol>
              <li>En la primera ronda no se repartirán recursos, pero los jugadores pueden usar naves y/o bases; luego de la primera ronda se empezarán a repartir recursos al jugador de turno al inicio de este.</li>
              <li>Al inicio del turno, el jugador debe lanzar el dado de eficiencia. Si no hay cartas suficientes para suplir la producción, recibirá sólo las que queden disponibles.</li>
              <li>Cada jugador busca obtener la mayor cantidad de recursos para expandir su territorio y proclamar la victoria al alcanzar la meta de planetas.</li>
              <li>Durante el turno, el jugador puede usar una nave para llegar a un nuevo planeta y luego construir una base para explotarlo. Solo puede haber una base por planeta. El planeta no tiene dueño hasta que una casa con una nave construya una base; cuando esto ocurra, todas las naves presentes desaparecen.</li>
              <li>Un jugador solo puede conquistar planetas que no pertenezcan a otra casa; la propiedad se mantiene hasta el final de la partida y queda definida cuando se construye una base.</li>
              <li>En su turno, el jugador puede armar naves, mejorarlas, usarlas y/o construir bases en planetas donde tenga naves. No hay límite para estas acciones (más allá de recursos y reglas de uso).</li>
            </ol>
          </li>

          <li>
            <strong>Construcciones y Uso:</strong>
            <ol>
              <li>Todas las construcciones y mejoras consumen recursos (vuelven al banco).</li>
              <li>Para construir una base: 1 Metal, 2 Agua y 2 Liebres. Las bases se construyen de inmediato en el planeta correspondiente y sólo si el jugador tiene una nave en un planeta sin base.</li>
              <li>Para construir una nave: 1 Especia, 1 Metal y 1 Agua. Las naves siempre empiezan siendo de nivel básico. Las naves no pueden usarse el mismo turno en que son construidas; sus viajes empiezan desde el planeta de origen y nunca pueden viajar a un planeta con base ya construida.</li>
              <li>Para mejorar una nave (básico → intermedio o intermedio → avanzado): 1 Especia y 1 Metal. Las naves no pueden usarse en el mismo turno que fueron mejoradas.</li>
            </ol>
          </li>

          <li>
            <strong>Turnos:</strong>
            <p>
              Al inicio del turno se lanza el dado de eficiencia; según el resultado y las bases del jugador recibirá recursos. Luego podrá construir, evolucionar y usar naves, además de construir bases.
            </p>
          </li>

          <li>
            <strong>Fin del juego:</strong>
            <p>
              Una vez que un jugador conquiste una cantidad de planetas insuperable, su casa gana. Por ejemplo, con 3 jugadores y 48 planetas, la primera casa en tener 17 planetas se llevaría la victoria.
            </p>
          </li>
        </ol>
      </section>
      </div>
    </main>
  );
}
