import React, { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";
import "./styles.css";
import { auth, db, storage } from "../../../firebase-config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Fetch additional data (fullName, sex, dob) from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        console.log(userDoc.data());
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "");
          setSex(data.sex || "");
          setDob(data.dob || "");
          setUsername(data.username || "");
          setPhotoURL(data.image || "");
        }
      }
    };
    fetchUserData();
  }, []);

  // Handle image upload
  const handlePhotoUpload = async () => {
    if (newPhoto) {
      const storageRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, newPhoto);
      const newPhotoURL = await getDownloadURL(storageRef);
      setPhotoURL(newPhotoURL);
    }
  };

  // Validate the inputs
  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    let isValid = true;
    const newErrors = {};

    if (!nameRegex.test(fullName)) {
      newErrors.fullName = "Full name can only contain letters and spaces.";
      isValid = false;
    }

    if (!usernameRegex.test(username) || username.length < 10) {
      newErrors.username = "Username must be at least 10 characters and can only contain letters, numbers, '.', '_', and '-'.";
      isValid = false;
    }

    if (!dob) {
      newErrors.dob = "Date of birth is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check if username is taken
  const isUsernameTaken = async (username) => {
    const usernamesQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(usernamesQuery);
    return !querySnapshot.empty; // Returns true if username is taken
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading state
    if (!validateInputs()) {
      setIsLoading(false); // Stop loading state if validation fails
      return;
    }

    try {
      // Check if the username is already taken
      if (await isUsernameTaken(username)) {
        setErrors({ username: "Username is already taken." });
        setIsLoading(false); // Stop loading
        return;
      }

      // Update profile in Firebase Auth
      await updateProfile(auth.currentUser, { displayName: username });

      // Save additional info (fullName, sex, dob) in Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userDocRef,
        { fullName, sex, dob, username, image: photoURL },
        { merge: true } // Use merge to avoid overwriting existing fields
      );

      // Handle image upload
      await handlePhotoUpload();

      Swal.fire({
        title: "Good job!",
        text: "Profile updated successfully!",
        icon: "success",
      });

      navigate("/"); // Redirect after successful update
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: `Error updating profile: ${error.message}`,
        icon: "error",
      });
    } finally {
      setIsLoading(false); // Ensure loading state is stopped
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className="profile-picture">
          <img src={photoURL || "default-profile.png"} alt="profile" />
          <input type="file" onChange={(e) => setNewPhoto(e.target.files[0])} />
        </div>
        <div className="input-group">
          <label>Username (min 10 characters)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading} // Disable input while loading
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading} // Disable input while loading
          />
          {errors.fullName && <p className="error">{errors.fullName}</p>}
        </div>
        <div className="input-group">
          <label>Date of Birth</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            disabled={isLoading} // Disable input while loading
          />
          {errors.dob && <p className="error">{errors.dob}</p>}
        </div>
        <div className="input-group">
          <label>Sex</label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            disabled={isLoading} // Disable input while loading
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"} {/* Show loading status */}
        </button>
      </form>
    </div>
  );
};

export default Settings;
