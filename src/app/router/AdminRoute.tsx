import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../features/auth/useAuth';

export function AdminRoute() {
  const { user } = useAuth();

  if (user?.perfil !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
