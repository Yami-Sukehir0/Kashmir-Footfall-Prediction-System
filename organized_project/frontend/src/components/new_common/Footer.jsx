import React from "react";

const Footer = () => {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <h3>Kashmir Tourism Platform</h3>
            <p>
              Predicting footfall for better resource management in Kashmir's
              tourism sector.
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul>
                <li>
                  <a href="/">Home</a>
                </li>
                <li>
                  <a href="/features">Features</a>
                </li>
                <li>
                  <a href="/locations">Locations</a>
                </li>
                <li>
                  <a href="/about">About</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <ul>
                <li>
                  <a href="/admin">Admin Panel</a>
                </li>
                <li>
                  <a href="/auth/login">Login</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Contact</h4>
              <ul>
                <li>Tourism Department</li>
                <li>Srinagar, Jammu & Kashmir</li>
                <li>contact@tourismkashmir.gov.in</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Kashmir Tourism Department. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
