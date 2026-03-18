import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoute = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  

  // Si el usuario esta loggeado y es admin, se envia al dashboard
  if (token && role === 'ROLE_USER') {
    return <Navigate to="/panel" replace />;
  }

  // Si no hay token, renderizar los componentes hijos (como login o signup)
  return <Outlet />;
};
