import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultAppPath } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';

export const PublicRoute = () => {
  const initialized = useAuthStore((state) => state.initialized);
  const authenticated = useAuthStore((state) => state.authenticated);
  const role = useAuthStore((state) => state.role);

  if (!initialized) {
    return null;
  }

  if (authenticated) {
    return <Navigate to={getDefaultAppPath(role)} replace />;
  }

  return <Outlet />;
};
