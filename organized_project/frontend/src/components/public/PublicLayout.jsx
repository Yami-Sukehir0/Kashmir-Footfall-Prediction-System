import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./PublicLayout.css";

const PublicLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-mountain"></i>
              <span>Kashmir Tourism</span>
            </div>
            <nav className="public-nav">
              <Link
                to="/"
                className={isActive("/") ? "nav-link active" : "nav-link"}
              >
                <i className="fas fa-home"></i>
                Home
              </Link>
              <Link
                to="/features"
                className={
                  isActive("/features") ? "nav-link active" : "nav-link"
                }
              >
                <i className="fas fa-star"></i>
                Features
              </Link>
              <Link
                to="/locations"
                className={
                  isActive("/locations") ? "nav-link active" : "nav-link"
                }
              >
                <i className="fas fa-map-marker-alt"></i>
                Locations
              </Link>
              <Link
                to="/about"
                className={isActive("/about") ? "nav-link active" : "nav-link"}
              >
                <i className="fas fa-info-circle"></i>
                About
              </Link>
              <Link to="/auth/login" className="btn btn-primary">
                <i className="fas fa-sign-in-alt"></i>
                Admin Login
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <div className="footer-logo">
                <i className="fas fa-mountain"></i>
                <span>Kashmir Tourism Platform</span>
              </div>
              <p>
                AI-powered resource management for sustainable tourism
                development
              </p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <Link to="/">Home</Link>
                <Link to="/features">Features</Link>
                <Link to="/locations">Locations</Link>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#">Documentation</a>
                <a href="#">API Reference</a>
                <a href="#">Support</a>
              </div>
              <div className="footer-column">
                <h4>Contact</h4>
                <a href="#">Support Team</a>
                <a href="#">Feedback</a>
                <a href="#">Partnerships</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Kashmir Tourism Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
