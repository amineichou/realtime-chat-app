import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import NavBar from "./components/nav-bar";
import Home from "./pages/home";
import Cookies from "universal-cookie";
import { useState } from "react";

export const cookies = new Cookies();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    <div className="App">
      <NavBar />
      <Home />
    </div>;
  }
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
