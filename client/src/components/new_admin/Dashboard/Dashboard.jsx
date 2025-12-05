import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const statsResponse = await axios.get(`${API_URL}/admin/stats`);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Set default values for demo
      setStats({
        overall: {
          totalPredictions: 1247,
          averageFootfall: 15420,
          locations: 10,
        },
        topLocations: [
          { _id: "Gulmarg", count: 245 },
          { _id: "Pahalgam", count: 198 },
          { _id: "Srinagar", count: 176 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the Kashmir Tourism Management Platform</p>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3>{stats.overall?.totalPredictions?.toLocaleString() || 0}</h3>
            <p>Total Predictions</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="metric-content">
            <h3>
              {Math.round(stats.overall?.averageFootfall)?.toLocaleString() ||
                0}
            </h3>
            <p>Avg. Footfall</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <div className="metric-content">
            <h3>{stats.overall?.locations || 0}</h3>
            <p>Locations Tracked</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="metric-content">
            <h3>{stats.topLocations?.[0]?._id || "N/A"}</h3>
            <p>Top Location</p>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Visitor Trends</h2>
          </div>
          <div className="chart-placeholder">
            <i className="fas fa-chart-bar"></i>
            <p>Interactive visitor trend visualization</p>
            <p className="subtitle">Data visualization coming soon</p>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Resource Allocation</h2>
          </div>
          <div className="chart-placeholder">
            <i className="fas fa-cogs"></i>
            <p>Resource planning dashboard</p>
            <p className="subtitle">Advanced analytics coming soon</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-activity">
        <div className="activity-header">
          <h2>Recent Activity</h2>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="activity-content">
              <p>New prediction generated for Gulmarg (June 2024)</p>
              <span className="timestamp">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="activity-content">
              <p>New admin user invited</p>
              <span className="timestamp">1 day ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <i className="fas fa-cogs"></i>
            </div>
            <div className="activity-content">
              <p>Resource plan updated for Pahalgam</p>
              <span className="timestamp">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
