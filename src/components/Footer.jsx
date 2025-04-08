import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerRef = useRef(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const handleMouseMove = (e) => {
      const footer = footerRef.current;
      const rect = footer.getBoundingClientRect();

      // Only apply the effect when mouse is over the footer
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = (e.clientY - rect.top) / rect.height;

        // Calculate rotation values based on mouse position
        // Keep rotation subtle for better user experience
        const rotateX = (mouseY - 0.5) * 5; // 5 degrees max rotation
        const rotateY = (0.5 - mouseX) * 5; // 5 degrees max rotation

        // Apply 3D transform to footer
        footer.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        // Make elements inside float a bit
        const links = footer.querySelectorAll(".footer-link");
        const sections = footer.querySelectorAll(".footer-section");

        sections.forEach((section, i) => {
          const translateZ = 10 + (i % 3) * 5; // Varying depths
          section.style.transform = `translateZ(${translateZ}px)`;
        });

        links.forEach((link, i) => {
          const delay = i * 0.05;
          const translateZ = 20 + Math.sin(Date.now() / 1000 + delay) * 5;
          link.style.transform = `translateZ(${translateZ}px)`;
        });
      }
    };

    // Reset on mouse leave
    const handleMouseLeave = () => {
      const footer = footerRef.current;
      if (!footer) return;

      footer.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";

      const elements = footer.querySelectorAll(".footer-section, .footer-link");
      elements.forEach((el) => {
        el.style.transform = "translateZ(0)";
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    footerRef.current.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (footerRef.current) {
        footerRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-glow"></div>
      <div className="footer-grid"></div>

      <div className="footer-content">
        <div className="footer-section brand-section">
          <h3 className="footer-brand">Subsidy System</h3>
          <p className="footer-tagline">
            Empowering communities through transparent allocations
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-icon" aria-label="Discord">
              <i className="fab fa-discord"></i>
            </a>
            <a href="#" className="social-icon" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" className="social-icon" aria-label="Telegram">
              <i className="fab fa-telegram"></i>
            </a>
          </div>
        </div>

        <div className="footer-section links-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to="/" className="footer-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/register" className="footer-link">
                Register
              </Link>
            </li>
            <li>
              <Link to="/upload-kyc" className="footer-link">
                KYC Verification
              </Link>
            </li>
            <li>
              <Link to="/request-subsidy" className="footer-link">
                Request Subsidy
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section resources-section">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-links">
            <li>
              <a href="#" className="footer-link">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                FAQs
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Support
              </a>
            </li>
            <li>
              <a
                href="https://solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Solana
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section legal-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li>
              <a href="#" className="footer-link">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="footer-link">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="copyright">
          &copy; {new Date().getFullYear()} Subsidy System. All rights reserved.
        </div>
        <div className="powered-by">
          Powered by <span className="solana-text">Solana</span>
        </div>
      </div>

      <div className="footer-particles">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="footer-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
