import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/partidas-publicas.css';

export default function AdminUsuarios(){
  const { user, login } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      try{
        const res = await api.get('/usuarios');
        if(mounted) setUsers(res.data || []);
      }catch(e){
        console.error(e);
      }finally{ if(mounted) setLoading(false); }
    }
    load();
    return ()=> mounted = false;
  },[]);

  function openConfirm(u){ setTarget(u); setAdminPassword(''); setError(null); setShowModal(true); }
  function closeModal(){ setShowModal(false); setTarget(null); setError(null); }

  async function confirmDelete(){
    if(!target) return;
    setError(null);
    try{
      // Re-authenticate admin by logging in with current admin email + provided password
      // This will refresh token in storage via authService and context
      await login({ email: user.email, password: adminPassword });
    }catch(e){
      setError('Credenciales de administrador incorrectas');
      return;
    }

    try{
      await api.delete(`/usuarios/${target.id}`);
      setUsers(prev => prev.filter(u => u.id !== target.id));
      closeModal();
    }catch(e){
      console.error(e);
      setError(e?.response?.data?.error?.message || 'Error eliminando usuario');
    }
  }

  return (
    <section className="partidas hero">
      <div className="pp-board panel">
        <h2 className="pp-title">Administración - Usuarios</h2>

        {loading ? <p>Cargando...</p> : (
          <div className="admin-wrapper">
            <ul className="admin-list">
              {users.map(u => (
                <li key={u.id} className="admin-row">
                  <div className="admin-left">
                    <div className="name">{u.nombre || u.name || '—'}</div>
                    <div className="admin-meta">ID: {u.id} • {u.email} • Rol: {u.rol || u.role || '—'}</div>
                  </div>
                  <div>
                    <button className="secondary" onClick={()=>{ /* editar no implementado */ }}>Editar</button>
                    <button style={{ marginLeft:8 }} className="danger" onClick={()=>openConfirm(u)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showModal && (
          <div className="modalOverlay">
            <div className="modal">
              <h3>Confirmar eliminación</h3>
              <p>Ingresa tu contraseña de administrador para confirmar la eliminación de <strong>{target?.email}</strong>.</p>
              <input type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} placeholder="Contraseña de administrador" />
              {error && <p style={{ color:'red' }}>{error}</p>}
              <div className="modal-actions">
                <button onClick={confirmDelete} className="danger">Confirmar eliminación</button>
                <button onClick={closeModal} className="secondary">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
