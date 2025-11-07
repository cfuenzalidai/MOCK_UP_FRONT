import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './views/Home';

function Placeholder({ title }) { return <div style={{ padding:24 }}><h2>{title}</h2></div>; }

export default function App(){
  return (
    <BrowserRouter>
      <div className="app">
        <AuthProvider>
          <NavBar />
          <div className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/como-jugar" element={<Placeholder title="Cómo Jugar" />} />
              <Route path="/reglas" element={<Placeholder title="Reglas" />} />
              <Route path="/partidas" element={<Placeholder title="Partidas Públicas" />} />
              <Route path="/login" element={<Placeholder title="Ingresar" />} />
              <Route path="/registro" element={<Placeholder title="Registro" />} />
              <Route path="/partidas/nueva" element={<Placeholder title="Crear Partida" />} />
              <Route path="/usuario/editar" element={<Placeholder title="Editar Usuario" />} />
              <Route path="/usuario/clave" element={<Placeholder title="Cambiar contraseña" />} />
              <Route path="/config" element={<Placeholder title="Configuración" />} />
            </Routes>
          </div>
          <Footer />
        </AuthProvider>
      </div>
    </BrowserRouter>
  );
}
  
