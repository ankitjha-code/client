import React from "react";
import { Link } from "react-router-dom";

const Home = ({ user }) => {
  return (
    <div className="home-container">
      <h1>Welcome to the Subsidy System</h1>

      <div className="info-box">
        <h2>About This System</h2>
        <p>
          This platform allows eligible users to apply for subsidies through a
          transparent and secure process powered by Solana blockchain
          technology.
        </p>
      </div>

      <div className="steps-container">
        <h2>How It Works</h2>

        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Register</h3>
            <p>
              Connect your Solana wallet and complete the registration form.
            </p>
            {!user && (
              <Link to="/register" className="action-btn">
                Register Now
              </Link>
            )}
            {user && <span className="status-approved">Completed</span>}
          </div>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Complete KYC</h3>
            <p>Upload your identification documents for verification.</p>
            {user && !user.kycVerified && (
              <Link to="/upload-kyc" className="action-btn">
                Upload KYC
              </Link>
            )}
          </div>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Request Subsidy</h3>
            <p>Once verified, submit your subsidy request with details.</p>
            {user && user.kycVerified && (
              <Link to="/request-subsidy" className="action-btn">
                Request Subsidy
              </Link>
            )}
          </div>
        </div>

        <div className="step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3>Receive Funds</h3>
            <p>
              Approved subsidies are sent directly to your connected wallet.
            </p>
          </div>
        </div>
      </div>

      {user && (
        <div className="user-status">
          <h2>Your Status</h2>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>KYC Status:</strong>
            {user.kycVerified ? (
              <span className="status-verified">Verified</span>
            ) : user.kycDocumentUrl ? (
              <span className="status-pending">Pending Verification</span>
            ) : (
              <span className="status-incomplete">Not Submitted</span>
            )}
          </p>

          {user.kycVerified ? (
            <Link to="/request-subsidy" className="primary-btn">
              Request Subsidy
            </Link>
          ) : user.kycDocumentUrl ? (
            <p className="info-text">
              Your KYC is under review. Please check back later.
            </p>
          ) : (
            <Link to="/upload-kyc" className="primary-btn">
              Complete KYC
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
