import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { deleteUser, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./styles.css";
import { auth, db } from "../../../firebase-config";
import { FaRegCopyright } from "react-icons/fa";

const Settings = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to delete account
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        // Start loading
        setLoading(true);

        // Set user status to 'deleted' in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { status: "deleted" });

        // Delete the user from Firebase Authentication
        await deleteUser(user);

        // Success message
        Swal.fire({
          title: "Deleted!",
          text: "Your account has been deleted.",
          icon: "success",
        });

        // clear cookies
        

        // Redirect to home or login page
        navigate("/");
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: `Error deleting account: ${error.message}`,
          icon: "error",
        });
      } finally {
        // Stop loading
        setLoading(false);
      }
    }
  };

  // Function to change password
  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user && newPassword) {
      try {
        // Start loading
        setLoading(true);

        // Update password in Firebase Authentication
        await updatePassword(user, newPassword);

        // Success message
        Swal.fire({
          title: "Password Updated!",
          text: "Your password has been successfully changed.",
          icon: "success",
        });
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: `Error updating password: ${error.message}`,
          icon: "error",
        });
      } finally {
        // Stop loading
        setLoading(false);
      }
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-list">
        {/* Delete Account Button */}
        <button
          className="delete-account"
          onClick={() => {
            Swal.fire({
              title: "Are you sure?",
              text: "You won't be able to revert this!",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "Yes, delete it!",
            }).then((result) => {
              if (result.isConfirmed) {
                handleDeleteAccount();
              }
            });
          }}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete Account"}
        </button>

        {/* Change Password */}
        <div className="change-password-group">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <button
            className="change-password"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
      <div className="footer">
        Cloudhangouts <FaRegCopyright /> 2024 By{" "}
        <a
          href="https://github.com/amineichou"
          target="_blank"
          rel="noreferrer"
        >
          AMINE ICHOU
        </a>
      </div>
    </div>
  );
};

export default Settings;
