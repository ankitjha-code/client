import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = ({ walletAddress, walletConnected, setUser }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletConnected) {
      setError("Please connect your wallet first!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("/users/register", {
        name,
        email,
        walletAddress,
      });

      if (response.data.success) {
        setUser(response.data.user);
        navigate("/upload-kyc");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register for Subsidy Program</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="wallet">Wallet Address</label>
          <input
            type="text"
            id="wallet"
            value={walletAddress}
            disabled
            className="disabled-input"
          />
          {!walletConnected && (
            <p className="help-text">Please connect your wallet first</p>
          )}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || !walletConnected}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
