import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
import { UserSignup } from '../pages/Users/UserSignup';
import { UserLogin } from '../pages/Users/UserLogin';
import { UserDashboard } from '../pages/Users/UserDashborad';
// import Dashboard from '../pages/Dashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas (solo accesibles si NO estás logeado) */}
        <Route element={<PublicRoute />}>
          <Route path="/user/login" element={<UserLogin />} />
        </Route>

        {/* Rutas Protegidas (solo accesibles si ESTÁS logeado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/user/signup" element={<UserSignup />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
