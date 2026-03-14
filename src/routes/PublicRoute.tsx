import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoute = () => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Si ya hay token (usuario logeado), redirigir al dashboard
    return <Navigate to="/user/dashboard" replace />;
  }

  // Si no hay token, renderizar los componentes hijos (como login o signup)
  return <Outlet />;
};
