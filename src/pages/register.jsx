import React, { useState } from "react";
import { auth } from "../firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase-config"; // Import Firestore instance
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore"; // Import Firestore methods
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState(""); // State for full name
  const [dob, setDob] = useState(""); // Initialize as empty string
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const age = calculateAge(dob);

    if (age < 18) {
      setError("You must be at least 18 years old to register.");
      return;
    }

    try {
      // Check if username is taken
      const usernamesDocRef = doc(db, "usernames", "taken");
      const usernamesDoc = await getDoc(usernamesDocRef);

      if (usernamesDoc.exists()) {
        const takenUsernames = usernamesDoc.data().taken || [];

        const usernameRegex = /^[a-zA-Z0-9_.-]+$/; // Regex for valid usernames

        if (!usernameRegex.test(username)) {
          setError(
            "Username can only contain letters, numbers, '.', '-', and '_'."
          );
          return;
        }

        if (username.length < 5 || username.length > 20) {
          setError("Username must be between 5 and 20 characters.");
          return;
        }

        if (takenUsernames.includes(username)) {
          setError("Username already in use. Please choose another.");
          return;
        }
      } else {
        // If the document does not exist, create it
        await setDoc(usernamesDocRef, { taken: [] });
      }

      // If username is available, proceed with registration
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user) {
        setError("Failed to create user");
        return;
      }

      // Get a random number between 0 and 10
      const random = Math.floor(Math.random() * 10);

      // Save user info to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        id: userCredential.user.uid,
        fullName, // Save full name
        sex: "male",
        username,
        email,
        dob,
        createdAt: serverTimestamp(),
        image: "/images/default/" + random + ".jpeg",
        status: "active",
      });

      // Update the usernames document
      const updatedUsernames = doc(db, "usernames", "taken");
      await setDoc(
        updatedUsernames,
        {
          taken: [...(usernamesDoc.data()?.taken || []), username],
        },
        { merge: true }
      );

      Swal.fire({
        title: "Success!",
        text: "You have successfully registered.",
        icon: "success",
        confirmButtonText: "Continue",
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          "This email is already in use. Please use a different email or log in instead."
        );
      } else {
        setError(err.message); // Catch other potential errors
      }
      console.error("Error registering:", err);
    }
  };

  return (
    <div className="register">
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <div className="show-password">
            <label>New Password</label>
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
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
