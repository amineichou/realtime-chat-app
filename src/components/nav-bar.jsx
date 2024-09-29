import React from "react";
import "../styles/nav-bar.css";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { auth, provider } from "../firebase-config";
import { signInWithPopup } from "firebase/auth";
import { cookies } from "../App";


const NavBar = () => {

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, provider)
      .then((result) => {
        cookies.set("auth-token", result.user.refreshToken);
        console.log(result);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return (
    <div className="nav-bar">
      <Link to={'/'} className="logo">
        <img src="/logo-min.png" alt="logo" />
      </Link>
      <div className="user">
        <button onClick={signInWithGoogle}>
          <FcGoogle />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default NavBar;
