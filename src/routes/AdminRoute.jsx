import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
	const { user, booting } = useAuth();
	if (booting) return null;
	if (!user) return <Navigate to="/login" replace />;
	// Asume que el rol puede estar en user.role o user.rol
	const role = user?.role || user?.rol;
	if (role !== 'admin') return <Navigate to="/" replace />;
	return children;
}
