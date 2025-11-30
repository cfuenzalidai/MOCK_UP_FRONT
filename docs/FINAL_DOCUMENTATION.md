# Documentación Final de la Aplicación

**Resumen**

Esta documentación cubre únicamente el frontend de la aplicación. Incluye:
- Modelo Entidad-Relación (vista del dominio que consume el frontend)
- Documentación de la API (endpoints que el frontend consume)
- README con herramientas y pasos para ejecutar el frontend localmente

---

**Modelo Entidad-Relación**

Esta sección muestra el modelo de datos en formato Markdown (entidades, atributos y relaciones).

Entidades y atributos

### USUARIO
- `id` (PK) : string
- `nombre` : string
- `email` : string
- `password_hash` : string
- `rol` : string

### PARTIDA
- `id` (PK) : string
- `estado` : string (ej.: `lobby`, `en_curso`, `finalizada`)
- `creadoEn` : datetime

### JUGADOR_EN_PARTIDA
- `id` (PK) : string
- `usuarioId` (FK → `USUARIO.id`) : string
- `partidaId` (FK → `PARTIDA.id`) : string
- `recursos` : int (resumen o referencia a recursos)
- `puntaje` : int
- `casa` : string (id o referencia a `CASA`)

### PLANETA
- `id` (PK) : string
- `nombre` : string
- `partidaId` (FK → `PARTIDA.id`) : string
- `propietarioJugadorEnPartidaId` (FK → `JUGADOR_EN_PARTIDA.id`) : string (opcional)

### BASE
- `id` (PK) : string
- `planetaId` (FK → `PLANETA.id`) : string
- `jugadorEnPartidaId` (FK → `JUGADOR_EN_PARTIDA.id`) : string
- `nivel` : int

### RECURSO
- `id` (PK) : string
- `nombre` : string

### NAVE
- `id` (PK) : string
- `partidaId` (FK → `PARTIDA.id`) : string
- `jugadorEnPartidaId` (FK → `JUGADOR_EN_PARTIDA.id`) : string
- `tipo` / `nivel` : string (ej.: `basica`, `intermedia`, `avanzada`)
- `estado` : string (ej.: `activa`, `usada`, `consumida`)
- `planetaId` (opcional): string

### TURNO
- `id` (PK) : string
- `partidaId` (FK → `PARTIDA.id`) : string
- `jugadorEnPartidaId` (FK → `JUGADOR_EN_PARTIDA.id`) : string
- `activo` : boolean

Relaciones (resumen)

- `USUARIO` (1) — (N) `JUGADOR_EN_PARTIDA`
- `PARTIDA` (1) — (N) `JUGADOR_EN_PARTIDA`
- `PARTIDA` (1) — (N) `PLANETA`
- `PLANETA` (1) — (N) `BASE`
- `JUGADOR_EN_PARTIDA` (1) — (N) `BASE`
- `JUGADOR_EN_PARTIDA` (1) — (N) `NAVE`
- `PARTIDA` (1) — (N) `TURNO`
- `RECURSO` (1) — (N) `JUGADOR_EN_PARTIDA` (cantidad/posee)

Breve explicación de entidades principales:
- `USUARIO`: datos del usuario (email, nombre, rol)
- `PARTIDA`: instancia del juego (estado: lobby, enCurso, finalizada)
- `JUGADOR_EN_PARTIDA`: unión entre usuario y partida; contiene recursos, casa, puntaje
- `PLANETA`/`BASE`/`NAVE`: elementos del tablero pertenecientes a jugadores
- `TURNO`: registro de turno activo por partida

---

**Documentación de la API**

Notas generales:
- El frontend usa `src/services/api.js` que configura `axios` con `baseURL` tomado de `import.meta.env.VITE_API_URL`.
- La mayoría de endpoints requieren token Bearer en `Authorization` (se guarda en `localStorage` como `token`).

Rutas públicas (autenticación no obligatoria):

- POST `/signup`
  - Descripción: Registra un nuevo usuario.
  - Body: `{ nombre?, email, password, ... }`
  - Respuesta: datos del usuario creado (probablemente sin token)

- POST `/login`
  - Descripción: Autentica un usuario.
  - Body: `{ email, password }`
  - Respuesta esperada: `{ access_token, user }` (el frontend guarda `access_token` en `localStorage`)

Rutas relacionadas con usuarios:

- GET `/usuarios/:id`
  - Descripción: Obtener datos del usuario.
  - Auth: Bearer

- PUT `/usuarios/:id`
  - Descripción: Actualizar perfil de usuario.
  - Body: campos a actualizar (nombre, etc.)

- POST `/usuarios/:id/password`
  - Descripción: Cambiar contraseña (requiere cuerpo con contraseña actual y nueva).
  - Body: `{ currentPassword, newPassword }`
  - Nota: `src/services/auth.js` añade `X-Suppress-Logout` para suprimir logout automático en 401 en este endpoint.

Rutas de `partidas` (juego):

- POST `/partidas`
  - Descripción: Crear nueva partida (lobby).
  - Auth: Bearer

- PUT `/partidas/:id/iniciar`
  - Descripción: Cambiar estado de partida a iniciada.

- PUT `/partidas/:id/cambiarTurno`
  - Descripción: Forzar cambio de turno.

- GET `/partidas/:id/turnoActual`
  - Descripción: Obtener el turno activo de la partida.

- GET `/partidas/:id/puntajes`
  - Descripción: Obtener puntajes de la partida.

- GET `/partidas/:id/jugadores`
  - Descripción: Listar jugadores de la partida.

- GET `/partidas/:id/obtenerBases`
  - Descripción: Obtener bases dentro de la partida.

- GET `/partidas/:id/obtenerPlanetas`
  - Descripción: Obtener planetas de la partida.

- POST `/partidas/:partidaId/:jugadorId/recoleccion`
  - Descripción: Ejecutar acción de recolección para un jugador en la partida.

- POST `/partidas/:partidaId/:jugadorEnPartidaId/:planetaId/construirBase`
  - Descripción: Construir una base en un planeta para un jugador.

Otros endpoints relevantes:

- POST `/tirodados`
  - Descripción: Lanza un dado para un turno.
  - Body: `{ turnoId }`

- GET `/recursos`
  - Descripción: Devuelve tipos de recursos disponibles.

- GET `/jugadoresenpartidas/:jugadorEnPartidaId/recursos`
  - Descripción: Devuelve recursos del jugador en la partida.

- GET `/naves?partidaId=&jugadorEnPartidaId=`
  - Descripción: Devuelve naves filtradas por query string.

Notas y convenciones:
- Muchas funciones del frontend intentan normalizar formas de respuesta (arrays directos, `{ data: [...] }`, `{ jugadores: [...] }`) — la API puede devolver distintas formas; la capa cliente gestiona eso.
- Código HTTP esperado: 200/201 para éxito, 401 para token inválido (el frontend debería manejar logout si ocurre), 404/405 usado como "endpoint no disponible" en algunos fallbacks.

---

**README (Herramientas y pasos para ejecutar la aplicación frontend)**

**Herramientas**
- Node.js (recomendado v16+)
- Yarn
- Vite (ya configurado en `package.json`)
- React
- Axios

Pasos para ejecutar en desarrollo (frontend):

1. Clonar el repositorio:

```bash
git clone <repo-url>
cd Frontenders_front_252s2
```

2. Instalar dependencias (Yarn):

```bash
yarn
```

3. Configurar la URL del backend

Crear un archivo `.env` en la raíz con la variable:

```
VITE_API_URL=http://localhost:3000
```

4. Ejecutar en modo desarrollo:

```bash
yarn start
```

5. Para build de producción:

```bash
yarn build
yarn preview
```

Notas:
- El frontend usa `localStorage` para guardar el `token` (clave `token`).
- Si el backend está en otra ruta (por ejemplo `/api`), ajuste `VITE_API_URL` como `http://mi-backend:3000/api`.

---

**Archivos relevantes en este repositorio**

- `src/services/api.js`: configuración de Axios y `VITE_API_URL`.
- `src/services/auth.js`, `src/services/juego.jsx`: funciones que muestran los endpoints usados.
- `index.html`, `vite.config.js`, `package.json`: configuración de build y scripts.

---



**Ejemplos de request / response (endpoints detectados)**
Notas: todos los ejemplos asumen que el `baseURL` configurado en `VITE_API_URL` apunta al backend. Cuando se requiere autenticación, incluir header `Authorization: Bearer <token>`.

- POST `/login`
  - Headers: `Content-Type: application/json`
  - Body:
    ```json
    { "email": "alguien@example.com", "password": "secreto" }
    ```
  - Respuesta 200:
    ```json
    { "access_token": "jwt.token.aqui", "user": { "id": 1, "email": "alguien@example.com", "nombre": "Alguien" } }
    ```

- POST `/signup`
  - Body (ejemplo):
    ```json
    { "nombre": "Nuevo", "email": "nuevo@example.com", "password": "123456" }
    ```
  - Respuesta 201:
    ```json
    { "id": 42, "email": "nuevo@example.com", "nombre": "Nuevo" }
    ```

- GET `/usuarios` (admin)
  - Headers: `Authorization: Bearer <token>`
  - Respuesta 200: arreglo de usuarios
    ```json
    [ { "id": 1, "email": "a@a.com", "nombre": "A" }, { "id": 2, "email": "b@b.com" } ]
    ```

- GET `/usuarios/:id`
  - Respuesta 200:
    ```json
    { "id": 1, "email": "a@a.com", "nombre": "A", "rol": "user" }
    ```

- PUT `/usuarios/:id`
  - Body ejemplo:
    ```json
    { "nombre": "Nuevo Nombre" }
    ```
  - Respuesta 200: usuario actualizado

- POST `/usuarios/:id/password`
  - Body:
    ```json
    { "currentPassword": "vieja", "newPassword": "nueva" }
    ```
  - Respuesta 200: `{ "ok": true }` o mensaje de éxito

- DELETE `/usuarios/:id`
  - Headers: `Authorization: Bearer <admin-token>`
  - Respuesta 204: sin contenido

- GET `/partidas`
  - Respuesta 200: lista de partidas
    ```json
    [ { "id": 10, "nombre": "Partida 1", "jugadores": 2, "max": 4 }, ... ]
    ```

- POST `/partidas`
  - Body ejemplo (opcional según backend): `{ "nombre": "Mi partida", "max": 4 }`
  - Respuesta 201: partida creada

- DELETE `/partidas/:id`
  - Respuesta 204

- POST `/partidas/:id/unirse`
  - Headers: `Authorization: Bearer <token>`
  - Respuesta 200/201: confirma unión o retorna error con código `FULL` o `ALREADY_JOINED`.

- GET `/partidas/:id`
  - Respuesta 200: detalles de la partida (owner, estado, tamMax/max, etc.)

- GET `/partidas/:id/jugadores`
  - Respuesta 200: objeto o arreglo; cliente normaliza varias formas. Ejemplo:
    ```json
    { "jugadores": [ { "id": 5, "usuarioId": 2, "listo": false, "casa": 1 }, ... ] }
    ```

- PUT `/partidas/:id/iniciar`
  - Inicia la partida; respuesta 200 o 409 si ya iniciada.

- PUT `/partidas/:id/cambiarTurno`
  - Forzar cambio de turno; respuesta 200

- GET `/partidas/:id/turnoActual`
  - Respuesta 200: `{ "id": 123, "jugadorEnPartidaId": 5, "activo": true }`

- GET `/partidas/:id/puntajes`
  - Respuesta 200: `[ { "nombre": "Player", "puntaje": 3 }, ... ]`

- GET `/partidas/:id/obtenerBases`
  - Respuesta 200: arreglo de bases: `[ { "id": 1, "planetaId": 12, "jugadorEnPartidaId": 5 }, ... ]`

- GET `/partidas/:id/obtenerPlanetas`
  - Respuesta 200: arreglo de planetas con campos como `id`, `idxTablero`, `mapaId`, `nombre`.

- POST `/partidas/:partidaId/:jugadorId/recoleccion`
  - Descripción: cálculo de recolección; respuesta 200: `{ "Especia": 2, "Metal": 1 }` o detalle similar.

- POST `/partidas/:partidaId/:jugadorEnPartidaId/:planetaId/construirBase`
  - Construye una base; respuesta 200: objeto base creado o 4xx en caso de error.

- POST `/jugadas`
  - Usado para enviar acciones del juego (construir_nave, mejorar_nave, usar_nave, etc.).
  - Body ejemplo:
    ```json
    {
      "partidaId": 10,
      "turnoId": 123,
      "actorId": 5,
      "tipo": "construir_nave",
      "payload": { }
    }
    ```
  - Respuesta 200: `{ "resultado": { ... }, "mensaje": "Acción ejecutada" }`

- POST `/tirodados`
  - Body: `{ "turnoId": 123 }`
  - Respuesta 200: `{ "tiro": { "valor": 4 }, "recursos": [ { "recursoId": 1, "cantidad": 2 } ] }`

- GET `/recursos`
  - Respuesta 200: listado de tipos de recursos: `[ { "id": 1, "nombre": "Especia" }, ... ]`

- GET `/jugadoresenpartidas` (con params)
  - Ejemplo: `/jugadoresenpartidas?usuarioId=2`
  - Respuesta 200: arreglo de registros de jugador-en-partida

- DELETE `/jugadoresenpartidas/:id`
  - Expulsar o abandonar; respuesta 200/204

- PUT `/jugadoresenpartidas/:id`
  - Actualiza campos como `{ "listo": true }`; respuesta 200: registro actualizado

- GET `/jugadoresenpartidas/:jugadorEnPartidaId/recursos`
  - Respuesta 200: arreglo de recursos con campos `recursoId`, `cantidad` o estructuras anidadas.

- GET `/naves?partidaId=&jugadorEnPartidaId=`
  - Respuesta 200: arreglo de naves con `id`, `nivel`, `estado`, `planetaId`.

- GET `/casas`
  - Respuesta 200: `{ "casas": [ { "id": 1, "nombre": "Casa A" }, ... ] }` o un arreglo directo.

- GET `/planetasvecinos?mapaId=`
  - Devuelve relaciones entre planetas para calcular alcance; forma esperada: arreglo de aristas `{ "planetaId": 1, "vecinoId": 2 }`.
