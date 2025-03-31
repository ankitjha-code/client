import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Import Components
import Register from "./components/Register";
import UploadKYC from "./components/UploadKYC";
import RequestSubsidy from "./components/RequestSubsidy";
import AdminPanel from "./components/AdminPanel";
import Home from "./components/Home";
import WalletConnect from "./components/WalletConnect";
import UserHistory from "./components/UserHistory";
import UserProfile from "./components/UserProfile";

function App() {
  const [user, setUser] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Set up axios defaults
  axios.defaults.baseURL = "https://server-5a30.onrender.com/api";

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="navbar-brand">Subsidy System</div>
          <div className="navbar-menu">
            <Link to="/">Home</Link>
            {!user && <Link to="/register">Register</Link>}
            {user && !user.kycVerified && (
              <Link to="/upload-kyc">Upload KYC</Link>
            )}
            {user && user.kycVerified && (
              <Link to="/request-subsidy">Request Subsidy</Link>
            )}
            {user && <Link to="/history">My History</Link>}
            {user && <Link to="/profile">My Profile</Link>}
            <Link to="/admin">Admin Panel</Link>
            <WalletConnect
              walletConnected={walletConnected}
              setWalletConnected={setWalletConnected}
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              setUser={setUser}
            />
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route
              path="/register"
              element={
                <Register
                  walletAddress={walletAddress}
                  walletConnected={walletConnected}
                  setUser={setUser}
                />
              }
            />
            <Route
              path="/upload-kyc"
              element={<UploadKYC user={user} setUser={setUser} />}
            />
            <Route
              path="/request-subsidy"
              element={<RequestSubsidy user={user} />}
            />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/history" element={<UserHistory user={user} />} />
            <Route path="/profile" element={<UserProfile user={user} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
