import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login(){
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { login } = useAuth();
	const nav = useNavigate();

	async function onSubmit(e){
		e.preventDefault();
		setLoading(true);
		setError(null);
		try{
			await login({ email, password });
			nav('/');
		}catch(err){
			setError(err?.response?.data?.message || err.message || 'Error al iniciar sesión');
		}finally{ setLoading(false); }
	}

	const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 };

	return (
		<div className="card" style={{ maxWidth:420, margin:'24px auto', padding:20 }}>
			<h2>Ingresar</h2>
			<form onSubmit={onSubmit}>
				<div style={fieldStyle}>
					<label htmlFor="login-email">Email</label>
					<input id="login-email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
				</div>

				<div style={fieldStyle}>
					<label htmlFor="login-password">Contraseña</label>
					<input id="login-password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
				</div>

				{error && <div className="error">{error}</div>}

				<div style={{ display:'flex', gap:8, marginTop:12 }}>
					<button type="submit" disabled={loading}>{loading? 'Entrando...' : 'Entrar'}</button>
					<Link to="/registro" className="btn">Crear cuenta</Link>
				</div>
			</form>
		</div>
	);
}
