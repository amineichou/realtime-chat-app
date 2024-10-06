import React from "react";
import "../styles-global/no-page.css";
import { Link } from "react-router-dom";

const NoPage = () => {
  return (
    <div className="no-page">
      <img src="https://stickershop.line-scdn.net/stickershop/v1/product/23701012/LINEStorePC/main.png?v=1" alt="404" />
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={'/'}>Go BACK HOME</Link>
    </div>
  );
};

export default NoPage;
