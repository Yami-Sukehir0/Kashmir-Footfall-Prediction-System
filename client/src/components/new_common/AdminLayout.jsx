import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
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
      description: "Overview of key metrics and system status",
    },
    {
      label: "Footfall Predictions",
      href: "/admin/predictions",
      icon: "fas fa-chart-line",
      description: "View and analyze tourist prediction models",
    },
    {
      label: "Visitor Heatmap",
      href: "/admin/heatmap",
      icon: "fas fa-map",
      description: "Real-time visitor distribution visualization",
    },
    {
      label: "Resource Allocation",
      href: "/admin/resources",
      icon: "fas fa-cogs",
      description: "Plan and manage staffing, transport, and facilities",
    },
    {
      label: "User Management",
      href: "/admin/users",
      icon: "fas fa-users",
      description: "Manage administrator accounts and permissions",
    },
    {
      label: "Activity Logs",
      href: "/admin/logs",
      icon: "fas fa-history",
      description: "Audit trail of system activities and changes",
    },
    {
      label: "My Profile",
      href: "/admin/profile",
      icon: "fas fa-user",
      description: "View and update your profile information",
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
        <div className="admin-header-wrapper">
          <Header />
        </div>
        <main className="admin-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
