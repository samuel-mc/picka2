import React from "react";
import { MutatingDots } from "react-loader-spinner";

interface Props {
    visible: boolean;
}

export const Loading: React.FC<Props> = ({visible}) => {
  return (
    <MutatingDots
      visible={visible}
      height="100"
      width="100"
      color="#134686"
      secondaryColor="#ED3F27"
      radius="12.5"
      ariaLabel="mutating-dots-loading"
      wrapperStyle={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        position: "fixed",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
      wrapperClass=""
    />
  );
};
