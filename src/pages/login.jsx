import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../firebase-config";
import Cookies from "universal-cookie";
import "../styles-global/login.css";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

const cookies = new Cookies(); // Moved cookies initialization outside the component

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

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
      // Improved error handling based on Firebase Auth errors
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred during sign-in. Please try again later.");
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken); // Store token in cookies
      setIsAuthenticated(true);

      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef); // Corrected method for getting a document

      // get a number bettwen 0 and 10
      const random = Math.floor(Math.random() * 10);

      // Add user to Firestore if not already present
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: result.user.uid,
          username:
            result.user.displayName
              .replace(/\s+/g, "_")
              .toLowerCase()
              .slice(0, 5) +
            Math.floor(Math.random() * 1000) +
            "_" +
            result.user.uid.slice(0, 5),
          email: result.user.email,
          fullName: result.user.displayName,
          sex: "male",
          dob: "",
          createdAt: serverTimestamp(),
          image: "/images/default/" + random + ".jpeg",
        });
      }

      navigate("/"); // Redirect to home
    } catch (error) {
      setError("Google Sign-In failed. Please try again later.");
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
        {/* Display error message */}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}{" "}
          {/* Show loading indicator */}
        </button>
      </form>
      <div className="else">
        <button
          className="google-btn"
          onClick={signInWithGoogle}
          disabled={isLoading}
        >
          <FcGoogle />
          {isLoading ? "Processing..." : "Continue with Google"}{" "}
          {/* Handle Google button state */}
        </button>
        <p>
          Don't have an account? <Link to={"/register"}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
