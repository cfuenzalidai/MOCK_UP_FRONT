# Frontenders — Entrega 3 (Frontend)

URL Netlify: https://apogeo.netlify.app/

## Resumen

Este README describe las herramientas usadas por el frontend y todos los pasos necesarios para ejecutar la aplicación localmente (instalación, configuración de variables de entorno, desarrollo y build). Se asume que el backend está disponible y que su URL se configura en `VITE_API_URL`.

## Credenciales (ambiente de demo)
- **Admin**
    - email: `magdadmin@demo.cl`
    - password: `soyadmin123`
- **Owner**
    - email: `owner@demo.cl`
    - password: `123456`
- **Jugador**
    - email: `a@demo.cl` o `b@demo.cl` o `c@demo.cl`
    - password: `123456`

## Herramientas usadas
- Node.js (requisitos mínimos según proyecto)
- Yarn (recomendado: Yarn 4 con `nodeLinker: node-modules`)
- Vite (bundler / dev server)
- React (biblioteca UI)
- Axios (cliente HTTP)

## Requisitos
- Node.js: versión moderna (en este repo se recomienda Node ≥ 20.19 o ≥ 22.12; usa la versión que prefieras en tu entorno).
- Yarn: se recomienda Yarn 4 (si usas Yarn 4, configurar `nodeLinker: node-modules` es aconsejable para compatibilidad tradicional).

## Setup rápido (Yarn)

1. Clona el repositorio:

```bash
git clone <repo-url>
cd Frontenders_front_252s2
```

2. Instala dependencias (Yarn):

```bash
yarn
```

3. Configura variables de entorno:

```bash
cp .env.example .env.local
# Edita .env.local según corresponda (p. ej. VITE_API_URL)
```

4. Inicia la aplicación en modo desarrollo (comando preferido):

```bash
yarn start
```

Nota: si tu `package.json` solo define `dev` (p. ej. `yarn dev`), puedes usar `yarn dev`. Recomendamos añadir un script `start` que lance `vite` en modo desarrollo para un flujo más estándar.

5. Build de producción y preview:

```bash
yarn build
yarn preview
```

## Scripts (esperados)

- `yarn start` → iniciar servidor de desarrollo (preferido)
- `yarn dev` → (alternativa si existe)
- `yarn build` → generar build de producción en `dist/`
- `yarn preview` → previsualizar el build

Si tu `package.json` no contiene `start`, añade una entrada como:

```json
"scripts": {
    "start": "vite",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
}
```

## Variables de entorno

- `VITE_API_URL` → URL del backend (sin slash final), por ejemplo: `http://localhost:3000`
- `VITE_WS_URL` → URL del WebSocket (opcional)

Ejemplo mínimo en `.env.local`:

```
VITE_API_URL=http://localhost:3000
```

## Errores de autenticación (login / registro)

Validación cliente:
- Nombre: mínimo 2 caracteres.
- Email: debe tener formato válido.
- Contraseña: mínimo 6 caracteres.

Errores esperados desde el backend (JSON con `error.code` o `error.message`):
- `EMAIL_TAKEN` (409 / 400): el email ya está registrado → mostrar "El email ya está registrado".
- `INVALID_CREDENTIALS` (401): credenciales inválidas → mostrar "Email o contraseña incorrectos".
- `VALIDATION_ERROR` (400): datos inválidos → mostrar el mensaje proporcionado por el servidor.
- `NOT_FOUND` / `UNAUTHORIZED` / `FORBIDDEN` → errores de acceso/permiso mostrados tal cual.

Formato de error esperado (ejemplo):

```json
{
    "error": {
        "code": "EMAIL_TAKEN",
        "message": "El usuario con email xxx ya existe"
    }
}
```

## Notas y recomendaciones
- El frontend guarda el token JWT en `localStorage` bajo la clave `token`.
- Asegúrate de que `VITE_API_URL` apunte a la URL correcta del backend antes de ejecutar la aplicación.
- Para entornos de CI/CD o despliegue estático (Netlify, Vercel), ajusta `VITE_API_URL` en las variables de entorno del servicio.