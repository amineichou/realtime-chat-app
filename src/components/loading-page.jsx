import React from "react";
import { BallTriangle } from "react-loader-spinner";
import "../styles-global/loading-page.css";

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <BallTriangle
        visible={true}
        height={100}
        width={100}
        color="#2B9FFF"
        backgroundColor="#e20b0b"
      />
    </div>
  );
};

export default LoadingPage;
