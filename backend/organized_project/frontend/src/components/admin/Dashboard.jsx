import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load statistics from the working endpoint
      const statsResponse = await axios.get(`${API_URL}/predictions/stats`);
      setStats(statsResponse.data);

      // Load recent predictions
      const predictionsResponse = await axios.get(
        `${API_URL}/admin/predictions?limit=5`
      );
      setPredictions(predictionsResponse.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Set default values for demo
      setStats({
        overall: {
          totalPredictions: 1247,
          averageFootfall: 15420,
          locations: 10,
        },
        topLocations: [{ _id: "Gulmarg", count: 245 }],
      });

      setPredictions([
        {
          _id: "1",
          location: "Gulmarg",
          month: "December",
          year: "2024",
          predictedFootfall: 25420,
          confidence: 0.92,
        },
        {
          _id: "2",
          location: "Pahalgam",
          month: "January",
          year: "2025",
          predictedFootfall: 18750,
          confidence: 0.87,
        },
        {
          _id: "3",
          location: "Srinagar",
          month: "February",
          year: "2025",
          predictedFootfall: 32100,
          confidence: 0.95,
        },
        {
          _id: "4",
          location: "Sonamarg",
          month: "March",
          year: "2025",
          predictedFootfall: 12450,
          confidence: 0.89,
        },
        {
          _id: "5",
          location: "Yusmarg",
          month: "April",
          year: "2025",
          predictedFootfall: 8750,
          confidence: 0.82,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard p-4 md:p-6">
      <div className="dashboard-header mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the Kashmir Tourism Management Platform
        </p>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-metrics mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="metric-card rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-blue-100 p-3">
              <i className="fas fa-chart-line text-blue-500 text-xl"></i>
            </div>
            <div className="metric-content">
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.overall?.totalPredictions?.toLocaleString() || 0}
              </h3>
              <p className="text-gray-600 text-sm">Total Predictions</p>
            </div>
          </div>
        </div>

        <div className="metric-card rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-green-100 p-3">
              <i className="fas fa-users text-green-500 text-xl"></i>
            </div>
            <div className="metric-content">
              <h3 className="text-2xl font-bold text-gray-800">
                {Math.round(stats.overall?.averageFootfall)?.toLocaleString() ||
                  0}
              </h3>
              <p className="text-gray-600 text-sm">Avg. Footfall</p>
            </div>
          </div>
        </div>

        <div className="metric-card rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-purple-100 p-3">
              <i className="fas fa-map-marker-alt text-purple-500 text-xl"></i>
            </div>
            <div className="metric-content">
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.overall?.locations || 0}
              </h3>
              <p className="text-gray-600 text-sm">Locations Tracked</p>
            </div>
          </div>
        </div>

        <div className="metric-card rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center">
            <div className="mr-4 rounded-full bg-yellow-100 p-3">
              <i className="fas fa-star text-yellow-500 text-xl"></i>
            </div>
            <div className="metric-content">
              <h3 className="text-2xl font-bold text-gray-800">
                {stats.topLocations?.[0]?._id || "N/A"}
              </h3>
              <p className="text-gray-600 text-sm">Top Location</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations Section */}
      <div className="dashboard-section mb-8 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
        <div className="section-header mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Visitor Trends</h2>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
              Monthly
            </button>
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Quarterly
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
              Yearly
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-chart-bar text-gray-300 text-4xl mb-3"></i>
            <p className="text-gray-500">
              Interactive visitor trend visualization
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Data visualization coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Recent Predictions and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Predictions */}
        <div className="dashboard-section rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="section-header mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Predictions
            </h2>
            <button className="btn btn-primary flex items-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors">
              <i className="fas fa-plus mr-2"></i> New Prediction
            </button>
          </div>

          <div className="predictions-table overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-gray-600 font-medium">
                    Location
                  </th>
                  <th className="pb-3 text-left text-gray-600 font-medium">
                    Date
                  </th>
                  <th className="pb-3 text-left text-gray-600 font-medium">
                    Predicted Footfall
                  </th>
                  <th className="pb-3 text-left text-gray-600 font-medium">
                    Confidence
                  </th>
                  <th className="pb-3 text-left text-gray-600 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((prediction) => (
                  <tr
                    key={prediction._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 text-gray-800 font-medium">
                      {prediction.location}
                    </td>
                    <td className="py-4 text-gray-600">{`${prediction.month} ${prediction.year}`}</td>
                    <td className="py-4 text-gray-800">
                      {prediction.predictedFootfall?.toLocaleString() || "N/A"}
                    </td>
                    <td className="py-4 text-gray-600">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(prediction.confidence || 0) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span>
                          {prediction.confidence
                            ? (prediction.confidence * 100).toFixed(0) + "%"
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="section-header mb-6">
            <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
          </div>

          <div className="quick-actions-grid grid grid-cols-2 gap-4">
            <button className="quick-action-card flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 transition-all duration-300 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md border border-blue-100">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <i className="fas fa-chart-line text-blue-500 text-xl"></i>
              </div>
              <span className="font-medium text-gray-700">Analytics</span>
            </button>

            <button className="quick-action-card flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 transition-all duration-300 hover:from-green-100 hover:to-emerald-100 hover:shadow-md border border-green-100">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <i className="fas fa-map text-green-500 text-xl"></i>
              </div>
              <span className="font-medium text-gray-700">Heatmap</span>
            </button>

            <button className="quick-action-card flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 p-6 transition-all duration-300 hover:from-purple-100 hover:to-violet-100 hover:shadow-md border border-purple-100">
              <div className="bg-purple-100 p-3 rounded-full mb-3">
                <i className="fas fa-cogs text-purple-500 text-xl"></i>
              </div>
              <span className="font-medium text-gray-700">Resources</span>
            </button>

            <button className="quick-action-card flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 transition-all duration-300 hover:from-amber-100 hover:to-orange-100 hover:shadow-md border border-amber-100">
              <div className="bg-amber-100 p-3 rounded-full mb-3">
                <i className="fas fa-users text-amber-500 text-xl"></i>
              </div>
              <span className="font-medium text-gray-700">Users</span>
            </button>
          </div>

          {/* Additional Info Cards */}
          <div className="mt-6 space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center">
                <i className="fas fa-bell text-blue-500 text-xl mr-3"></i>
                <div>
                  <h3 className="font-medium text-gray-800">System Update</h3>
                  <p className="text-sm text-gray-600">
                    New prediction model deployed
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center">
                <i className="fas fa-calendar-check text-green-500 text-xl mr-3"></i>
                <div>
                  <h3 className="font-medium text-gray-800">Monthly Report</h3>
                  <p className="text-sm text-gray-600">Ready for download</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
