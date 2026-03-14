import React from "react";
import type { LinkModel } from "../../models/LinkModel";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

interface Props {
  links: LinkModel[];
}

export const UserSidebar: React.FC<Props> = ({ links }) => {
  return (
    <div>
      <ul className="shadow rounded py-2 px-4 bg-white">
        <li className="p-5 flex justify-center items-center mb-4">
          <img src={logo} alt="logo" className="w-full max-w-20" />
        </li>
        {links?.map((element, index) => {
          const Icon = element.icon; // obtiene el ícono dinámicamente

          return (
            <li key={index} className="my-4">
              <Link
                to={element.link}
                className="flex items-center text-primary dm-sans font-semibold text-xl"
              >
                {Icon && <Icon size={20} className="me-3" />}
                {element.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
