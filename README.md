# Frontenders — Entrega 3

## Requisitos
- Node ≥ 20.19 o ≥ 22.12
- Yarn 4 (nodeLinker `node-modules` recomendado)

## Setup rápido
```bash
yarn
cp .env.example .env.local
# Edita .env.local si es necesario
yarn dev
```

## Scripts
- `yarn dev` → servidor de desarrollo
- `yarn build` → build de producción en `dist/`
- `yarn preview` → previsualizar build

## Variables de entorno
- `VITE_API_URL` → URL del backend (sin slash final)
- `VITE_WS_URL` → URL de WebSocket (opcional por ahora)

## Errores de autenticación (login / registro)

Validación cliente:
- Nombre: mínimo 2 caracteres.
- Email: debe tener formato válido (contener `@` y dominio).
- Contraseña: mínimo 6 caracteres.

Errores esperados desde el backend (JSON con `error.code` o `error.message`):
- `EMAIL_TAKEN` (409 / 400): el email ya está registrado → mostramos "El email ya está registrado".
- `INVALID_CREDENTIALS` (401): credenciales inválidas → mostramos "Email o contraseña incorrectos".
- `VALIDATION_ERROR` (400): datos inválidos → mostramos el mensaje proporcionado por el servidor.
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