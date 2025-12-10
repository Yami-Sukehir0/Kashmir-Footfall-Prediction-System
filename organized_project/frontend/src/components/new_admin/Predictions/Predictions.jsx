import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Predictions.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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
      "Kokernag",
      "Lolab",
      "Manasbal",
      "Aharbal",
      "Gurez",
    ];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    return Array.from({ length: 20 }, (_, i) => {
      const location = locations[Math.floor(Math.random() * locations.length)];
      const monthOffset = Math.floor(Math.random() * 6); // 0-5 months in future
      const year =
        currentMonth + monthOffset > 12 ? currentYear + 1 : currentYear;
      const month = ((currentMonth + monthOffset - 1) % 12) + 1;

      return {
        _id: `pred_${Date.now()}_${i}`,
        location: location,
        year: year,
        month: month,
        predicted_footfall: Math.floor(5000 + Math.random() * 50000),
        confidence: 0.7 + Math.random() * 0.25,
        user_email:
          i % 3 === 0
            ? "admin@tourismkashmir.gov.in"
            : i % 3 === 1
            ? "planner@tourismkashmir.gov.in"
            : "system@tourismkashmir.gov.in",
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        resourceRequirements: {
          staff: Math.floor(10 + Math.random() * 60),
          vehicles: Math.floor(2 + Math.random() * 20),
          rooms: Math.floor(20 + Math.random() * 150),
        },
      };
    });
  };

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate sample predictions since we don't have a database
      const samplePredictions = generateSamplePredictions();

      // Apply filter
      let filteredPredictions = samplePredictions;
      const now = new Date();

      switch (filter) {
        case "today":
          filteredPredictions = samplePredictions.filter((pred) => {
            const predDate = new Date(pred.createdAt);
            return predDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredPredictions = samplePredictions.filter((pred) => {
            const predDate = new Date(pred.createdAt);
            return predDate >= weekAgo;
          });
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredPredictions = samplePredictions.filter((pred) => {
            const predDate = new Date(pred.createdAt);
            return predDate >= monthAgo;
          });
          break;
        default:
          // "all" - no filtering
          break;
      }

      // Process the predictions data to include department-relevant information
      const processedPredictions = filteredPredictions.map((prediction) => ({
        ...prediction,
        resourceName: `${prediction.location}-${prediction.year}-${prediction.month}`,
        urgencyLevel:
          prediction.confidence > 0.9
            ? "High"
            : prediction.confidence > 0.7
            ? "Medium"
            : "Low",
        resourceRequirements: {
          staff: Math.ceil(prediction.predicted_footfall / 50),
          vehicles: Math.ceil(prediction.predicted_footfall / 1000),
          rooms: Math.ceil((prediction.predicted_footfall * 0.3) / 2),
        },
      }));

      setPredictions(processedPredictions);
    } catch (error) {
      console.error("Failed to load predictions:", error);
      setError("Failed to load predictions. Using demo data instead.");

      // Set fallback data for demonstration
      const demoPredictions = generateSamplePredictions().slice(0, 5);
      setPredictions(demoPredictions);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const handleViewDetails = (prediction) => {
    // Navigate to detailed prediction page
    navigate(`/admin/predictions/${prediction._id}`);
  };

  const handleAllocateResources = (prediction) => {
    // Open resource allocation interface
    alert(
      `Navigating to resource allocation for ${prediction.location}...\n\nIn a future implementation, this would open a dedicated resource allocation interface.`
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRefresh = () => {
    loadPredictions();
  };

  return (
    <div className="admin-predictions">
      <div className="predictions-header">
        <h1>Prediction History</h1>
        <div className="predictions-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Predictions</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="btn btn-small" onClick={handleRefresh}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="predictions-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading predictions...</p>
        </div>
      ) : (
        <div className="predictions-table-container">
          <table className="predictions-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Date</th>
                <th>Predicted Visitors</th>
                <th>Confidence</th>
                <th>Urgency</th>
                <th>Generated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {predictions.length > 0 ? (
                predictions.map((prediction) => (
                  <tr key={prediction._id}>
                    <td>{prediction.location}</td>
                    <td>{formatDate(prediction.createdAt)}</td>
                    <td>{prediction.predicted_footfall?.toLocaleString()}</td>
                    <td>{(prediction.confidence * 100).toFixed(1)}%</td>
                    <td>
                      <span
                        className={`urgency-badge ${prediction.urgencyLevel.toLowerCase()}`}
                      >
                        {prediction.urgencyLevel}
                      </span>
                    </td>
                    <td>{prediction.user_email || "System"}</td>
                    <td>
                      <button
                        className="btn btn-small btn-secondary"
                        onClick={() => handleViewDetails(prediction)}
                      >
                        <i className="fas fa-eye"></i> Details
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleAllocateResources(prediction)}
                      >
                        <i className="fas fa-cogs"></i> Allocate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    No predictions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Predictions;
