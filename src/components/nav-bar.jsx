import React, { useEffect, useState, useRef } from "react";
import "../styles-global/nav-bar.css";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { signOut } from "firebase/auth";
import Cookies from "universal-cookie";
import { IoNotifications, IoSettingsSharp } from "react-icons/io5";
import { ImExit } from "react-icons/im";
import LoadingPage from "./loading-page";
import { FaPlus, FaUser } from "react-icons/fa";
import { TbUsersPlus } from "react-icons/tb";
import AddRoom from "./create-room";
import JoinRoom from "./join-room";
import Notifications from "./notifications";
import { collection, doc, onSnapshot, getDoc } from "firebase/firestore";

const cookies = new Cookies();

const ProfileImageF = "/images/profile-f.jpeg";
const ProfileImageM = "/images/profile-m.jpeg";

const NavBar = ({ setIsAuthenticated, isAuthenticated }) => {
  const [userData, setUserData] = useState(null); // State to store Firestore user data
  const [showProfileSets, setShowProfileSets] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileSetsRef = useRef(null);
  const notificationsRef = useRef(null); // Reference for notifications
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState([]);
  const notificationsColl = collection(db, "notifications");

  // Fetch unread notifications count and list
  useEffect(() => {
    const unsubscribe = onSnapshot(notificationsColl, (snapshot) => {
      if (!auth.currentUser) return; // Ensure the user is authenticated

      const userId = auth.currentUser.uid;
      const fetchedNotifications = snapshot.docs.map((doc) => doc.data());
      setNotificationsList(fetchedNotifications); // Update the notifications list

      const unreadNotifications = fetchedNotifications.filter(
        (data) => !data.readBy?.includes(userId)
      );
      setUnreadCount(unreadNotifications.length); // Set unread count
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Fetch authenticated user data from Firestore
  useEffect(() => {
    const fetchUserData = async (uid) => {
      try {
        const userDoc = doc(db, "users", uid); // Reference to user document in Firestore
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          setUserData(userSnap.data()); // Save Firestore user data in state
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid); // Fetch user data from Firestore when authenticated
      }
      setLoaded(true);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  // Handle click outside the profile dropdown and notifications to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileSetsRef.current &&
        !profileSetsRef.current.contains(event.target)
      ) {
        setShowProfileSets(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, []);

  const signUserOut = async () => {
    try {
      setShowProfileSets(false);
      await signOut(auth);
      cookies.remove("auth-token");
      setIsAuthenticated(false);
      setUserData(null);
    } catch (error) {
      console.error("Sign-Out Error:", error.message);
    }
  };

  if (!loaded) {
    return <LoadingPage />;
  }

  const profileImage =
    userData?.image || // Use Firestore photoURL
    (userData?.gender === "female" ? ProfileImageF : ProfileImageM); // Default based on gender

  return (
    <>
      {isAuthenticated && (
        <>
          <AddRoom
            displayBox={showCreateRoom}
            setDisplayBox={setShowCreateRoom}
          />
          <JoinRoom displayBox={showJoinRoom} setDisplayBox={setShowJoinRoom} />
          {showNotifications && (
            <div ref={notificationsRef}>
              <Notifications
                notifications={notificationsList} // Pass notifications to component
                setShowNotifications={setShowNotifications} // Toggle visibility
              />
            </div>
          )}
        </>
      )}
      <div className="nav-bar">
        <Link to="/" className="logo">
          <img
            src="/logo.png"
            alt="logo"
          />
        </Link>
        <div className="usr">
          {isAuthenticated ? (
            <>
              <button
                className="usr-sets"
                onClick={() => setShowCreateRoom((prev) => !prev)}
              >
                <FaPlus />
              </button>
              <button
                className="usr-sets"
                onClick={() => setShowJoinRoom((prev) => !prev)}
              >
                <TbUsersPlus />
              </button>
              <button
                className="usr-sets notification"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <p>{unreadCount > 0 ? unreadCount : ""}</p>
                <IoNotifications />
              </button>
              <button
                className="profile"
                onClick={() => setShowProfileSets((prev) => !prev)}
              >
                <img src={profileImage} alt="profile" />
              </button>
              {showProfileSets && (
                <div ref={profileSetsRef} className="profile-sets show">
                  <h3>{userData.username}</h3>
                  <button
                    onClick={() => {
                      setShowProfileSets(false);
                      navigate(`/users/${userData.username}`);
                    }}
                  >
                    <FaUser />
                    Profile
                  </button>
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
              )}
            </>
          ) : (
            <div className="login">
              <Link to="/login" className="lg">Login</Link>
              <Link to="/register" className="re">Register</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;
