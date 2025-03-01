import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase-config"; // Assuming firebase-config is your Firebase config
import "./App.css";
import NavBar from "./components/nav-bar";
import Home from "./pages/home";
import HomeUser from "./pages/user/home-user";
import Settings from "./pages/user/settings/settings";
import UserProfile from "./pages/user/user-profile";
import Register from "./pages/register";
import Login from "./pages/login";
import EditProfile from "./pages/user/edit-profile";
import RoomPage from "./pages/user/chat/room-page";
import NoPage from "./components/NoPage";
import DmPage from "./pages/user/chat/dm-page";
import Wave from "react-wavify";
import LoadingPage from "./components/loading-page";

var audio = new Audio("/new.wav"); // Load your audio file

function playAudio() {
  if (audio && audio.paused) {
    audio.play().catch((error) => {
      console.log("Audio playback was prevented", error);
    });
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null); // State to track authenticated user

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setAuthUser(user); // Set the authenticated user
        detectNewMessages(user.uid); // Start listening for new messages
      } else {
        setIsAuthenticated(false);
        setAuthUser(null);
      }
      setLoading(false); // Set loading to false after checking auth state
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const detectNewMessages = (userId) => {
    const messagesCollection = collection(db, "messages");
    const q = query(messagesCollection, where("user", "!=", userId)); // Query for messages not from the current user

    // Listen for real-time updates to messages
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          // Check if the new message is from another user
          const newMessage = change.doc.data();
          if (newMessage.user !== userId) {
            const urlParam = window.location.pathname;
            if (!urlParam.includes("dm")) {
              playAudio();
            }
          }
        }
      });
    });

    return () => unsubscribe(); // Clean up the listener when no longer needed
  };

  if (loading) {
    return <LoadingPage />; // Show a loading state while checking auth
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <div className="App">
          <NavBar
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={<Login setIsAuthenticated={setIsAuthenticated} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
          <div className="wave">
            <div className="copyright">
              {/* <p>Cloudhangouts C 2024 By</p> */}
              <p>By</p>
              <a href="https://github.com/amineichou">amine ichou</a>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="App">
        <NavBar
          setIsAuthenticated={setIsAuthenticated}
          isAuthenticated={isAuthenticated}
        />
        <Routes>
          <Route path="/" element={<HomeUser />} />
          <Route
            path="/settings"
            element={<Settings setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route path="/users/:username" element={<UserProfile />} />
          <Route path="/rooms/:roomId" element={<RoomPage />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/dm/:dmId" element={<DmPage />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
