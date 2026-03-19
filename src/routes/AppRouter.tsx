import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
import { UserSignup } from '../pages/auth/UserSignup';
import { TipsterSignup } from '../pages/auth/TipsterSignup';
import { TipsterLogin } from '../pages/auth/TipsterLogin';
import { UserLogin } from '../pages/auth/UserLogin';
import { UserDashboard } from '../pages/admin/UsersDashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import Landing from '../pages/landing';
import { UsersList } from '@/pages/admin/UsersList';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (solo accesibles si NO estás logeado) */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<UserLogin />} />
          <Route path="/login" element={<TipsterLogin />} />
          <Route path="/registro" element={<TipsterSignup />} />
        </Route>

        {/* Rutas Protegidas (solo accesibles si ESTÁS logeado) */}

        {/* Módulos solo para administradores (antiguos usuarios regulares) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin/usuarios" element={<UsersList />} />
          <Route path="/admin/registro" element={<UserSignup />} />
          <Route path="/admin/panel" element={<UserDashboard />} />
        </Route>

        {/* Módulos solo para tipsters (Ejemplo) */}
        {/* Descomenta y agrega tus componentes cuando los tengas */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_TIPSTER']} />}>
          {/* <Route path="/tipster/dashboard" element={<TipsterDashboard />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
