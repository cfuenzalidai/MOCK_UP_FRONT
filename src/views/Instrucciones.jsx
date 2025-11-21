import React from "react";

export default function Instrucciones() {
	return (
		<main className="instrucciones-root">
			<h1>Instrucciones</h1>

			<section>
				<h2>Requisitos</h2>
				<ul>
					<li>Node ≥ 20.19 o ≥ 22.12</li>
					<li>Yarn 4 (nodeLinker <code>node-modules</code> recomendado)</li>
				</ul>
			</section>

			<section>
				<h2>Setup rápido</h2>
				<pre className="code-block">
{`yarn
cp .env.example .env.local
# Edita .env.local si es necesario
yarn dev`}
				</pre>
			</section>

			<section>
				<h2>Scripts</h2>
				<ul>
					<li><code>yarn dev</code> → servidor de desarrollo</li>
					<li><code>yarn build</code> → build de producción en <code>dist/</code></li>
					<li><code>yarn preview</code> → previsualizar build</li>
				</ul>
			</section>

			<section>
				<h2>Variables de entorno</h2>
				<ul>
					<li><code>VITE_API_URL</code> → URL del backend (sin slash final)</li>
					<li><code>VITE_WS_URL</code> → URL de WebSocket (opcional por ahora)</li>
				</ul>
			</section>

			<p className="mt-18">
				Si quieres que esta vista aparezca en la navegación, importa este componente y añade una ruta
				en `App.jsx` o un enlace en `src/components/NavBar.jsx`.
			</p>
		</main>
	);
}
