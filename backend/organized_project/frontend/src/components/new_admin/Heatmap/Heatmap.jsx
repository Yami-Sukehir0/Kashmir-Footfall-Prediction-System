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
      const response = await axios.get(`${API_URL}/admin/heatmap-data`, {
        params: { month: selectedMonth, year: selectedYear },
      });

      // Process the heatmap data to include department-relevant information
      const processedData = (response.data || []).map((location) => ({
        ...location,
        resourceName: `${location.name}-${selectedYear}-${selectedMonth}`,
        riskLevel:
          location.density > 0.8
            ? "Critical"
            : location.density > 0.6
            ? "Warning"
            : "Normal",
        resourceNeeds: {
          staff: Math.ceil(location.expectedVisitors / 50),
          vehicles: Math.ceil(location.expectedVisitors / 1000),
          emergencyServices: location.density > 0.7 ? "Required" : "Standby",
        },
      }));

      setHeatmapData(processedData);
    } catch (error) {
      console.error("Failed to load heatmap data:", error);
      // Set fallback data for demonstration
      setHeatmapData([
        {
          name: "Gulmarg",
          density: 0.92,
          expectedVisitors: 32500,
          resourceName: "Gulmarg-2024-12",
          riskLevel: "Critical",
          resourceNeeds: {
            staff: 650,
            vehicles: 33,
            emergencyServices: "Required",
          },
        },
        {
          name: "Pahalgam",
          density: 0.85,
          expectedVisitors: 28750,
          resourceName: "Pahalgam-2024-12",
          riskLevel: "Critical",
          resourceNeeds: {
            staff: 575,
            vehicles: 29,
            emergencyServices: "Required",
          },
        },
        {
          name: "Sonamarg",
          density: 0.65,
          expectedVisitors: 21500,
          resourceName: "Sonamarg-2024-12",
          riskLevel: "Warning",
          resourceNeeds: {
            staff: 430,
            vehicles: 22,
            emergencyServices: "Standby",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadHeatmapData();
  }, [loadHeatmapData]);

  const handleViewDetails = (location) => {
    // Show detailed location information
    const details = `
Location Details for ${location.name}
================================

Density Level: ${(location.density * 100).toFixed(1)}%
Risk Assessment: ${location.riskLevel}
Expected Visitors: ${location.expectedVisitors?.toLocaleString() || "N/A"}

Resource Requirements:
- Staff Needed: ${location.resourceNeeds?.staff || 0} personnel
- Transport Required: ${location.resourceNeeds?.vehicles || 0} vehicles
- Emergency Services: ${
      location.resourceNeeds?.emergencyServices || "Not Required"
    }

Department Actions:
1. Monitor visitor flow continuously
2. Deploy additional resources if needed
3. Prepare contingency plans
4. Coordinate with local authorities
    `;

    alert(details);
    console.log("Admin viewed location details:", location);
  };

  const handleResourcePlanning = (location) => {
    // Open resource planning interface
    const planning = `
Resource Planning for ${location.name}
==============================

Current Status:
- Visitor Density: ${(location.density * 100).toFixed(1)}%
- Risk Level: ${location.riskLevel}
- Expected Visitors: ${location.expectedVisitors?.toLocaleString() || "N/A"}

Resource Allocation:
[ ] Staff Deployed: [0/${location.resourceNeeds?.staff || 0}]
[ ] Vehicles Assigned: [0/${location.resourceNeeds?.vehicles || 0}]
[ ] Emergency Services: ${
      location.resourceNeeds?.emergencyServices || "Not Required"
    }

Planning Actions:
1. Finalize resource deployment
2. Set up communication channels
3. Establish monitoring checkpoints
4. Prepare incident response teams

Execute Plan [Button]
    `;

    alert(planning);
    console.log("Admin planned resources:", location);
  };

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
                  <div className="card-header">
                    <h3>{location.name}</h3>
                    <span
                      className={`risk-badge ${location.riskLevel.toLowerCase()}`}
                    >
                      {location.riskLevel}
                    </span>
                  </div>
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
                  <div className="expected-visitors">
                    Expected:{" "}
                    {location.expectedVisitors?.toLocaleString() || "N/A"}{" "}
                    visitors
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-small btn-secondary"
                      onClick={() => handleViewDetails(location)}
                    >
                      <i className="fas fa-eye"></i> Details
                    </button>
                    <button
                      className="btn btn-small"
                      onClick={() => handleResourcePlanning(location)}
                    >
                      <i className="fas fa-cogs"></i> Plan
                    </button>
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
