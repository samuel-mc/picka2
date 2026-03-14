import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/user/login" replace />;
  }

  // Si hay token, renderizar los componentes hijos (la ruta protegida)
  return <Outlet />;
};
