import React from "react";
import { UserSidebar } from "../../components/user/UserSidebar";
import type { LinkModel } from "../../models/LinkModel";
import { House, Users } from "lucide-react";

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
