import React, { useEffect, useState, useRef } from "react";
import "../styles/nav-bar.css";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { auth, provider } from "../firebase-config";
import { signInWithPopup, signOut } from "firebase/auth";
import Cookies from "universal-cookie";
import { IoSettingsSharp } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import LoadingPage from "./loading-page";

const cookies = new Cookies();

const ProfileImageF =
  "https://cdnb.artstation.com/p/assets/images/images/034/457/373/large/shin-min-jeong-.jpg?1612345104";

const ProfileImageM =
  "https://cdna.artstation.com/p/assets/images/images/034/457/398/large/shin-min-jeong-.jpg?1612345160";

const NavBar = ({ setIsAuthenticated, isAuthenticated }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileSets, setShowProfileSets] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const profileSetsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setLoaded(true);
      } else {
        setLoaded(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileSetsRef.current &&
        !profileSetsRef.current.contains(event.target)
      ) {
        setShowProfileSets(false);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  const signUserOut = async () => {
    try {
      setShowProfileSets(false);
      await signOut(auth);
      cookies.remove("auth-token");
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Sign-Out Error:", error.message);
    }
  };

  if (!loaded) {
    return <LoadingPage />;
  }

  const profileImage =
    currentUser && currentUser.photoURL
      ? currentUser.photoURL
      : currentUser?.gender === "female"
      ? ProfileImageF
      : ProfileImageM;

  return (
    <div className="nav-bar">
      <Link to="/" className="logo">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/008/508/754/small_2x/3d-chat-mail-message-notification-chatting-illustration-png.png"
          alt="logo"
        />
      </Link>
      <div className="usr">
        {isAuthenticated ? (
          <>
            <button
              className="profile"
              onClick={() => setShowProfileSets((prev) => !prev)}
            >
              <img src={profileImage} alt="profile" />
            </button>
            <div
              ref={profileSetsRef}
              className={`profile-sets ${showProfileSets ? "show" : ""}`}
            >
              <h3>{currentUser?.displayName}</h3>
              <button
                onClick={() => {
                  setShowProfileSets(false);
                  navigate("/settings");
                }}
              >
                <IoSettingsSharp />
                Settings
              </button>
              <button onClick={signUserOut}>
                <ImExit />
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <button className="google-btn" onClick={signInWithGoogle}>
            <FcGoogle />
            Continue with Google
          </button>
        )}
      </div>
    </div>
  );
};

export default NavBar;
