import React, { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "./styles.css";
import { auth, db, storage } from "../../../firebase-config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Settings = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [sex, setSex] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Populate form with current user info
        setUsername(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || "");
        
        // Fetch additional data (fullName, sex) from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "");
          setSex(data.sex || "");
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
      const photoURL = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser, { photoURL });
      setPhotoURL(photoURL);
    }
  };

  // Validate the inputs
  const validateInputs = () => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    let isValid = true;
    const newErrors = {};

    // Validate full name: only letters and spaces allowed
    if (!nameRegex.test(fullName)) {
      newErrors.fullName = "Full name can only contain letters and spaces.";
      isValid = false;
    }

    // Validate username: only letters, numbers, ., _, and - are allowed
    if (!usernameRegex.test(username)) {
      newErrors.username =
        "Username can only contain letters, numbers, '.', '_', and '-'.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }

    try {
      // Update profile in Firebase Auth
      await updateProfile(auth.currentUser, { displayName: username });

      // Save additional info in Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userDocRef, { fullName, sex });

      // Handle image upload
      await handlePhotoUpload();
      Swal.fire({
        title: "Good job!",
        text: "Profile updated successfully!",
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "So sorry!",
        text: "Error updating profile: " + error.message,
        icon: "error"
      });
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
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <p className="error">{errors.username}</p>}
        </div>
        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && <p className="error">{errors.fullName}</p>}
        </div>
        <div className="input-group">
          <label>Sex</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Shel7</option>
          </select>
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Settings;
