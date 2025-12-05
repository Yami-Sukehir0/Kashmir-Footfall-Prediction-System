import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import "../../components/new_admin/admin-components.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sidebarLinks = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: "fas fa-tachometer-alt",
    },
    {
      label: "Predictions",
      href: "/admin/predictions",
      icon: "fas fa-chart-line",
    },
    {
      label: "Heatmap",
      href: "/admin/heatmap",
      icon: "fas fa-map",
    },
    {
      label: "Resource Planner",
      href: "/admin/resources",
      icon: "fas fa-cogs",
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: "fas fa-users",
    },
    {
      label: "Activity Logs",
      href: "/admin/logs",
      icon: "fas fa-history",
    },
    {
      label: "Profile",
      href: "/admin/profile",
      icon: "fas fa-user",
    },
  ];

  return (
    <div className="admin-layout">
      <Sidebar
        links={sidebarLinks}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="user-info">
              <i className="fas fa-user"></i>
              <span>{currentUser?.email || "Admin User"}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
        <footer className="admin-footer">
          <p>© 2025 Kashmir Tourism Department. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
