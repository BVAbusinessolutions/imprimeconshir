import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege rutas que requieren inicio de sesión.
 * Si no hay usuario, redirige al login y recuerda la página de origen.
 */
export const PrivateRoute = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  return currentUser ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
};

/**
 * Protege rutas exclusivas de administradores.
 * Si el usuario no es admin, redirige al inicio.
 */
export const AdminRoute = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
};
