import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
import { UserSignup } from '../pages/Users/UserSignup';
import { UserLogin } from '../pages/Users/UserLogin';
import { UserDashboard } from '../pages/Users/UserDashborad';
// import Dashboard from '../pages/Dashboard';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
