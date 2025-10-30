import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-4 bg-white rounded" style={{minHeight: 'calc(100vh - 88px - 90px)'}}>
        {children}
      </main>
      <Footer />
    </>
  );
};
