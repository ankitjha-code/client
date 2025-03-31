import React from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = ({ user }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="profile-container">
        <h2>User Profile</h2>
        <p>Please sign in to view your profile.</p>
        <button onClick={() => navigate("/")} className="action-btn">
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <div className="profile-card">
        <div className="profile-header">
          <h3>{user.name}</h3>
          <span className="wallet-address">
            Wallet:{" "}
            {`${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(
              -4
            )}`}
          </span>
        </div>

        <div className="profile-details">
          <div className="profile-detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user.email}</span>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">Registration Date:</span>
            <span className="detail-value">
              {new Date(user.registeredAt).toLocaleDateString()}
            </span>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">KYC Status:</span>
            <span className="detail-value">
              {user.kycVerified ? (
                <span className="status-approved">Verified</span>
              ) : user.kycDocumentUrl ? (
                <span className="status-pending">Pending Verification</span>
              ) : (
                <span className="status-incomplete">Not Submitted</span>
              )}
            </span>
          </div>

          {user.kycVerifiedAt && (
            <div className="profile-detail-item">
              <span className="detail-label">KYC Verified On:</span>
              <span className="detail-value">
                {new Date(user.kycVerifiedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="profile-detail-item">
            <span className="detail-label">Total Subsidies Received:</span>
            <span className="detail-value">{user.allocatedFunds || 0} SOL</span>
          </div>
        </div>

        <div className="profile-actions">
          {!user.kycVerified && (
            <button
              onClick={() => navigate("/upload-kyc")}
              className="action-btn"
            >
              {user.kycDocumentUrl ? "Update KYC" : "Submit KYC"}
            </button>
          )}

          {user.kycVerified && (
            <button
              onClick={() => navigate("/request-subsidy")}
              className="action-btn"
            >
              Request Subsidy
            </button>
          )}

          <button
            onClick={() => navigate("/history")}
            className="action-btn secondary"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
