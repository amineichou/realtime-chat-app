import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/nav-bar";
import Home from "./pages/home";
import Cookies from "universal-cookie";
import { Suspense, useState } from "react";
import HomeUser from "./pages/user/home-user";
import LoadingPage from "./components/loading-page";
import Settings from "./pages/user/settings/settings";
import UserProfile from "./pages/user/user-profile";
import Register from "./pages/register";
import Login from "./pages/login";
import EditProfile from "./pages/user/edit-profile";
import RoomPage from "./pages/user/chat/room-page";
import NoPage from "./components/NoPage";
import DmPage from "./pages/user/chat/dm-page";

const cookies = new Cookies();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    cookies.get("auth-token")
  );

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
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
  return (
    <Suspense fallback={<LoadingPage />}>
      <BrowserRouter>
        <div className="App">
          <NavBar
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
          />
          <Routes>
            <Route path="/" element={<HomeUser />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users/:username" element={<UserProfile />} />
            <Route path="/rooms/:roomId" element={<RoomPage />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/dm/:dmId" element={<DmPage />} />
            <Route path="*" element={<NoPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
