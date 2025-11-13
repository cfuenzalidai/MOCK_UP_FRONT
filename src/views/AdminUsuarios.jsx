import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
    <div style={{ padding:24 }}>
      <h2>Administración - Usuarios</h2>
      {loading ? <p>Cargando...</p> : (
        <div style={{ maxWidth:900 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left', padding:8 }}>ID</th>
                <th style={{ textAlign:'left', padding:8 }}>Nombre</th>
                <th style={{ textAlign:'left', padding:8 }}>Email</th>
                <th style={{ textAlign:'left', padding:8 }}>Rol</th>
                <th style={{ textAlign:'right', padding:8 }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u=> (
                <tr key={u.id} style={{ borderTop:'1px solid #eee' }}>
                  <td style={{ padding:8 }}>{u.id}</td>
                  <td style={{ padding:8 }}>{u.nombre}</td>
                  <td style={{ padding:8 }}>{u.email}</td>
                  <td style={{ padding:8 }}>{u.rol || u.role}</td>
                  <td style={{ padding:8, textAlign:'right' }}>
                    <button style={{ marginRight:8 }} onClick={()=>{ /* editar no implementado */ }}>Editar</button>
                    <button className="danger" onClick={()=>openConfirm(u)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modalOverlay">
          <div className="modal">
            <h3>Confirmar eliminación</h3>
            <p>Ingresa tu contraseña de administrador para confirmar la eliminación de <strong>{target?.email}</strong>.</p>
            <input type="password" value={adminPassword} onChange={e=>setAdminPassword(e.target.value)} placeholder="Contraseña de administrador" />
            {error && <p style={{ color:'red' }}>{error}</p>}
            <div style={{ marginTop:12 }}>
              <button onClick={confirmDelete} className="danger">Confirmar eliminación</button>
              <button onClick={closeModal} style={{ marginLeft:8 }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modalOverlay{ position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; }
        .modal{ background:#fff; color:#111; padding:20px; border-radius:6px; width:420px; max-width:90%; box-shadow: 0 6px 24px rgba(0,0,0,0.4); }
        .modal h3{ margin-top:0; color:#111; }
        .modal p{ color:#333; }
        button.danger{ background:#d9534f; color:#fff; border:none; padding:8px 12px; border-radius:4px; }
        input{ width:100%; padding:8px; margin-top:8px; background:#fff; color:#111; border:1px solid #ccc; border-radius:4px }
        input::placeholder{ color:#888; }
      `}</style>
    </div>
  );
}
