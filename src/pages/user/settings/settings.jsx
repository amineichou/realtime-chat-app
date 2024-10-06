import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import {
  deleteUser,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./styles.css";
import { auth, db } from "../../../firebase-config";
import { FaRegCopyright } from "react-icons/fa";
import Cookies from "universal-cookie";

const Settings = (params) => {
  const { setIsAuthenticated } = params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false); // Track if the user signed in with Google
  const navigate = useNavigate();
  const cookies = new Cookies();

  // Check if the user is a Google user
  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.providerData) {
      const provider = user.providerData.find(
        (provider) => provider.providerId === "google.com"
      );
      setIsGoogleUser(!!provider);
    }
  }, []);

  // Function to delete all cookies
  const clearAllCookies = () => {
    const allCookies = cookies.getAll();
    Object.keys(allCookies).forEach((cookieName) =>
      cookies.remove(cookieName, { path: "/" })
    );
  };

  // Function to re-authenticate the user with their old password
  const reauthenticateUser = async (password) => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    try {
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      throw new Error(`Reauthentication failed`);
    }
  };

  // Function to delete account
  const handleDeleteAccount = async (password) => {
    const user = auth.currentUser;
    if (user) {
      try {
        setLoading(true);
        // Re-authenticate before deleting the account
        await reauthenticateUser(password);

        // Set user status to 'deleted' in Firestore
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { status: "deleted" });

        // Delete the user from Firebase Authentication
        await deleteUser(user);

        Swal.fire({
          title: "Deleted!",
          text: "Your account has been deleted.",
          icon: "success",
        });

        clearAllCookies();
        setIsAuthenticated(false);
        navigate("/");
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: `Error deleting account: ${error.message}`,
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to change password
  const handleChangePassword = async () => {
    const user = auth.currentUser;

    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "Error",
        text: "Passwords do not match.",
        icon: "error",
      });
      return;
    }

    if (user && newPassword) {
      try {
        setLoading(true);
        // Re-authenticate before updating password
        await reauthenticateUser(oldPassword);
        // Update password in Firebase Authentication
        await updatePassword(user, newPassword);

        Swal.fire({
          title: "Password Updated!",
          text: "Your password has been successfully changed.",
          icon: "success",
        });

        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: `Error updating password: ${error.message}`,
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-list">
        {/* Change Password */}
        {!isGoogleUser && (
          <div className="change-password-group">
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
        )}
        {isGoogleUser && (
          <div>
            <p>
              You signed in with Google. To change your password, please visit
              your Google Account settings.
            </p>
          </div>
        )}

        {/* Footer */}
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
                // Ask for password
                Swal.fire({
                  title: "Your password",
                  input: "password",
                  inputAttributes: {
                    autocapitalize: "off",
                  },
                  showCancelButton: true,
                  confirmButtonText: "Delete Account",
                  confirmButtonColor: "#d33",
                  showLoaderOnConfirm: true,
                  preConfirm: async (password) => {
                    setLoading(true);
                    try {
                      await handleDeleteAccount(password);
                      return true; // Signal that the process is complete
                    } catch (error) {
                      Swal.showLoading();
                      Swal.fire({
                        title: "Error",
                        text: error.message,
                        icon: "error",
                      });
                      throw new Error("Deletion failed");
                    } finally {
                      setLoading(false);
                    }
                  },
                  allowOutsideClick: () => !Swal.isLoading(),
                });
              }
            });
          }}
          disabled={loading}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
