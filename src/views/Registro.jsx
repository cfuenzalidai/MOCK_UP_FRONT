import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro(){
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { signup } = useAuth();
	const nav = useNavigate();

	async function onSubmit(e){
		e.preventDefault();
		setLoading(true); setError(null);
		try{
			await signup({ name, email, password });
			nav('/');
		}catch(err){
			setError(err?.response?.data?.message || err.message || 'Error al registrarse');
		}finally{ setLoading(false); }
	}

	const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 };

	return (
		<div className="card" style={{ maxWidth:480, margin:'24px auto', padding:20 }}>
			<h2>Registro</h2>
			<form onSubmit={onSubmit}>
				<div style={fieldStyle}>
					<label htmlFor="name">Nombre</label>
					<input id="name" value={name} onChange={e=>setName(e.target.value)} required />
				</div>

				<div style={fieldStyle}>
					<label htmlFor="email">Email</label>
					<input id="email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
				</div>

				<div style={fieldStyle}>
					<label htmlFor="password">Contraseña</label>
					<input id="password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
				</div>

				{error && <div className="error">{error}</div>}

				<div style={{ display:'flex', gap:8, marginTop:12 }}>
					<button type="submit" disabled={loading}>{loading? 'Creando...' : 'Crear cuenta'}</button>
					<Link to="/login" className="btn">Ya tengo cuenta</Link>
				</div>
			</form>
		</div>
	);
}

