import { Link } from 'react-router-dom';
import logo from "../../../assets/logo.png";
import './styles.css';
import { useLogin } from '@/hooks/useLogin';

interface TipsterHeaderProps {
  isFixed?: boolean;
}

const TipsterHeader = ({ isFixed = true }: TipsterHeaderProps) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const {logout} = useLogin();

  return (
    <header className={`${isFixed ? 'fixed top-0 left-0 right-0 z-50 ' : ''}w-full bg-primaryBlue py-5 px-10 text-light flex justify-between items-center shadow-md`}>
      <div className="shrink-0 flex items-center">
        <Link to="/">
          <img src={logo} alt="Picka logo" className="w-full max-width-120" />
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {token ? (
          <>
            <Link 
              to={role === 'ROLE_ADMIN' ? "/admin/panel" : "/tipster/dashboard"} 
              className="text-light hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="bg-white text-primaryBlue px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
            >
              Cerrar Sesión
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="text-light hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/registro" 
              className="bg-white text-primaryBlue px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default TipsterHeader;
