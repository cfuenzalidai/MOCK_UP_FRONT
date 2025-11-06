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

