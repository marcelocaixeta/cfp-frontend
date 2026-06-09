import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../features/auth/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <div className="screen-loader">Carregando sua sessão...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
