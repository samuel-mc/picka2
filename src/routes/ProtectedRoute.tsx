import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Asumiendo que el login guarda el rol aquí
  
  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    // Si el usuario no tiene los roles permitidos, redirigirlo (a una ruta segura o un aviso de no autorizado)
    return <Navigate to="/" replace />; 
  }

  // Si hay token y tiene permiso, renderizar la ruta protegida
  return <Outlet />;
};
