import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="public-header">
      <div className="container">
        <div className="header-brand">
          <Link to="/">
            <h1>Kashmir Tourism Platform</h1>
          </Link>
        </div>
        <nav className="header-nav">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/features">Features</Link>
            </li>
            <li>
              <Link to="/locations">Locations</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <li>
                    <Link to="/admin">Admin Panel</Link>
                  </li>
                )}
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/auth/login">Admin Login</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
