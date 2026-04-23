import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
import { UserSignup } from '../pages/auth/UserSignup';
import { TipsterSignup } from '../pages/auth/TipsterSignup';
import { TipsterLogin } from '../pages/auth/TipsterLogin';
import { UserLogin } from '../pages/auth/UserLogin';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { RequestPasswordReset } from '../pages/auth/RequestPasswordReset';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { UserDashboard } from '../pages/admin/UsersDashboard';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import Landing from '../pages/landing';
import { UsersList } from '@/pages/admin/UsersList';
import { MiPerfilPage } from '@/pages/profile/MiPerfil';
import { SportsCatalogPage } from '@/pages/admin/catalogs/SportsCatalog';
import { CountriesCatalogPage } from '@/pages/admin/catalogs/CountriesCatalog';
import { CompetitionsCatalogPage } from '@/pages/admin/catalogs/CompetitionsCatalog';
import { TeamsCatalogPage } from '@/pages/admin/catalogs/TeamsCatalog';
import { HomePrashesCatalogPage } from '@/pages/admin/catalogs/HomePrashesCatalog';
import { SportsbooksCatalogPage } from '@/pages/admin/catalogs/SportsbooksCatalog';
import PostsFeedPage from '@/pages/tipster/PostsFeed';
import CreatePostPage from '@/pages/tipster/CreatePost';
import SavedPostsPage from '@/pages/tipster/SavedPosts';
import UserProfilePage from '@/pages/profile/UserProfile';
import { AuthSessionManager } from '@/components/auth/AuthSessionManager';
import PostDetailPage from '@/pages/posts/PostDetail';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthSessionManager />
      <Routes>
        <Route path="/posts/:postId" element={<PostDetailPage />} />

        {/* Rutas Públicas (solo accesibles si NO estás logeado) */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<UserLogin />} />
          <Route path="/login" element={<TipsterLogin />} />
          <Route path="/registro" element={<TipsterSignup />} />
          <Route path="/recuperar-contrasenia" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Rutas Protegidas (solo accesibles si ESTÁS logeado) */}

        {/* Módulos solo para administradores (antiguos usuarios regulares) */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin/usuarios" element={<UsersList />} />
          <Route path="/admin/registro" element={<UserSignup />} />
          <Route path="/admin/panel" element={<UserDashboard />} />
          <Route path="/admin/perfil" element={<MiPerfilPage />} />
          <Route path="/admin/catalogos/deportes" element={<SportsCatalogPage />} />
          <Route path="/admin/catalogos/paises" element={<CountriesCatalogPage />} />
          <Route path="/admin/catalogos/competiciones" element={<CompetitionsCatalogPage />} />
          <Route path="/admin/catalogos/equipos" element={<TeamsCatalogPage />} />
          <Route path="/admin/catalogos/home-prashes" element={<HomePrashesCatalogPage />} />
          <Route path="/admin/catalogos/sportsbooks" element={<SportsbooksCatalogPage />} />
        </Route>

        {/* Módulos solo para tipsters (Ejemplo) */}
        {/* Descomenta y agrega tus componentes cuando los tengas */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_TIPSTER']} />}>
          <Route path="/feed" element={<PostsFeedPage />} />
          <Route path="/guardados" element={<SavedPostsPage />} />
          <Route path="/perfil" element={<UserProfilePage />} />
          <Route path="/perfil/editar" element={<MiPerfilPage />} />
          <Route path="/perfil/:userId" element={<UserProfilePage />} />
          <Route path="/tipster/perfil" element={<UserProfilePage />} />
          <Route path="/tipster/perfil/editar" element={<MiPerfilPage />} />
          <Route path="/tipster/perfil/:userId" element={<UserProfilePage />} />
          <Route path="/tipster/posts" element={<PostsFeedPage />} />
          <Route path="/tipster/posts/guardados" element={<SavedPostsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ROLE_TIPSTER']} />}>
          <Route path="/tipster/posts/nuevo" element={<CreatePostPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
