import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ links, isOpen, toggleSidebar }) => {
  const { pathname } = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2>Kashmir Tourism</h2>
        <h3>Admin Panel</h3>
        <button className="close-btn" onClick={toggleSidebar}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className={isActive ? "active" : ""}
                  onClick={() => window.innerWidth < 768 && toggleSidebar()}
                >
                  <i className={link.icon}></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
