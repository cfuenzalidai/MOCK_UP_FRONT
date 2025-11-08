import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './views/Home';
import Login from './views/Login';
import Registro from './views/Registro';
import CreatePartida from './views/CreatePartida';
import EditProfile from './views/EditProfile';
import ChangePassword from './views/ChangePassword';
import ProtectedRoute from './routes/ProtectedRoute';

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
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/partidas/nueva" element={<ProtectedRoute><CreatePartida /></ProtectedRoute>} />
              <Route path="/usuario/editar" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/usuario/clave" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
              <Route path="/config" element={<Placeholder title="Configuración" />} />
            </Routes>
          </div>
          <Footer />
        </AuthProvider>
      </div>
    </BrowserRouter>
  );
}
  
