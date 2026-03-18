import logo from "../../../assets/logo.png";
import './styles.css'

const Header = () => {
  return (
    <header className="w-full bg-primaryBlue py-5 px-10 text-light">
      <img src={logo} alt="logo" className="w-full max-width-120" />
    </header>
  );
};

export default Header;
