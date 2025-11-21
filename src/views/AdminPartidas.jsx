import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/partidas-publicas.css';

export default function AdminPartidas(){
  const { user, login } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      try{
        const res = await api.get('/partidas');
        if(mounted) setItems(res.data || []);
      }catch(e){ console.error(e); }
      finally{ if(mounted) setLoading(false); }
    }
    load();
    return ()=> mounted = false;
  },[]);

  function openConfirm(p){ setTarget(p); setAdminPassword(''); setError(null); setShowModal(true); }
  function closeModal(){ setShowModal(false); setTarget(null); setError(null); }

  async function confirmDelete(){
    if(!target) return;
    setError(null);
    try{
      await login({ email: user.email, password: adminPassword });
    }catch(e){ setError('Credenciales de administrador incorrectas'); return; }

    try{
      await api.delete(`/partidas/${target.id}`);
      setItems(prev => prev.filter(p => p.id !== target.id));
      closeModal();
    }catch(e){ console.error(e); setError(e?.response?.data?.error?.message || 'Error eliminando partida'); }
  }

  return (
    <section className="partidas hero">
      <div className="pp-board panel">
        <h2 className="pp-title">Administración - Partidas</h2>

        {loading ? <p>Cargando...</p> : (
          <div className="admin-wrapper">
            <ul className="admin-list">
              {items.map(p => (
                <li key={p.id} className="admin-row">
                  <div className="admin-left">
                    <div className="name">{p.nombre || p.name || '—'}</div>
                    <div className="admin-meta">ID: {p.id} • Owner: {p.ownerId || (p.owner && p.owner.email) || '—'} • Estado: {p.estado || p.status || '—'}</div>
                  </div>
                  <div>
                    <button className="secondary" onClick={()=>{ /* editar no implementado */ }}>Editar</button>
                    <button style={{ marginLeft:8 }} className="danger" onClick={()=>openConfirm(p)}>Eliminar</button>
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
              <p>Ingresa tu contraseña de administrador para confirmar la eliminación de la partida <strong>{target?.nombre || target?.id}</strong>.</p>
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
