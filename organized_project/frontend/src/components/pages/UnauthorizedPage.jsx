import React from "react";
import { Link } from "react-router-dom";
import "./UnauthorizedPage.css";

const UnauthorizedPage = () => {
  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h1 className="error-title">Access Denied</h1>
          <p className="error-message">
            You don't have permission to access this page. This area is
            restricted to authorized administrators only.
          </p>
          <div className="error-actions">
            <Link to="/" className="btn btn-primary">
              <i className="fas fa-home"></i>
              Return to Home
            </Link>
            <Link to="/auth/login" className="btn btn-secondary">
              <i className="fas fa-sign-in-alt"></i>
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
