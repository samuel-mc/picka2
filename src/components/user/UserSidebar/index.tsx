import React from "react";
import type { LinkModel } from "../../../models/LinkModel";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/logo.png";
import { LogOut } from "lucide-react";

interface Props {
  links: LinkModel[];
}

export const UserSidebar: React.FC<Props> = ({ links }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/user/login");
  };

  return (
    <div className="h-full">
      <ul className="shadow rounded py-2 px-4 bg-white h-full flex flex-col" style={{ minHeight: "calc(100vh - 88px - 90px)" }}>
        <li className="p-5 flex justify-center items-center mb-4">
          <img src={logo} alt="logo" className="w-full max-w-20" />
        </li>
        {links?.map((element, index) => {
          const Icon = element.icon; // obtiene el ícono dinámicamente

          return (
            <li key={index} className="my-4">
              <Link
                to={element.link}
                className="flex items-center text-primaryBlue dm-sans font-semibold text-xl hover:text-primary-dark transition-colors"
              >
                {Icon && <Icon size={20} className="me-3" />}
                {element.name}
              </Link>
            </li>
          );
        })}
        
        <li className="mt-auto pt-4 pb-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-700 dm-sans font-semibold text-xl w-full text-left transition-colors"
          >
            <LogOut size={20} className="me-3" />
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  );
};
