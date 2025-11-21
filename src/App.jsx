import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './views/Home';
import Instrucciones from './views/Instrucciones';
import Nosotros from './views/Nosotros';
import Login from './views/Login';
import Registro from './views/Registro';
import CreatePartida from './views/CreatePartida';
import Partida from './views/Partida';
import EditProfile from './views/EditProfile';
import ChangePassword from './views/ChangePassword';
import Reglas from './views/Reglas';
import ProtectedRoute from './routes/ProtectedRoute';
import PartidasPublicas from './views/PartidasPublicas';
import AdminRoute from './routes/AdminRoute';
import AdminUsuarios from './views/AdminUsuarios';
import AdminPartidas from './views/AdminPartidas';

function Placeholder({ title }) { return <div className="view-root"><h2>{title}</h2></div>; }

function AppContent(){
  const location = useLocation();
  const hideFooterOn = [];
  const showFooter = !hideFooterOn.includes(location.pathname);

  return (
    <div className="app">
      <AuthProvider>
        <NavBar />
        <div className="main">
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/como-jugar" element={<Instrucciones />} />
              <Route path="/reglas" element={<Reglas />} />
              <Route path="/partidas" element={<Partida />} />
              <Route path="/partidas/:partidaId" element={<Partida />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/partidas-publicas" element={<PartidasPublicas/>} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/partidas/nueva" element={<ProtectedRoute><CreatePartida /></ProtectedRoute>} />
              <Route path="/usuario/editar" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/usuario/clave" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios/></AdminRoute>} />
              <Route path="/admin/partidas" element={<AdminRoute><AdminPartidas/></AdminRoute>} />
              <Route path="/config" element={<Placeholder title="Configuración" />} />
            </Routes>
          </div>
          {showFooter && <Footer />}
        </AuthProvider>
      </div>
    );
  }

  export default function App(){
    return (
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    );
  }
  
