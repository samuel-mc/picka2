import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AppBootSkeleton } from '@/components/common/AppBootSkeleton';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const initialized = useAuthStore((state) => state.initialized);
  const authenticated = useAuthStore((state) => state.authenticated);
  const userRole = useAuthStore((state) => state.role);

  if (!initialized) {
    return <AppBootSkeleton />;
  }

  if (!authenticated) {
    return <Navigate to={location.pathname.startsWith("/admin") ? "/admin/login" : "/login"} replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};
