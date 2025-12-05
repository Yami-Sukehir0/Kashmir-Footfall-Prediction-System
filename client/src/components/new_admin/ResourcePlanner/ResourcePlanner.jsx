import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./ResourcePlanner.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const ResourcePlanner = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadResourceData = useCallback(async () => {
    if (!selectedLocation) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/resources`, {
        params: {
          location: selectedLocation,
          month: selectedMonth,
          year: selectedYear,
        },
      });
      setResources(response.data.resources || []);
    } catch (error) {
      console.error("Failed to load resource data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedMonth, selectedYear]);

  useEffect(() => {
    loadResourceData();
  }, [loadResourceData]);

  // Sample locations for demo
  const locations = [
    "Gulmarg",
    "Pahalgam",
    "Sonamarg",
    "Yousmarg",
    "Srinagar",
    "Leh",
    "Kargil",
    "Baramulla",
  ];

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("en-US", { month: "long" }),
  }));

  // Generate year options (next 2 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);

  return (
    <div className="admin-resource-planner">
      <div className="planner-header">
        <h1>Resource Planning</h1>
        <div className="planner-controls">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="control-select"
          >
            <option value="">Select Location</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="control-select"
            disabled={!selectedLocation}
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
            disabled={!selectedLocation}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && selectedLocation ? (
        <div className="planner-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Calculating resource requirements...</p>
        </div>
      ) : selectedLocation ? (
        <div className="planner-content">
          <div className="requirements-summary">
            <h2>Resource Requirements for {selectedLocation}</h2>
            <p className="period">
              {new Date(selectedYear, selectedMonth - 1).toLocaleString(
                "en-US",
                { month: "long", year: "numeric" }
              )}
            </p>
          </div>

          <div className="requirements-grid">
            {resources.length > 0 ? (
              resources.map((resource, index) => (
                <div key={index} className="requirement-card">
                  <div className="requirement-icon">
                    <i
                      className={`fas fa-${getResourceIcon(resource.type)}`}
                    ></i>
                  </div>
                  <h3>{resource.type}</h3>
                  <div className="requirement-value">
                    {resource.quantity} {resource.unit}
                  </div>
                  <div className="requirement-description">
                    {resource.description}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No resource data available</div>
            )}
          </div>
        </div>
      ) : (
        <div className="planner-placeholder">
          <i className="fas fa-cogs"></i>
          <h3>Select a location to view resource requirements</h3>
          <p>Resource planning recommendations based on predicted footfall</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get appropriate icons
const getResourceIcon = (type) => {
  switch (type.toLowerCase()) {
    case "staff":
      return "user-friends";
    case "transport":
      return "bus";
    case "accommodation":
      return "bed";
    case "food":
      return "utensils";
    case "security":
      return "shield-alt";
    default:
      return "box";
  }
};

export default ResourcePlanner;
