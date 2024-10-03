import React, { useEffect, useState, useRef } from "react";
import "../styles-global/nav-bar.css";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, provider } from "../firebase-config";
import { signInWithPopup, signOut } from "firebase/auth";
import Cookies from "universal-cookie";
import { IoNotifications, IoSettingsSharp } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import LoadingPage from "./loading-page";
import { FaPlus } from "react-icons/fa";
import { TbUsersPlus } from "react-icons/tb";
import AddRoom from "./create-room";
import JoinRoom from "./join-room";
import Notifications from "./notifications";
import { collection, onSnapshot } from "firebase/firestore";

const cookies = new Cookies();

const ProfileImageF = "/images/profile-f.jpeg";
const ProfileImageM = "/images/profile-m.jpeg";

const NavBar = ({ setIsAuthenticated, isAuthenticated }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileSets, setShowProfileSets] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileSetsRef = useRef(null);
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]); // Store notifications list
  const notificationsColl = collection(db, "notifications");

  // Fetch unread notifications count and list
  useEffect(() => {
    if (!auth.currentUser) return; // Ensure the user is authenticated before proceeding
    const userId = auth.currentUser.uid;

    const unsubscribe = onSnapshot(notificationsColl, (snapshot) => {
      const unreadNotifications = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return !data.readBy?.includes(userId); // Notifications not read by user
      });

      setNotificationsList(snapshot.docs.map((doc) => doc.data())); // Update the list of notifications
      setUnreadCount(Math.max(unreadNotifications.length, 0)); // Ensure the count is never negative
    });

    return () => unsubscribe();
  }, []);

  // Handle user authentication state
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

  // Handle click outside the profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileSetsRef.current &&
        !profileSetsRef.current.contains(event.target)
      ) {
        setShowProfileSets(false);
        setShowNotifications(false);
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
    <>
      {isAuthenticated && (
        <AddRoom
          displayBox={showCreateRoom}
          setDisplayBox={setShowCreateRoom}
        />
      )}
      {isAuthenticated && (
        <JoinRoom displayBox={showJoinRoom} setDisplayBox={setShowJoinRoom} />
      )}
      {isAuthenticated && showNotifications && (
        <Notifications
          notifications={notificationsList} // Pass notifications to component
          setShowNotifications={setShowNotifications} // Toggle visibility
        />
      )}
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
                className="usr-sets"
                onClick={() => setShowCreateRoom(!showCreateRoom)}
              >
                <FaPlus />
              </button>
              <button
                className="usr-sets"
                onClick={() => setShowJoinRoom(!showJoinRoom)}
              >
                <TbUsersPlus />
              </button>
              <button
                className="usr-sets notification"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <p>{unreadCount}</p>
                <IoNotifications />
              </button>
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
                <h3>{currentUser?.displayName || "User"}</h3>
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
    </>
  );
};

export default NavBar;
