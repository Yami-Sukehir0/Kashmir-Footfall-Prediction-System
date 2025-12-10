import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const PredictionAnalytics = () => {
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    year: "",
    month: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
    loadLocations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [predictions, filters]);

  const loadPredictions = async () => {
    try {
      const response = await axios.get(`${API_URL}/predictions`);
      setPredictions(response.data);
      setFilteredPredictions(response.data);
    } catch (error) {
      console.error("Failed to load predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/locations`);
      setLocations(response.data.locations);
    } catch (error) {
      console.error("Failed to load locations:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...predictions];

    if (filters.location) {
      filtered = filtered.filter((p) => p.location === filters.location);
    }

    if (filters.year) {
      filtered = filtered.filter((p) => p.year === parseInt(filters.year));
    }

    if (filters.month) {
      filtered = filtered.filter((p) => p.month === parseInt(filters.month));
    }

    setFilteredPredictions(filtered);
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
      location: "",
      year: "",
      month: "",
    });
  };

  // Prepare data for charts
  const lineChartData = {
    labels: filteredPredictions.map((p) => `${p.month}/${p.year}`),
    datasets: [
      {
        label: "Predicted Footfall",
        data: filteredPredictions.map((p) => p.predictedFootfall),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "Confidence",
        data: filteredPredictions.map((p) => p.confidence * 100),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const barChartData = {
    labels: [...new Set(filteredPredictions.map((p) => p.location))],
    datasets: [
      {
        label: "Average Footfall",
        data: [...new Set(filteredPredictions.map((p) => p.location))].map(
          (location) => {
            const locPredictions = filteredPredictions.filter(
              (p) => p.location === location
            );
            const totalFootfall = locPredictions.reduce(
              (sum, p) => sum + p.predictedFootfall,
              0
            );
            return Math.round(totalFootfall / locPredictions.length);
          }
        ),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="prediction-analytics">
      <div className="analytics-header">
        <h1>Prediction Analytics</h1>
        <p>
          Advanced analytics and visualizations for tourist footfall predictions
        </p>
      </div>

      {/* Filters */}
      <div className="analytics-filters">
        <div className="filter-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
          >
            <option value="">All Locations</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year">Year</label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
          >
            <option value="">All Years</option>
            {[2020, 2021, 2022, 2023, 2024, 2025].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="month">Month</label>
          <select
            id="month"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
          >
            <option value="">All Months</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
              <option key={month} value={month}>
                {new Date(2022, month - 1).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-secondary" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Charts */}
      <div className="analytics-charts">
        <div className="chart-container">
          <h3>Footfall Trend Over Time</h3>
          <Line data={lineChartData} />
        </div>

        <div className="chart-container">
          <h3>Average Footfall by Location</h3>
          <Bar data={barChartData} />
        </div>
      </div>

      {/* Data Table */}
      <div className="analytics-table">
        <h3>Prediction Data</h3>
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Date</th>
              <th>Predicted Footfall</th>
              <th>Confidence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPredictions.map((prediction) => (
              <tr key={prediction._id}>
                <td>{prediction.location}</td>
                <td>{`${prediction.month}/${prediction.year}`}</td>
                <td>{prediction.predictedFootfall?.toLocaleString()}</td>
                <td>{(prediction.confidence * 100).toFixed(1)}%</td>
                <td>
                  <button className="btn btn-small btn-primary">
                    <i className="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PredictionAnalytics;
