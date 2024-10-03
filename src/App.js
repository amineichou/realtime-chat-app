import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/nav-bar";
import Home from "./pages/home";
import Cookies from "universal-cookie";
import { Suspense, useState } from "react";
import HomeUser from "./pages/user/home-user";
import LoadingPage from "./components/loading-page";
import Settings from "./pages/user/settings/settings";
import RoomPage from "./pages/user/chat/room-page";
import UserProfile from "./pages/user/user-profile";

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
          <Home />
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
            <Route path="/users/:userId" element={<UserProfile />} />
            <Route path="/rooms/:roomId" element={<RoomPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
