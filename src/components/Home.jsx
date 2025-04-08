import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Home = ({ user }) => {
  const heroRef = useRef(null);

  // Add parallax effect to hero section
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!heroRef.current) return;

      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Calculate mouse distance from center as a percentage
      const deltaX = (clientX - centerX) / centerX;
      const deltaY = (clientY - centerY) / centerY;

      // Select all elements with data-depth attribute
      const parallaxElements = heroRef.current.querySelectorAll("[data-depth]");

      parallaxElements.forEach((el) => {
        const depth = parseFloat(el.getAttribute("data-depth"));
        const moveX = deltaX * depth * 30;
        const moveY = deltaY * depth * 30;

        // Apply transform with smooth transition
        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="enhanced-home-container">
      {/* Hero Section with 3D elements */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-background">
          <div className="hero-circle" data-depth="1.5"></div>
          <div className="hero-circle-2" data-depth="2.5"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title" data-depth="0.5">
            <span className="gradient-text">Blockchain Powered</span>
            <span className="main-title">Subsidy System</span>
          </h1>

          <p className="hero-subtitle" data-depth="0.8">
            Transparent • Secure • Efficient • Decentralized
          </p>

          <div className="hero-buttons" data-depth="1">
            {!user ? (
              <Link to="/register" className="cta-button">
                <span className="cta-text">Get Started</span>
                <span className="cta-icon">→</span>
              </Link>
            ) : !user.kycVerified ? (
              <Link to="/upload-kyc" className="cta-button">
                <span className="cta-text">Complete KYC</span>
                <span className="cta-icon">→</span>
              </Link>
            ) : (
              <Link to="/request-subsidy" className="cta-button">
                <span className="cta-text">Request Subsidy</span>
                <span className="cta-icon">→</span>
              </Link>
            )}

            <a href="#how-it-works" className="secondary-button">
              Learn More
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Transparency</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">Zero</span>
              <span className="stat-label">Intermediaries</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">Solana</span>
              <span className="stat-label">Blockchain</span>
            </div>
          </div>
        </div>

        <div className="hero-floating-elements">
          <div className="float-element cube" data-depth="2"></div>
          <div className="float-element sphere" data-depth="1.5"></div>
          <div className="float-element pyramid" data-depth="2.5"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Our Platform</h2>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon security"></div>
            <h3>Blockchain Security</h3>
            <p>
              Built on Solana's ultra-fast and secure blockchain technology for
              tamper-proof record keeping.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon transparency"></div>
            <h3>Full Transparency</h3>
            <p>
              Every subsidy allocation is recorded on the blockchain, ensuring
              complete audibility.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon speed"></div>
            <h3>Instant Transfers</h3>
            <p>
              Receive your subsidies directly to your wallet within seconds of
              approval.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon verification"></div>
            <h3>Simple Verification</h3>
            <p>
              Fast and straightforward KYC process to ensure eligibility for
              subsidies.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section" id="how-it-works">
        <h2 className="section-title">How It Works</h2>

        <div className="steps-flow">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Connect Your Wallet</h3>
              <p>
                Link your Solana wallet to our platform in one click to get
                started.
              </p>
              {!user && (
                <div className="step-status incomplete">
                  <span className="status-dot"></span>
                  Not Started
                </div>
              )}
              {user && (
                <div className="step-status complete">
                  <span className="status-dot"></span>
                  Completed
                </div>
              )}
            </div>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Complete KYC</h3>
              <p>
                Upload your identification documents securely for verification.
              </p>
              {!user ? (
                <div className="step-status locked">
                  <span className="status-dot"></span>
                  Locked
                </div>
              ) : !user.kycDocumentUrl ? (
                <div className="step-status incomplete">
                  <span className="status-dot"></span>
                  Not Started
                </div>
              ) : !user.kycVerified ? (
                <div className="step-status pending">
                  <span className="status-dot"></span>
                  Pending
                </div>
              ) : (
                <div className="step-status complete">
                  <span className="status-dot"></span>
                  Verified
                </div>
              )}
            </div>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Request Subsidy</h3>
              <p>
                Submit your request with required details and amount needed.
              </p>
              {!user || !user.kycVerified ? (
                <div className="step-status locked">
                  <span className="status-dot"></span>
                  Locked
                </div>
              ) : (
                <div className="step-status available">
                  <span className="status-dot"></span>
                  Available
                </div>
              )}
            </div>
          </div>

          <div className="step-connector"></div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Receive Funds</h3>
              <p>Approved subsidies are transferred directly to your wallet.</p>
              <div className="step-status">
                <span className="status-dot"></span>
                {user && user.allocatedFunds > 0 ? "Received" : "Future Step"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Status Section (only if logged in) */}
      {user && (
        <section className="user-dashboard-section">
          <div className="user-dashboard-card">
            <div className="user-dashboard-header">
              <h2>Welcome Back, {user.name}</h2>
              <span className="dashboard-subtitle">Your Dashboard</span>
            </div>

            <div className="user-dashboard-body">
              <div className="dashboard-stat-row">
                <div className="dashboard-stat">
                  <div className="stat-circle">
                    <div
                      className={`stat-icon ${
                        user.kycVerified ? "verified" : "pending"
                      }`}
                    ></div>
                  </div>
                  <div className="stat-info">
                    <h4>KYC Status</h4>
                    {user.kycVerified ? (
                      <span className="status-verified">Verified</span>
                    ) : user.kycDocumentUrl ? (
                      <span className="status-pending">
                        Pending Verification
                      </span>
                    ) : (
                      <span className="status-incomplete">Not Submitted</span>
                    )}
                  </div>
                </div>

                <div className="dashboard-stat">
                  <div className="stat-circle">
                    <div className="stat-icon funds"></div>
                  </div>
                  <div className="stat-info">
                    <h4>Total Received</h4>
                    <span className="fund-amount">
                      {user.allocatedFunds || 0} SOL
                    </span>
                  </div>
                </div>
              </div>

              <div className="dashboard-actions">
                {!user.kycVerified ? (
                  <Link
                    to="/upload-kyc"
                    className="dashboard-action-btn primary"
                  >
                    {user.kycDocumentUrl ? "Check KYC Status" : "Complete KYC"}
                  </Link>
                ) : (
                  <Link
                    to="/request-subsidy"
                    className="dashboard-action-btn primary"
                  >
                    Request Subsidy
                  </Link>
                )}

                <Link to="/history" className="dashboard-action-btn secondary">
                  View History
                </Link>

                <Link to="/profile" className="dashboard-action-btn tertiary">
                  My Profile
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
