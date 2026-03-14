import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./styles.css";

interface Props {
  children: React.ReactNode;
}

export const LandingLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      <div className="landing__content">{children}</div>
      <Footer />
    </>
  );
};
