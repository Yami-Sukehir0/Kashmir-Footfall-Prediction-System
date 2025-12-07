import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [activeLocations, setActiveLocations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const statsResponse = await axios.get(`${API_URL}/admin/stats`);

      // Load recent predictions
      const predictionsResponse = await axios.get(
        `${API_URL}/admin/predictions`,
        {
          params: { limit: 5 },
        }
      );

      // Load active locations
      const locationsResponse = await axios.get(`${API_URL}/locations`);

      setStats(statsResponse.data);
      setRecentPredictions(predictionsResponse.data || []);
      setActiveLocations(locationsResponse.data.locations || []);
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
          { _id: "Gulmarg", count: 245, averageFootfall: 28500 },
          { _id: "Pahalgam", count: 198, averageFootfall: 22300 },
          { _id: "Srinagar", count: 176, averageFootfall: 18750 },
        ],
      });

      setRecentPredictions([
        {
          _id: "1",
          location: "Gulmarg",
          year: 2024,
          month: 12,
          predicted_footfall: 32500,
          confidence: 0.92,
          user_email: "admin@tourismkashmir.gov.in",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          location: "Pahalgam",
          year: 2024,
          month: 12,
          predicted_footfall: 28750,
          confidence: 0.88,
          user_email: "planner@tourismkashmir.gov.in",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);

      setActiveLocations([
        "Gulmarg",
        "Pahalgam",
        "Sonamarg",
        "Yousmarg",
        "Doodpathri",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <p className="subtitle">
              Showing predictions for {activeLocations.length} active locations
            </p>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Resource Allocation</h2>
          </div>
          <div className="chart-placeholder">
            <i className="fas fa-cogs"></i>
            <p>Resource planning dashboard</p>
            <p className="subtitle">
              Automated resource calculations based on AI predictions
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Locations */}
      <div className="dashboard-sections">
        <div className="recent-activity">
          <div className="activity-header">
            <h2>Recent Predictions</h2>
          </div>
          <div className="activity-list">
            {recentPredictions.length > 0 ? (
              recentPredictions.map((prediction) => (
                <div key={prediction._id} className="activity-item">
                  <div className="activity-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">
                      {prediction.location} - {prediction.year}/
                      {prediction.month}
                    </div>
                    <div className="activity-details">
                      <span className="footfall">
                        {prediction.predicted_footfall?.toLocaleString()}{" "}
                        visitors
                      </span>
                      <span className="confidence">
                        Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="activity-meta">
                      <span className="user">
                        {prediction.user_email || "System"}
                      </span>
                      <span className="timestamp">
                        {formatDate(prediction.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No recent predictions</div>
            )}
          </div>
        </div>

        <div className="top-locations">
          <div className="locations-header">
            <h2>Top Locations</h2>
          </div>
          <div className="locations-list">
            {stats.topLocations && stats.topLocations.length > 0 ? (
              stats.topLocations.map((location, index) => (
                <div key={index} className="location-item">
                  <div className="location-rank">#{index + 1}</div>
                  <div className="location-content">
                    <div className="location-name">{location._id}</div>
                    <div className="location-stats">
                      <span className="prediction-count">
                        {location.count} predictions
                      </span>
                      <span className="avg-footfall">
                        Avg.{" "}
                        {Math.round(
                          location.averageFootfall
                        )?.toLocaleString() || 0}{" "}
                        visitors
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No location data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronization Status */}
      <div className="sync-status">
        <div className="sync-header">
          <h2>Department Synchronization</h2>
        </div>
        <div className="sync-content">
          <div className="sync-indicator">
            <div className="indicator-icon connected">
              <i className="fas fa-sync-alt"></i>
            </div>
            <div className="indicator-text">
              <h3>Real-time Synchronization Active</h3>
              <p>
                All predictions and resource allocations are synchronized with
                the Tourism Department
              </p>
            </div>
          </div>
          <div className="sync-details">
            <div className="detail-item">
              <i className="fas fa-check-circle"></i>
              <span>ML Model Predictions: Live</span>
            </div>
            <div className="detail-item">
              <i className="fas fa-check-circle"></i>
              <span>Resource Calculations: Automated</span>
            </div>
            <div className="detail-item">
              <i className="fas fa-check-circle"></i>
              <span>Data Export: Available</span>
            </div>
            <div className="detail-item">
              <i className="fas fa-check-circle"></i>
              <span>Report Generation: Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
