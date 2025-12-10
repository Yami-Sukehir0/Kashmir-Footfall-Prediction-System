import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: "all",
    action: "",
    admin: "",
  });

  useEffect(() => {
    loadActivityLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadActivityLogs = async () => {
    try {
      // In a real implementation, you would fetch actual logs from the backend
      // For now, we'll create sample data
      const sampleLogs = [
        {
          _id: "1",
          adminEmail: "admin@tourismkashmir.gov.in",
          action: "create",
          resource: "Prediction",
          details: "Created new prediction for Gulmarg (June 2024)",
          ipAddress: "192.168.1.100",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          _id: "2",
          adminEmail: "manager@tourismkashmir.gov.in",
          action: "update",
          resource: "Resource Plan",
          details: "Updated resource plan for Pahalgam (July 2024)",
          ipAddress: "192.168.1.101",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          _id: "3",
          adminEmail: "admin@tourismkashmir.gov.in",
          action: "delete",
          resource: "User",
          details: "Removed user account for former employee",
          ipAddress: "192.168.1.100",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          _id: "4",
          adminEmail: "director@tourismkashmir.gov.in",
          action: "create",
          resource: "Report",
          details: "Generated monthly visitor report",
          ipAddress: "192.168.1.200",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
      ];

      setLogs(sampleLogs);
      setFilteredLogs(sampleLogs);
    } catch (error) {
      setError("Failed to load activity logs");
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Apply date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate;

      switch (filters.dateRange) {
        case "today":
          cutoffDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case "week":
          cutoffDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= cutoffDate
      );
    }

    // Apply action filter
    if (filters.action) {
      filtered = filtered.filter((log) => log.action === filters.action);
    }

    // Apply admin filter
    if (filters.admin) {
      filtered = filtered.filter((log) =>
        log.adminEmail.includes(filters.admin)
      );
    }

    setFilteredLogs(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: "all",
      action: "",
      admin: "",
    });
  };

  const exportLogs = () => {
    // In a real implementation, you would export the logs to a file
    alert("Logs exported successfully!");
  };

  if (loading) {
    return <div className="logs-loading">Loading activity logs...</div>;
  }

  return (
    <div className="activity-logs">
      <div className="logs-header">
        <h1>Activity Logs</h1>
        <p>Audit trail of all administrative actions</p>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        <div className="filter-group">
          <label htmlFor="dateRange">Date Range</label>
          <select
            id="dateRange"
            name="dateRange"
            value={filters.dateRange}
            onChange={handleFilterChange}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="action">Action Type</label>
          <select
            id="action"
            name="action"
            value={filters.action}
            onChange={handleFilterChange}
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="read">Read</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="admin">Admin Email</label>
          <input
            type="text"
            id="admin"
            name="admin"
            value={filters.admin}
            onChange={handleFilterChange}
            placeholder="Filter by admin email"
          />
        </div>

        <button className="btn btn-secondary" onClick={clearFilters}>
          Clear Filters
        </button>

        <button className="btn btn-primary" onClick={exportLogs}>
          <i className="fas fa-download"></i> Export Logs
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Admin</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log._id}>
                <td>{log.adminEmail}</td>
                <td>
                  <span className={`action-badge action-${log.action}`}>
                    {log.action}
                  </span>
                </td>
                <td>{log.resource}</td>
                <td>{log.details}</td>
                <td>{log.ipAddress}</td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;
