import React from "react";
import { UserSidebar } from "../../components/user/UserSidebar";
import type { LinkModel } from "../../models/LinkModel";
import {
  Flag,
  House,
  MessageSquareQuote,
  MapPinned,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import "./styles.css";

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const links: LinkModel[] = [
    {
      id: 1,
      name: "Home",
      link: "/admin/panel",
      icon: House,
    },
    {
      id: 2,
      name: "Usuarios",
      link: "/admin/usuarios",
      icon: Users,
    },
    {
      id: 3,
      name: "Deportes",
      link: "/admin/catalogos/deportes",
      icon: Shield,
    },
    {
      id: 4,
      name: "Países",
      link: "/admin/catalogos/paises",
      icon: Flag,
    },
    {
      id: 5,
      name: "Competiciones",
      link: "/admin/catalogos/competiciones",
      icon: Trophy,
    },
    {
      id: 6,
      name: "Equipos",
      link: "/admin/catalogos/equipos",
      icon: MapPinned,
    },
    {
      id: 7,
      name: "Home Prashes",
      link: "/admin/catalogos/home-prashes",
      icon: MessageSquareQuote,
    },
    // {
    //   id: 7,
    //   name: "Mi perfil",
    //   link: "/admin/perfil",
    //   icon: UserCircle,
    // },
  ];
  return (
    <div className="users__layout bg-gray-100 py-6 px-5">
      <UserSidebar links={links} />
      <div>
        <main
          className="max-w-7xl mx-auto p-4 bg-white shadow rounded py-10 px-8"
          style={{ minHeight: "calc(100vh - 88px - 90px)" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
