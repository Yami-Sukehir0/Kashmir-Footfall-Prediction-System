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
      setLogs(response.data.logs || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
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
        return "fa-sign-in-alt";
      case "logout":
        return "fa-sign-out-alt";
      case "prediction":
        return "fa-chart-line";
      case "create_user":
        return "fa-user-plus";
      case "delete_user":
        return "fa-user-minus";
      case "update_resource":
        return "fa-cogs";
      default:
        return "fa-info-circle";
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
                      <span className="log-action">
                        {log.action.replace("_", " ")}
                      </span>
                    </div>
                    <div className="log-details">{log.details}</div>
                    <div className="log-timestamp">
                      {formatDate(log.timestamp)}
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
