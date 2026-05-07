import { Navigate, Outlet } from 'react-router-dom';
import { getDefaultAppPath } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import { AppBootSkeleton } from '@/components/common/AppBootSkeleton';

export const PublicRoute = () => {
  const initialized = useAuthStore((state) => state.initialized);
  const authenticated = useAuthStore((state) => state.authenticated);
  const role = useAuthStore((state) => state.role);

  if (!initialized) {
    return <AppBootSkeleton />;
  }

  if (authenticated) {
    return <Navigate to={getDefaultAppPath(role)} replace />;
  }

  return <Outlet />;
};
