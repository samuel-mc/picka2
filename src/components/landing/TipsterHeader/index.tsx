import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Menu, X } from 'lucide-react';
import { getDefaultAppPath } from '@/lib/auth';
import logo from "../../../assets/logo.png";
import './styles.css';
import { useLogin } from '@/hooks/useLogin';
import { useAuthStore } from '@/stores/authStore';

interface TipsterHeaderProps {
  isFixed?: boolean;
}

const TipsterHeader = ({ isFixed = true }: TipsterHeaderProps) => {
  const authenticated = useAuthStore((state) => state.authenticated);
  const role = useAuthStore((state) => state.role);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {logout} = useLogin();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [authenticated, role]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const homePath = authenticated ? getDefaultAppPath(role) : "/";

  return (
    <header className={`${isFixed ? 'fixed top-0 left-0 right-0 z-50 ' : ''}w-full bg-primaryBlue text-light shadow-md`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="shrink-0 flex items-center">
          <Link to={homePath} onClick={closeMenu}>
            <img src={logo} alt="Picka2 logo" className="w-full max-width-120 header-logo" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-light transition hover:bg-white/15 md:hidden"
          aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {authenticated ? (
            <>
              <Link 
                to={homePath}
                className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
              >
                {role === 'ROLE_ADMIN' ? 'Panel' : 'Inicio'}
              </Link>
              {role === 'ROLE_TIPSTER' && (
                <Link
                  to="/perfil"
                  className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
                >
                  Mi perfil
                </Link>
              )}
              {role === 'ROLE_TIPSTER' && (
                <Link
                  to="/guardados"
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
                >
                  <Bookmark className="h-4 w-4" />
                  Guardados
                </Link>
              )}
              {role === 'ROLE_ADMIN' && (
                <Link
                  to="/admin/perfil"
                  className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
                >
                  Mi perfil
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primaryBlue shadow-sm transition-colors hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
                <Link 
                  to="/login" 
                  className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
                >
                  Iniciar Sesión
                </Link>
              <Link 
                to="/registro" 
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primaryBlue shadow-sm transition-colors hover:bg-gray-100"
              >
                Ser tipster
              </Link>
            </>
          )}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-primaryBlue/98 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-2">
            {authenticated ? (
              <>
                <Link 
                  to={homePath}
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                >
                  {role === 'ROLE_ADMIN' ? 'Panel' : 'Inicio'}
                </Link>
                {role === 'ROLE_TIPSTER' && (
                  <Link
                    to="/perfil"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                  >
                    Mi perfil
                  </Link>
                )}
                {role === 'ROLE_TIPSTER' && (
                  <Link
                    to="/guardados"
                    onClick={closeMenu}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                  >
                    <Bookmark className="h-4 w-4" />
                    Guardados
                  </Link>
                )}
                {role === 'ROLE_ADMIN' && (
                  <Link
                    to="/admin/perfil"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                  >
                    Mi perfil
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="mt-1 rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-primaryBlue shadow-sm transition-colors hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/registro"
                  onClick={closeMenu}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-primaryBlue shadow-sm transition-colors hover:bg-gray-100"
                >
                  Ser tipster
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default TipsterHeader;
