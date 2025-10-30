import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
import { UserSignup } from '../pages/UserSignup';
import { UserLogin } from '../pages/UserLogin';
// import Dashboard from '../pages/Dashboard';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/login" element={<UserLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
