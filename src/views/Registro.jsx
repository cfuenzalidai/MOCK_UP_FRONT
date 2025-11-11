
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Registro(){
 	const [email, setEmail] = useState('');
 	const [password, setPassword] = useState('');
 	const [nombre, setNombre] = useState('');
 	const [loading, setLoading] = useState(false);
 	const [error, setError] = useState(null);
 	const [fieldErrors, setFieldErrors] = useState({});
 	const { signup } = useAuth();
 	const nav = useNavigate();

 	async function onSubmit(e){
 		e.preventDefault();
 		setLoading(true); setError(null); setFieldErrors({});

 		// Validación en cliente
 		const errs = {};
 		if (!nombre || nombre.trim().length < 2) errs.nombre = 'Nombre muy corto';
 		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Email inválido';
 		if ((password || '').length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';
 		if (Object.keys(errs).length) { setFieldErrors(errs); setLoading(false); return; }

 		try{
 			// enviar nombre como 'nombre' para coincidir con el backend
 			await signup({ nombre, email, password });
 			nav('/');
 		}catch(err){
 			// parseo errores del backend
 			const apiErr = err?.response?.data?.error;
 			if (apiErr?.code === 'EMAIL_TAKEN') setError('El email ya está registrado');
 			else if (apiErr?.code === 'VALIDATION_ERROR') setError(apiErr.message || 'Datos inválidos');
 			else if (apiErr?.message) setError(apiErr.message);
 			else setError(err?.response?.data?.message || err.message || 'Error al registrarse');
 		}finally{ setLoading(false); }
 	}

 	const fieldStyle = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 };

 	return (
 		<div className="card" style={{ maxWidth:480, margin:'24px auto', padding:20 }}>
 			<h2>Registro</h2>
 			<form onSubmit={onSubmit}>
 				<div style={fieldStyle}>
 					<label htmlFor="nombre">Nombre</label>
 					<input id="nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required />
 					{fieldErrors.nombre && <div className="field-error">{fieldErrors.nombre}</div>}
 				</div>

 				<div style={fieldStyle}>
 					<label htmlFor="email">Email</label>
 					<input id="email" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
 					{fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
 				</div>

 				<div style={fieldStyle}>
 					<label htmlFor="password">Contraseña</label>
 					<input id="password" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
 					{fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
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

