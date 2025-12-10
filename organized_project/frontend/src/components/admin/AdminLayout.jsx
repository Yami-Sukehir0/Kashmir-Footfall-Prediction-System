import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import "./admin-styles.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/login");
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        links={sidebarLinks}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out transform ${
          sidebarOpen ? "md:ml-64" : "md:ml-20"
        }`}
      >
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden transition-all duration-200 ease-in-out transform hover:scale-105"
            >
              <i className="fas fa-bars text-lg"></i>
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl w-10 h-10 flex items-center justify-center shadow-md">
                  <i className="fas fa-user text-white"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                    {currentUser?.email || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 transition-all duration-300 ease-in-out">
          <div className="animate-fadeInUp">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm py-4 px-6 text-center text-sm text-gray-600">
          <p>© 2025 Kashmir Tourism Department. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
