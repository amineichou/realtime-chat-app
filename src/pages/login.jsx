import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, provider } from "../firebase-config";
import Cookies from "universal-cookie";
import "../styles-global/login.css";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Wave from "react-wavify";

const cookies = new Cookies(); // Moved cookies initialization outside the component

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 30 * 60 * 1000; // Lock duration: 30 minutes

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      // Reference to Firestore document for the user
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if the account is locked
        if (userData.lockUntil && userData.lockUntil > Date.now()) {
          const timeRemaining = (userData.lockUntil - Date.now()) / 1000;
          setError(
            `Account locked. Try again in ${Math.ceil(
              timeRemaining / 60
            )} minutes.`
          );
          setIsLoading(false);
          return;
        }

        // Attempt to sign in the user
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          cookies.set("auth-token", userCredential.user.refreshToken); // Store token in cookies
          setIsAuthenticated(true);

          // Reset failed attempts after successful login
          await updateDoc(userDocRef, { failedAttempts: 0 });
          setError("");
          navigate("/"); // Redirect to home page
        } catch (err) {
          const failedAttempts = (userData.failedAttempts || 0) + 1;

          if (failedAttempts >= MAX_ATTEMPTS) {
            // Lock the account if maximum attempts are exceeded
            await updateDoc(userDocRef, {
              failedAttempts,
              lockUntil: Date.now() + LOCK_DURATION, // Lock the account for LOCK_DURATION
            });
            setError(
              `Account locked due to too many failed attempts. Try again in 30 minutes.`
            );
          } else {
            // Update the failedAttempts field in Firestore
            await updateDoc(userDocRef, { failedAttempts });
            setError(
              `Invalid email or password. ${
                MAX_ATTEMPTS - failedAttempts
              } attempts left.`
            );
          }
        }
      } else {
        setError("User not found.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again later.");
    }

    setIsLoading(false); // Stop loading
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken); // Store token in cookies
      setIsAuthenticated(true);

      const userDocRef = doc(db, "users", result.user.uid);
      const userDoc = await getDoc(userDocRef);

      // get a number between 0 and 10
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
          status: "active",
        });
      }
      navigate("/"); // Redirect to home
      window.location.reload(); // Reload the page to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 3000);
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
          <div className="show-password">
            <label>Password</label>
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <input
            type={showPassword ? "text" : "password"}
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
          Continue with Google
          {/* Handle Google button state */}
        </button>
        <p>
          Don't have an account? <Link to={"/register"}>Register</Link>
        </p>
      </div>
      <Wave
        fill="#2B9FFF"
        paused={false}
        style={{ display: "flex" }}
        className="wave"
        options={{
          height: 10,
          amplitude: 30,
          speed: 0.15,
          points: 5,
        }}
      />
    </div>
  );
};

export default Login;
