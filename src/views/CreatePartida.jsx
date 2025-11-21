import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreatePartida(){
  const { createPartida } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function run(){
      try{
        const res = await createPartida();
        // res puede ser id u objeto
        const id = typeof res === 'string' || typeof res === 'number' ? res : res?.id;
        if (!mounted) return;
        if (id) nav(`/partidas/${id}`);
        else nav('/partidas');
      }catch(err){
        setError(err?.response?.data?.message || err.message || 'No se pudo crear la partida');
      }finally{ if (mounted) setLoading(false); }
    }
    run();
    return () => (mounted = false);
  }, [createPartida, nav]);

  if (loading) return <div className="view-root">Creando partida...</div>;
  if (error) return <div className="view-root error">{error}</div>;
  return null;
}
