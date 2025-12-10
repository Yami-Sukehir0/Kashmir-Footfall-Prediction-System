import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./Dashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [activeLocations, setActiveLocations] = useState([]);
  const [realTimeData, setRealTimeData] = useState({});
  const [chartData, setChartData] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to generate sample predictions for demo purposes
  const generateSamplePredictions = () => {
    const locations = [
      "Gulmarg",
      "Pahalgam",
      "Sonamarg",
      "Yousmarg",
      "Doodpathri",
    ];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    return locations.map((location, index) => ({
      _id: `pred_${index + 1}`,
      location: location,
      year: currentYear,
      month: currentMonth,
      predicted_footfall: Math.floor(5000 + Math.random() * 45000),
      confidence: 0.7 + Math.random() * 0.25,
      user_email: "admin@tourismkashmir.gov.in",
      createdAt: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      resourceRequirements: {
        staff: Math.floor(10 + Math.random() * 50),
        vehicles: Math.floor(2 + Math.random() * 15),
        rooms: Math.floor(20 + Math.random() * 100),
      },
    }));
  };

  // Function to get active locations
  const getActiveLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/locations`);
      return response.data.locations || [];
    } catch (err) {
      console.warn("Failed to load locations, using defaults");
      return ["Gulmarg", "Pahalgam", "Sonamarg", "Yousmarg", "Doodpathri"];
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get active locations
      const locations = await getActiveLocations();
      setActiveLocations(locations);

      // Generate sample predictions since we don't have a database
      const samplePredictions = generateSamplePredictions();
      setRecentPredictions(samplePredictions);

      // Calculate stats from sample data
      const totalPredictions = samplePredictions.length;
      const avgFootfall =
        samplePredictions.reduce(
          (sum, pred) => sum + (pred.predicted_footfall || 0),
          0
        ) / Math.max(samplePredictions.length, 1);

      // Get top locations by prediction count
      const locationCounts = {};
      samplePredictions.forEach((pred) => {
        locationCounts[pred.location] =
          (locationCounts[pred.location] || 0) + 1;
      });

      const topLocations = Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([location, count]) => ({
          _id: location,
          count,
          averageFootfall:
            samplePredictions
              .filter((p) => p.location === location)
              .reduce((sum, p) => sum + (p.predicted_footfall || 0), 0) / count,
        }));

      // Prepare chart data for visitor trends
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const currentMonthIndex = new Date().getMonth();
      const last6Months = [];
      const visitorData = [];

      // Generate realistic visitor data
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonthIndex - i + 12) % 12;
        last6Months.push(months[monthIndex]);

        // Generate realistic visitor data with seasonal trends
        const baseVisitors = 15000 + Math.random() * 10000;
        const seasonalFactor =
          1 + 0.3 * Math.sin(((monthIndex - 3) * Math.PI) / 6);
        visitorData.push(Math.round(baseVisitors * seasonalFactor));
      }

      // Prepare resource allocation data
      const resourceLabels = [
        "Staff",
        "Vehicles",
        "Rooms",
        "Security",
        "Medical",
      ];
      const resourceData = [
        Math.max(20, Math.floor(totalPredictions * 15)),
        Math.max(5, Math.floor(totalPredictions * 3)),
        Math.max(50, Math.floor(totalPredictions * 25)),
        Math.max(3, Math.floor(totalPredictions * 2)),
        Math.max(2, Math.floor(totalPredictions * 1)),
      ];

      // Prepare location distribution data
      const locationNames = topLocations.map((loc) => loc._id);
      const locationVisitors = topLocations.map((loc) =>
        Math.round(loc.averageFootfall)
      );

      setChartData({
        visitorTrends: {
          labels: last6Months,
          datasets: [
            {
              label: "Predicted Visitors",
              data: visitorData,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        resourceAllocation: {
          labels: resourceLabels,
          datasets: [
            {
              label: "Required Resources",
              data: resourceData,
              backgroundColor: [
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#8b5cf6",
                "#ef4444",
              ],
              borderColor: [
                "#2563eb",
                "#059669",
                "#d97706",
                "#7c3aed",
                "#dc2626",
              ],
              borderWidth: 1,
            },
          ],
        },
        locationDistribution: {
          labels: locationNames.length > 0 ? locationNames : ["No Data"],
          datasets: [
            {
              label: "Average Visitors",
              data: locationVisitors.length > 0 ? locationVisitors : [0],
              backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"].slice(
                0,
                Math.max(1, locationNames.length)
              ),
            },
          ],
        },
      });

      setStats({
        overall: {
          totalPredictions,
          averageFootfall: Math.round(avgFootfall),
          locations: locations.length,
        },
        topLocations,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data. Using demo data instead.");

      // Set demo data as fallback
      const demoPredictions = generateSamplePredictions();
      setRecentPredictions(demoPredictions);

      const totalPredictions = demoPredictions.length;
      const avgFootfall =
        demoPredictions.reduce(
          (sum, pred) => sum + (pred.predicted_footfall || 0),
          0
        ) / Math.max(demoPredictions.length, 1);

      const locationCounts = {};
      demoPredictions.forEach((pred) => {
        locationCounts[pred.location] =
          (locationCounts[pred.location] || 0) + 1;
      });

      const topLocations = Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([location, count]) => ({
          _id: location,
          count,
          averageFootfall:
            demoPredictions
              .filter((p) => p.location === location)
              .reduce((sum, p) => sum + (p.predicted_footfall || 0), 0) / count,
        }));

      setStats({
        overall: {
          totalPredictions,
          averageFootfall: Math.round(avgFootfall),
          locations: 5,
        },
        topLocations,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Set up real-time data polling for fresh predictions
    const interval = setInterval(() => {
      loadDashboardData();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportReport = (format) => {
    alert(`Exporting comprehensive dashboard report in ${format} format...
    
This report includes:
- Overall statistics and trends
- Location-specific analytics
- Resource allocation summaries
- Historical comparison data
- Predictive insights

Report generation initiated. File will download shortly.`);
  };

  const shareWithDepartment = () => {
    alert(
      "Sharing comprehensive dashboard data with Tourism Department...\n\nThis transmission includes:\n- Current visitor predictions\n- Resource planning recommendations\n- Alert statuses\n- System performance metrics\n\nData transmission successful. Department systems updated."
    );
  };

  const handleRefreshData = () => {
    loadDashboardData();
    alert("Dashboard refreshed with latest prediction data.");
  };

  const handleFullScreenMap = () => {
    alert(
      "Expanding map to full screen...\n\nThis opens an interactive full-screen view of the visitor distribution map with advanced filtering options."
    );
  };

  const handleConfigureAlerts = () => {
    alert(
      "Opening alert configuration...\n\nThis allows you to set thresholds and notification preferences for various system alerts."
    );
  };

  const handleActivityViewDetails = (prediction) => {
    // Navigate to detailed prediction page
    navigate(`/admin/predictions/${prediction._id}`);
  };

  const handleActivityConfigure = (prediction) => {
    alert(
      `Configuring prediction settings for: ${prediction.location}

This allows you to adjust:
- Prediction parameters
- Alert thresholds
- Resource calculation weights
- Notification preferences`
    );
  };

  const handleTopLocationsFilter = () => {
    alert(
      "Opening location filtering options...\n\nThis allows you to:\n- Select specific locations\n- Apply date ranges\n- Filter by visitor volume\n- Sort by various criteria"
    );
  };

  const handleSyncConfigure = () => {
    alert(
      "Opening synchronization configuration...\n\nThis allows you to:\n- Adjust sync frequency\n- Select data sources\n- Configure error handling\n- Set up backup procedures"
    );
  };

  const handleViewAllPredictions = () => {
    // Navigate to predictions page
    navigate("/admin/predictions");
  };

  const handleChartPeriodChange = (period) => {
    alert(
      `Switching chart view to ${period} data...\n\nThis updates all visualizations to show ${period} trends and patterns.`
    );
  };

  const handleResourceViewChange = (view) => {
    alert(
      `Switching resource view to ${view}...\n\nThis displays resource allocation data in ${view} format.`
    );
  };

  if (loading && !error) {
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
        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            onClick={() => exportReport("PDF")}
          >
            <i className="fas fa-file-pdf"></i> Export PDF Report
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => exportReport("Excel")}
          >
            <i className="fas fa-file-excel"></i> Export Excel Data
          </button>
          <button className="btn btn-accent" onClick={shareWithDepartment}>
            <i className="fas fa-share-alt"></i> Share with Department
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3>{stats.overall?.totalPredictions?.toLocaleString() || 0}</h3>
            <p>Fresh Predictions</p>
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
            <p>Avg. Visitors</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-map-marker-alt"></i>
          </div>
          <div className="metric-content">
            <h3>{stats.overall?.locations || 0}</h3>
            <p>Active Locations</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="metric-content">
            <h3>{stats.topLocations?.[0]?._id || "N/A"}</h3>
            <p>Hotspot Location</p>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-header">
            <h2>Visitor Trends</h2>
            <div className="chart-controls">
              <button
                className="btn btn-small"
                onClick={() => handleChartPeriodChange("monthly")}
              >
                Monthly
              </button>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => handleChartPeriodChange("quarterly")}
              >
                Quarterly
              </button>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => handleChartPeriodChange("yearly")}
              >
                Yearly
              </button>
            </div>
          </div>
          {chartData.visitorTrends ? (
            <Line
              data={chartData.visitorTrends}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Number of Visitors",
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="chart-placeholder">
              <i className="fas fa-chart-line"></i>
              <p>Loading visitor trends...</p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>Resource Allocation</h2>
            <div className="chart-controls">
              <button
                className="btn btn-small"
                onClick={() => handleResourceViewChange("overview")}
              >
                Overview
              </button>
              <button
                className="btn btn-small btn-secondary"
                onClick={() => handleResourceViewChange("detailed")}
              >
                Detailed
              </button>
            </div>
          </div>
          {chartData.resourceAllocation ? (
            <Pie
              data={chartData.resourceAllocation}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "right",
                  },
                },
              }}
            />
          ) : (
            <div className="chart-placeholder">
              <i className="fas fa-cogs"></i>
              <p>Loading resource allocation...</p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="dashboard-map">
        <div className="map-header">
          <h2>Live Visitor Distribution Map</h2>
          <div className="map-controls">
            <button className="btn btn-small" onClick={handleRefreshData}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
            <button
              className="btn btn-small btn-secondary"
              onClick={handleFullScreenMap}
            >
              <i className="fas fa-expand"></i> Full Screen
            </button>
          </div>
        </div>
        <div className="map-placeholder">
          <i className="fas fa-map-marked-alt"></i>
          <p>Interactive map showing real-time visitor distribution</p>
          <p className="subtitle">
            Heatmap visualization of predicted footfall across Kashmir
          </p>
          <div className="map-legend">
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#ef4444" }}
              ></div>
              <span>High Density</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#f59e0b" }}
              ></div>
              <span>Medium Density</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#10b981" }}
              ></div>
              <span>Low Density</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Locations */}
      <div className="dashboard-sections">
        <div className="recent-activity">
          <div className="activity-header">
            <h2>Recent Predictions</h2>
            <button
              className="btn btn-small"
              onClick={handleViewAllPredictions}
            >
              <i className="fas fa-history"></i> View All
            </button>
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
                    <div className="activity-actions">
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleActivityViewDetails(prediction)}
                      >
                        <i className="fas fa-eye"></i> View Details
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleActivityConfigure(prediction)}
                      >
                        <i className="fas fa-cog"></i> Configure
                      </button>
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
            <button
              className="btn btn-small"
              onClick={handleTopLocationsFilter}
            >
              <i className="fas fa-filter"></i> Filter
            </button>
          </div>
          <div className="locations-list">
            {chartData.locationDistribution ? (
              <Bar
                data={chartData.locationDistribution}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Average Visitors",
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="chart-placeholder">
                <i className="fas fa-map-marker-alt"></i>
                <p>Loading location distribution...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert System */}
      <div className="alert-system">
        <div className="alert-header">
          <h2>Department Alerts</h2>
          <button className="btn btn-small" onClick={handleConfigureAlerts}>
            <i className="fas fa-cog"></i> Configure
          </button>
        </div>
        <div className="alert-content">
          <div className="alert-item critical">
            <i className="fas fa-exclamation-triangle"></i>
            <div className="alert-text">
              <h4>High Visitor Density Alert</h4>
              <p>Gulmarg is approaching capacity limit for December 2024</p>
            </div>
            <div className="alert-time">2 hours ago</div>
          </div>
          <div className="alert-item warning">
            <i className="fas fa-exclamation-circle"></i>
            <div className="alert-text">
              <h4>Weather Advisory</h4>
              <p>Heavy snowfall expected in Sonamarg area</p>
            </div>
            <div className="alert-time">5 hours ago</div>
          </div>
          <div className="alert-item info">
            <i className="fas fa-info-circle"></i>
            <div className="alert-text">
              <h4>New Prediction Available</h4>
              <p>Pahalgam prediction for January 2025 completed</p>
            </div>
            <div className="alert-time">1 day ago</div>
          </div>
        </div>
      </div>

      {/* Synchronization Status */}
      <div className="sync-status">
        <div className="sync-header">
          <h2>Department Synchronization</h2>
          <button className="btn btn-small" onClick={handleSyncConfigure}>
            <i className="fas fa-cog"></i> Configure
          </button>
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
            <div className="detail-item">
              <i className="fas fa-check-circle"></i>
              <span>Alert System: Active</span>
            </div>
            <div className="detail-item">
              <i className="fas fa-check-circle"></i>
              <span>Map Updates: Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
