import React from "react";
import TipsterHeader from "../../components/landing/TipsterHeader";
import Footer from "../../components/common/Footer";
import "./styles.css";

interface Props {
  children: React.ReactNode;
  isFixed?: boolean;
}

export const TipsterLayout: React.FC<Props> = ({ children, isFixed = true }) => {
  return (
    <>
      <TipsterHeader isFixed={isFixed} />
      <div className="landing__content">{children}</div>
      <Footer />
    </>
  );
};
