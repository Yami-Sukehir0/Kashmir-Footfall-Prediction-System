import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const HeatmapInteractive = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    loadHeatmapData();
    loadLocations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [heatmapData, filters]);

  const loadHeatmapData = async () => {
    try {
      const response = await axios.get(`${API_URL}/predictions/heatmap-data`);
      setHeatmapData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error("Failed to load heatmap data:", error);
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
    let filtered = [...heatmapData];

    if (filters.year) {
      filtered = filtered.filter((d) => d._id.year === parseInt(filters.year));
    }

    if (filters.month) {
      filtered = filtered.filter(
        (d) => d._id.month === parseInt(filters.month)
      );
    }

    if (filters.location) {
      filtered = filtered.filter((d) => d._id.location === filters.location);
    }

    setFilteredData(filtered);
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
      year: "",
      month: "",
      location: "",
    });
  };

  // Generate heatmap matrix
  const generateHeatmapMatrix = () => {
    const matrix = {};
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const locations = [...new Set(filteredData.map((d) => d._id.location))];

    // Initialize matrix
    locations.forEach((location) => {
      matrix[location] = {};
      months.forEach((month) => {
        matrix[location][month] = 0;
      });
    });

    // Fill with actual data
    filteredData.forEach((data) => {
      const { location, month } = data._id;
      const footfall = data.footfall;
      if (matrix[location]) {
        matrix[location][month] = footfall;
      }
    });

    return { matrix, locations, months };
  };

  const {
    matrix,
    locations: matrixLocations,
    months,
  } = generateHeatmapMatrix();

  // Get color based on footfall value
  const getColor = (value) => {
    const maxValue = Math.max(
      ...Object.values(matrix).flatMap((loc) => Object.values(loc))
    );
    const intensity = maxValue > 0 ? value / maxValue : 0;

    if (intensity === 0) return "#f0f0f0";
    if (intensity < 0.2) return "#ffeb3b";
    if (intensity < 0.4) return "#ffc107";
    if (intensity < 0.6) return "#ff9800";
    if (intensity < 0.8) return "#ff5722";
    return "#f44336";
  };

  if (loading) {
    return <div className="heatmap-loading">Loading heatmap...</div>;
  }

  return (
    <div className="heatmap-interactive">
      <div className="heatmap-header">
        <h1>Interactive Heatmap</h1>
        <p>
          Visualize tourist footfall patterns across locations and time periods
        </p>
      </div>

      {/* Filters */}
      <div className="heatmap-filters">
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

        <button className="btn btn-secondary" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Heatmap Visualization */}
      <div className="heatmap-container">
        <div className="heatmap-legend">
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#f0f0f0" }}
            ></div>
            <span>0</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ffeb3b" }}
            ></div>
            <span>Low</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ffc107" }}
            ></div>
            <span></span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ff9800" }}
            ></div>
            <span>Medium</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#ff5722" }}
            ></div>
            <span></span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#f44336" }}
            ></div>
            <span>High</span>
          </div>
        </div>

        <div className="heatmap-table-container">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Location</th>
                {months.map((month) => (
                  <th key={month}>
                    {new Date(2022, month - 1).toLocaleString("default", {
                      month: "short",
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixLocations.map((location) => (
                <tr key={location}>
                  <td>{location}</td>
                  {months.map((month) => (
                    <td
                      key={month}
                      className="heatmap-cell"
                      style={{
                        backgroundColor: getColor(matrix[location][month]),
                      }}
                      title={`${location} - ${new Date(
                        2022,
                        month - 1
                      ).toLocaleString("default", {
                        month: "long",
                      })}: ${Math.round(
                        matrix[location][month]
                      ).toLocaleString()} visitors`}
                    >
                      {matrix[location][month] > 0
                        ? Math.round(matrix[location][month] / 1000) + "k"
                        : ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Summary */}
      <div className="heatmap-summary">
        <h3>Data Summary</h3>
        <div className="summary-stats">
          <div className="stat-card">
            <h4>Total Records</h4>
            <p>{filteredData.length}</p>
          </div>
          <div className="stat-card">
            <h4>Locations</h4>
            <p>{matrixLocations.length}</p>
          </div>
          <div className="stat-card">
            <h4>Date Range</h4>
            <p>{filters.year || "All Years"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapInteractive;
