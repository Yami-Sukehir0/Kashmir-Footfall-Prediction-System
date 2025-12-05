import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Heatmap.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadHeatmapData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/heatmap`, {
        params: { month: selectedMonth, year: selectedYear },
      });
      setHeatmapData(response.data.heatmap || []);
    } catch (error) {
      console.error("Failed to load heatmap data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadHeatmapData();
  }, [loadHeatmapData]);

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="admin-heatmap">
      <div className="heatmap-header">
        <h1>Visitor Density Heatmap</h1>
        <div className="heatmap-controls">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="control-select"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="control-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="heatmap-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading heatmap data...</p>
        </div>
      ) : (
        <div className="heatmap-container">
          <div className="heatmap-legend">
            <div className="legend-item">
              <div className="color-box low"></div>
              <span>Low Traffic</span>
            </div>
            <div className="legend-item">
              <div className="color-box medium"></div>
              <span>Medium Traffic</span>
            </div>
            <div className="legend-item">
              <div className="color-box high"></div>
              <span>High Traffic</span>
            </div>
            <div className="legend-item">
              <div className="color-box peak"></div>
              <span>Peak Traffic</span>
            </div>
          </div>

          <div className="heatmap-grid">
            {heatmapData.length > 0 ? (
              heatmapData.map((location) => (
                <div key={location.name} className="heatmap-card">
                  <h3>{location.name}</h3>
                  <div className="traffic-indicator">
                    <div
                      className={`traffic-bar ${
                        location.density < 0.3
                          ? "low"
                          : location.density < 0.6
                          ? "medium"
                          : location.density < 0.8
                          ? "high"
                          : "peak"
                      }`}
                      style={{ width: `${location.density * 100}%` }}
                    ></div>
                  </div>
                  <div className="density-value">
                    {Math.round(location.density * 100)}%
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No heatmap data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
