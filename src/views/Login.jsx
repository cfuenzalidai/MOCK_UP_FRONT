import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login(){
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [fieldErrors, setFieldErrors] = useState({});
	const { login } = useAuth();
	const nav = useNavigate();

	async function onSubmit(e){
		e.preventDefault();
		setLoading(true);
		setError(null);
		setFieldErrors({});

		// Validación cliente
		const errs = {};
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Email inválido';
		if ((password || '').length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';
		if (Object.keys(errs).length) { setFieldErrors(errs); setLoading(false); return; }
		try{
			await login({ email, password });
			nav('/');
		}catch(err){
			// Parseo de error del backend
			const apiErr = err?.response?.data?.error;
			if (apiErr?.code === 'INVALID_CREDENTIALS') setError('Email o contraseña incorrectos');
			else if (apiErr?.message) setError(apiErr.message);
			else setError(err?.response?.data?.message || err.message || 'Error al iniciar sesión');
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
					{fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
				</div>

				<div style={fieldStyle}>
					<label htmlFor="login-password">Contraseña</label>
					<input id="login-password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
					{fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
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
