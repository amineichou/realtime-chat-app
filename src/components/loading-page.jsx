import React from "react";
import { BallTriangle } from "react-loader-spinner";
import "../styles/loading-page.css";

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <BallTriangle
        visible={true}
        height={100}
        width={100}
        color="#e20b0b"
        backgroundColor="#e20b0b"
      />
    </div>
  );
};

export default LoadingPage;
