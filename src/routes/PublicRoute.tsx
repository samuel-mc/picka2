import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export const PublicRoute = () => {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  if (token && role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/panel" replace />;
  }

  return <Outlet />;
};
