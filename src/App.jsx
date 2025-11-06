import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return <h1>Frontenders</h1>;
}

function Instrucciones() {
  return <h2>Instrucciones</h2>;
}

function Nosotros() {
  return <h2>Nosotros</h2>;
}

function Partida() {
  return <h2>Partida</h2>;
}

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, display: 'flex', gap: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Inicio</Link>
        <Link to="/instrucciones">Instrucciones</Link>
        <Link to="/nosotros">Nosotros</Link>
        <Link to="/partida">Partida</Link>
      </nav>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/instrucciones" element={<Instrucciones />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/partida" element={<Partida />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
