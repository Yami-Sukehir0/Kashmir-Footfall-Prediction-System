import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./ActivityLogs.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/activity-logs`, {
        params: {
          filter,
          page,
          limit: 10,
        },
      });

      // Process logs to include department-relevant information
      const processedLogs = (response.data.logs || []).map((log) => ({
        ...log,
        departmentImpact: getDepartmentImpact(log.action),
        priority: getLogPriority(log.action),
        category: getLogCategory(log.action),
      }));

      setLogs(processedLogs);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
      // Set fallback data for demonstration
      setLogs([
        {
          _id: "demo1",
          user_email: "admin@tourismkashmir.gov.in",
          action: "prediction_generated",
          details: "Generated footfall prediction for Gulmarg (Dec 2024)",
          timestamp: new Date().toISOString(),
          departmentImpact: "High",
          priority: "Urgent",
          category: "Prediction",
        },
        {
          _id: "demo2",
          user_email: "planner@tourismkashmir.gov.in",
          action: "resource_allocated",
          details: "Allocated 650 staff for Gulmarg prediction",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          departmentImpact: "High",
          priority: "High",
          category: "Resource Management",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "login":
      case "signin":
        return "fa-sign-in-alt";
      case "logout":
      case "signout":
        return "fa-sign-out-alt";
      case "prediction":
      case "prediction_generated":
        return "fa-chart-line";
      case "create_user":
        return "fa-user-plus";
      case "delete_user":
        return "fa-user-minus";
      case "update_resource":
      case "resource_allocated":
        return "fa-cogs";
      case "system_alert":
        return "fa-exclamation-triangle";
      case "report_generated":
        return "fa-file-pdf";
      default:
        return "fa-info-circle";
    }
  };

  const getDepartmentImpact = (action) => {
    switch (action) {
      case "prediction_generated":
      case "resource_allocated":
        return "High";
      case "login":
      case "create_user":
      case "delete_user":
        return "Medium";
      default:
        return "Low";
    }
  };

  const getLogPriority = (action) => {
    switch (action) {
      case "prediction_generated":
        return "Urgent";
      case "resource_allocated":
      case "system_alert":
        return "High";
      case "login":
      case "create_user":
      case "delete_user":
        return "Medium";
      default:
        return "Low";
    }
  };

  const getLogCategory = (action) => {
    switch (action) {
      case "prediction_generated":
        return "Prediction";
      case "resource_allocated":
      case "update_resource":
        return "Resource Management";
      case "login":
      case "logout":
      case "signin":
      case "signout":
        return "Access Control";
      case "create_user":
      case "delete_user":
        return "User Management";
      case "system_alert":
        return "System Alerts";
      case "report_generated":
        return "Reporting";
      default:
        return "General";
    }
  };

  return (
    <div className="admin-activity-logs">
      <div className="logs-header">
        <h1>Activity Logs</h1>
        <div className="logs-controls">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Activities</option>
            <option value="login">Logins</option>
            <option value="prediction">Predictions</option>
            <option value="user_management">User Management</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="logs-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading activity logs...</p>
        </div>
      ) : (
        <div className="logs-content">
          <div className="logs-list">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log._id} className="log-item">
                  <div className="log-icon">
                    <i className={`fas ${getActionIcon(log.action)}`}></i>
                  </div>
                  <div className="log-content">
                    <div className="log-header">
                      <span className="log-user">
                        {log.user_email || "Unknown User"}
                      </span>
                      <div className="log-meta">
                        <span className="log-category">{log.category}</span>
                        <span
                          className={`log-priority ${log.priority?.toLowerCase()}`}
                        >
                          {log.priority}
                        </span>
                      </div>
                    </div>
                    <div className="log-details">{log.details}</div>
                    <div className="log-footer">
                      <div className="log-timestamp">
                        {formatDate(log.timestamp)}
                      </div>
                      <span
                        className={`log-impact ${log.departmentImpact?.toLowerCase()} impact`}
                      >
                        Impact: {log.departmentImpact}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No activity logs found</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
