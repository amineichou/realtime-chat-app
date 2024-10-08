import React, { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import "./styles/edit-profile.css";
import { auth, db, storage } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newPhoto, setNewPhoto] = useState(null);
  const [originalUsername, setOriginalUsername] = useState(""); // Store original username
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "");
          setSex(data.sex || "");
          setDob(data.dob || "");
          setUsername(data.username || "");
          setOriginalUsername(data.username || ""); // Set original username for comparison
          setPhotoURL(data.image || "");
        }
      }
    };
    fetchUserData();
  }, []);

  // Handle image upload
  const handlePhotoUpload = async () => {
    if (newPhoto) {
      const MAX_FILE_SIZE_MB = 2; // 2MB limit
      const fileSizeMB = newPhoto.size / (1024 * 1024); // Convert to MB

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setErrors({ photo: "Image size cannot exceed 2MB." });
        return null; // Don't proceed with the upload
      }

      const storageRef = ref(storage, `profilePhotos/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, newPhoto);
      const newPhotoURL = await getDownloadURL(storageRef);
      return newPhotoURL; // Return the new photo URL after upload
    }
    return photoURL; // Return existing photoURL if no new photo
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

    if (!usernameRegex.test(username)) {
      newErrors.username =
        "Username must be at least 10 characters and can only contain letters, numbers, '.', '_', and '-'.";
      isValid = false;
    }

    if (username.length < 5 || username.length > 20) {
      newErrors.username = "Username must be between 10 and 20 characters.";
      isValid = false;
    }

    if (!dob) {
      newErrors.dob = "Date of birth is required.";
      isValid = false;
    }

    if (!photoURL && !newPhoto) {
      newErrors.photo = "Profile photo is unvalid.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Check if username is taken (skip check if the username hasn't been changed)
  const isUsernameTaken = async (username) => {
    if (username === originalUsername) {
      return false; // Skip check if the username hasn't been modified
    }

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
      // Check if the username is already taken (only if the username was modified)
      if (await isUsernameTaken(username)) {
        setErrors({ username: "Username is already taken." });
        setIsLoading(false); // Stop loading
        return;
      }

      // Update profile in Firebase Auth (only if the username has changed)
      if (username !== originalUsername) {
        await updateProfile(auth.currentUser, { displayName: username });
      }

      // Handle image upload (only upload if newPhoto is selected)
      const updatedPhotoURL = await handlePhotoUpload();

      // Stop if image upload failed (due to size limit)
      if (!updatedPhotoURL) {
        setIsLoading(false);
        return;
      }

      // Save additional info (fullName, sex, dob, username, image) in Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userDocRef,
        { fullName, sex, dob, username, image: updatedPhotoURL }, // Use the updated photo URL
        { merge: true }
      );

      Swal.fire({
        title: "Good job!",
        text: "Profile updated successfully!",
        icon: "success",
      }).finally(() => {
        navigate("/");
        window.location.reload();
      });
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
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleUpdateProfile}>
        <div className="profile-picture">
          <img src={photoURL || "default-profile.png"} alt="profile" />
          <input
            type="file"
            onChange={(e) => setNewPhoto(e.target.files[0])}
            disabled={isLoading} // Disable input while loading
          />
          {errors.photo && <p className="error">{errors.photo}</p>}
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
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}{" "}
          {/* Show loading status */}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
