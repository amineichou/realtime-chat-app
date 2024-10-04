import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase-config";
import Cookies from "universal-cookie";
import "../styles-global/login.css";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

const Login = (params) => {
  const { setIsAuthenticated } = params;
  const cookies = new Cookies();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      cookies.set("auth-token", userCredential.user.refreshToken); // Store token in cookies
      setIsAuthenticated(true);
      navigate("/"); // Redirect to home page
    } catch (error) {
      if (error) {
        setError("User or password incorrect, Please register or try again.");
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}{" "}
        {/* Display error message if any */}
        <button type="submit">Sign In</button>
      </form>
      <div className="else">
        <button className="google-btn" onClick={signInWithGoogle}>
          <FcGoogle />
          Continue with Google
        </button>
        <p>
          Don't have an account? <Link to={"/register"}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
