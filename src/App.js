import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/nav-bar";
import Home from "./pages/home";
import Cookies from "universal-cookie";
import { useState } from "react";
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
            <Route path="*" element={<NoPage />} />
          </Routes>
          <div className="wave">
            <Wave
              fill="#2B9FFF"
              paused={false}
              style={{ display: "flex" }}
              options={{
                height: 10,
                amplitude: 30,
                speed: 0.15,
                points: 5,
              }}
            />
            <div className="copyright">
              <p>Cloudhangouts C 2024 By</p>
              <a href="github.com/CloudHangouts">amine ichou</a>
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
