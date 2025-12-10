import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Check if we're in admin area
  const isAdminArea = location.pathname.startsWith("/admin");

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
              <Link
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/features"
                className={location.pathname === "/features" ? "active" : ""}
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/locations"
                className={location.pathname === "/locations" ? "active" : ""}
              >
                Locations
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={location.pathname === "/about" ? "active" : ""}
              >
                About
              </Link>
            </li>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <>
                    {isAdminArea ? (
                      <li>
                        <Link
                          to="/"
                          className={
                            location.pathname === "/" && !isAdminArea
                              ? "active"
                              : ""
                          }
                        >
                          Public View
                        </Link>
                      </li>
                    ) : (
                      <li>
                        <Link
                          to="/admin"
                          className={
                            location.pathname.startsWith("/admin")
                              ? "active"
                              : ""
                          }
                        >
                          Admin Panel
                        </Link>
                      </li>
                    )}
                  </>
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
