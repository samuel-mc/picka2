import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from "../../../assets/logo.png";
import './styles.css';
import { useLogin } from '@/hooks/useLogin';
import { useAuthStore } from '@/stores/authStore';

interface TipsterHeaderProps {
  isFixed?: boolean;
}

const TipsterHeader = ({ isFixed = true }: TipsterHeaderProps) => {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {logout} = useLogin();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [token, role]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const homePath = role === 'ROLE_ADMIN' ? "/admin/panel" : "/";

  return (
    <header className={`${isFixed ? 'fixed top-0 left-0 right-0 z-50 ' : ''}w-full bg-primaryBlue text-light shadow-md`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <div className="shrink-0 flex items-center">
          <Link to={homePath} onClick={closeMenu}>
            <img src={logo} alt="Picka logo" className="w-full max-width-120 header-logo" />
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
          {token ? (
            <>
              <Link 
                to={homePath}
                className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
              >
                {role === 'ROLE_ADMIN' ? 'Panel' : 'Inicio'}
              </Link>
              {role === 'ROLE_TIPSTER' && (
                <Link
                  to="/tipster/perfil"
                  className="rounded-md px-3 py-2 text-sm font-medium text-light transition-colors hover:text-gray-200"
                >
                  Mi perfil
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
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="border-t border-white/10 bg-primaryBlue/98 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-2">
            {token ? (
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
                    to="/tipster/perfil"
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-light transition-colors hover:bg-white/10"
                  >
                    Mi perfil
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
                  Registrarse
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
