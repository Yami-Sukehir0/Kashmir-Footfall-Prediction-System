import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

export function Sidebar({ links, isOpen, toggleSidebar }) {
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ease-in-out md:static md:translate-x-0 shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg transform transition-transform duration-300 hover:scale-105">
            <i className="fas fa-mountain text-xl"></i>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            }`}
          >
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Kashmir Tourism
            </span>
            <p className="text-xs text-gray-400 -mt-1">Admin Panel</p>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-gray-800 md:hidden text-gray-300 hover:text-white transition-colors duration-200"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {links.map((link, index) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                to={link.href}
                className={cn(
                  "group relative flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02]",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md"
                )}
                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                style={{
                  transitionDelay: isOpen ? `${index * 30}ms` : "0ms",
                }}
              >
                <div className="flex items-center justify-center">
                  <i
                    className={cn(
                      link.icon,
                      "text-lg transition-transform duration-200 group-hover:scale-110"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300 ease-in-out",
                    isOpen
                      ? "max-w-xs opacity-100"
                      : "max-w-0 opacity-0 overflow-hidden absolute"
                  )}
                >
                  {link.label}
                </span>
                {!isOpen && (
                  <div className="absolute left-12 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform translate-x-2 group-hover:translate-x-0">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="px-3 mt-6 pt-6 border-t border-gray-700">
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            }`}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Support
            </p>
            <Link
              to="/admin/help"
              className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
            >
              <i className="fas fa-question-circle text-lg"></i>
              <span>Help Center</span>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
            >
              <i className="fas fa-cog text-lg"></i>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`px-4 py-3 border-t border-gray-700 text-xs text-gray-500 transition-all duration-500 ease-in-out transform ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        v1.0.0
      </div>
    </div>
  );
}

export default Sidebar;
