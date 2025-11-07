import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './views/Home';

function Placeholder({ title }){ return <div style={{padding:24}}><h2>{title}</h2></div>; }

export default function App(){
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* futuras páginas */}
        <Route path="/como-jugar" element={<Placeholder title="Cómo Jugar" />} />
        <Route path="/reglas" element={<Placeholder title="Reglas" />} />
        <Route path="/partidas" element={<Placeholder title="Partidas Públicas" />} />
        <Route path="/login" element={<Placeholder title="Ingresar" />} />
        <Route path="/registro" element={<Placeholder title="Registro" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
