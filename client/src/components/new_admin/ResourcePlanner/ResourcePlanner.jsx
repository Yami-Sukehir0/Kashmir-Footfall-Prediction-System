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
  const [predictionData, setPredictionData] = useState(null);

  const loadResourceData = useCallback(async () => {
    if (!selectedLocation) return;

    try {
      setLoading(true);

      // First, get prediction data for this location
      const predictionResponse = await axios.post(`${API_URL}/predict`, {
        location: selectedLocation,
        year: selectedYear,
        month: selectedMonth,
      });

      setPredictionData(predictionResponse.data.prediction);

      // Then calculate resources based on predicted footfall
      const resourceResponse = await axios.post(`${API_URL}/resources`, {
        footfall: predictionResponse.data.prediction.predicted_footfall,
      });

      // Transform the resource data into a more structured format
      const resourceData = [
        {
          type: "Staff",
          quantity: resourceResponse.data.staff.total,
          unit: "personnel",
          description: `Includes ${resourceResponse.data.staff.guides} tour guides, ${resourceResponse.data.staff.security} security personnel, and ${resourceResponse.data.staff.support} support staff`,
          details: [
            { name: "Tour Guides", value: resourceResponse.data.staff.guides },
            {
              name: "Security Personnel",
              value: resourceResponse.data.staff.security,
            },
            {
              name: "Support Staff",
              value: resourceResponse.data.staff.support,
            },
          ],
        },
        {
          type: "Transportation",
          quantity: resourceResponse.data.transport.total,
          unit: "vehicles",
          description: `Comprising ${resourceResponse.data.transport.buses} buses, ${resourceResponse.data.transport.vans} vans, and ${resourceResponse.data.transport.taxis} taxis`,
          details: [
            { name: "Buses", value: resourceResponse.data.transport.buses },
            { name: "Vans", value: resourceResponse.data.transport.vans },
            { name: "Taxis", value: resourceResponse.data.transport.taxis },
          ],
        },
        {
          type: "Accommodation",
          quantity: resourceResponse.data.accommodation.rooms,
          unit: "rooms",
          description: `Spread across approximately ${resourceResponse.data.accommodation.hotels} hotels and guesthouses`,
          details: [
            {
              name: "Total Rooms Needed",
              value: resourceResponse.data.accommodation.rooms,
            },
            {
              name: "Estimated Hotels",
              value: resourceResponse.data.accommodation.hotels,
            },
          ],
        },
        {
          type: "Budget Estimate",
          quantity: (resourceResponse.data.budget.total / 100000).toFixed(1),
          unit: "lakhs ₹",
          description:
            "Total estimated budget for all resources including emergency provisions",
          details: [
            {
              name: "Staff Costs",
              value: `₹${(resourceResponse.data.budget.staff / 100000).toFixed(
                1
              )} lakhs`,
            },
            {
              name: "Transport Costs",
              value: `₹${(
                resourceResponse.data.budget.transport / 100000
              ).toFixed(1)} lakhs`,
            },
            {
              name: "Maintenance",
              value: `₹${(
                resourceResponse.data.budget.maintenance / 100000
              ).toFixed(1)} lakhs`,
            },
            {
              name: "Emergency Fund",
              value: `₹${(
                resourceResponse.data.budget.emergency / 100000
              ).toFixed(1)} lakhs`,
            },
          ],
        },
      ];

      setResources(resourceData);
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
    "Doodpathri",
    "Kokernag",
    "Lolab",
    "Manasbal",
    "Aharbal",
    "Gurez",
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
          <p>Calculating resource requirements based on AI predictions...</p>
        </div>
      ) : selectedLocation ? (
        <div className="planner-content">
          {predictionData && (
            <div className="prediction-summary">
              <h2>Prediction Summary for {selectedLocation}</h2>
              <div className="prediction-details">
                <div className="detail-card">
                  <div className="detail-value">
                    {predictionData.predicted_footfall?.toLocaleString() ||
                      "N/A"}
                  </div>
                  <div className="detail-label">Expected Visitors</div>
                </div>
                <div className="detail-card">
                  <div className="detail-value">
                    {(predictionData.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="detail-label">Prediction Confidence</div>
                </div>
                <div className="detail-card">
                  <div className="detail-value">
                    {predictionData.comparative_analysis?.change > 0 ? "+" : ""}
                    {predictionData.comparative_analysis?.change?.toFixed(1) ||
                      "0.0"}
                    %
                  </div>
                  <div className="detail-label">
                    vs {predictionData.comparative_analysis?.reference_period}
                  </div>
                </div>
              </div>

              {predictionData.insights &&
                predictionData.insights.length > 0 && (
                  <div className="prediction-insights">
                    <h3>Key Insights</h3>
                    <ul>
                      {predictionData.insights
                        .slice(0, 3)
                        .map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          <div className="requirements-grid">
            {resources.length > 0 ? (
              resources.map((resource, index) => (
                <div key={index} className="requirement-card">
                  <div className="requirement-header">
                    <div className="requirement-icon">
                      <i
                        className={`fas fa-${getResourceIcon(resource.type)}`}
                      ></i>
                    </div>
                    <h3>{resource.type}</h3>
                  </div>
                  <div className="requirement-main">
                    <div className="requirement-value">
                      {resource.quantity}{" "}
                      <span className="unit">{resource.unit}</span>
                    </div>
                    <div className="requirement-description">
                      {resource.description}
                    </div>
                  </div>
                  {resource.details && (
                    <div className="requirement-details">
                      {resource.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="detail-row">
                          <span className="detail-name">{detail.name}:</span>
                          <span className="detail-value">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
          <p>
            Resource planning recommendations based on AI-powered footfall
            predictions
          </p>
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
    case "transportation":
      return "bus";
    case "accommodation":
      return "bed";
    case "budget estimate":
      return "rupee-sign";
    default:
      return "box";
  }
};

export default ResourcePlanner;
