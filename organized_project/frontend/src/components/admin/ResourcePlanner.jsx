import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const ResourcePlanner = () => {
  const [formData, setFormData] = useState({
    location: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    footfall: "",
  });
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);

  // Load locations on component mount
  React.useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/locations`);
      setLocations(response.data.locations);
    } catch (err) {
      console.error("Failed to load locations:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // If we have footfall data, calculate resources directly
      if (formData.footfall) {
        const response = await axios.post(`${API_URL}/resources`, {
          footfall: parseInt(formData.footfall),
        });
        setResources(response.data);
      } else {
        // Otherwise, make a prediction first
        const predictResponse = await axios.post(`${API_URL}/predict`, {
          location: formData.location,
          year: parseInt(formData.year),
          month: parseInt(formData.month),
        });

        const footfall = predictResponse.data.prediction.predicted_footfall;

        const resourceResponse = await axios.post(`${API_URL}/resources`, {
          footfall,
        });

        setResources(resourceResponse.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to calculate resources");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      location: "",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      footfall: "",
    });
    setResources(null);
    setError(null);
  };

  return (
    <div className="resource-planner">
      <div className="planner-header">
        <h1>Resource Planner</h1>
        <p>Calculate required resources based on predicted tourist footfall</p>
      </div>

      {/* Planning Form */}
      <div className="planner-form-container">
        <form className="planner-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required={!formData.footfall}
              >
                <option value="">Select a location</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="year">Year</label>
              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required={!formData.footfall}
              >
                {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="month">Month</label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                required={!formData.footfall}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                  <option key={month} value={month}>
                    {new Date(2022, month - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="footfall">Or Enter Direct Footfall Count</label>
            <input
              type="number"
              id="footfall"
              name="footfall"
              value={formData.footfall}
              onChange={handleInputChange}
              placeholder="Enter expected footfall"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate Resources"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Results */}
      {resources && (
        <div className="planner-results">
          <h2>Resource Requirements</h2>

          <div className="resources-grid">
            {/* Staff Requirements */}
            <div className="resource-card">
              <div className="card-header">
                <i className="fas fa-users"></i>
                <h3>Staff</h3>
              </div>
              <div className="card-body">
                <div className="resource-item">
                  <span className="resource-label">Total Staff:</span>
                  <span className="resource-value">
                    {resources.staff.total}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Guides:</span>
                  <span className="resource-value">
                    {resources.staff.guides}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Security:</span>
                  <span className="resource-value">
                    {resources.staff.security}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Support:</span>
                  <span className="resource-value">
                    {resources.staff.support}
                  </span>
                </div>
              </div>
            </div>

            {/* Transport Requirements */}
            <div className="resource-card">
              <div className="card-header">
                <i className="fas fa-bus"></i>
                <h3>Transport</h3>
              </div>
              <div className="card-body">
                <div className="resource-item">
                  <span className="resource-label">Total Vehicles:</span>
                  <span className="resource-value">
                    {resources.transport.total}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Buses:</span>
                  <span className="resource-value">
                    {resources.transport.buses}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Vans:</span>
                  <span className="resource-value">
                    {resources.transport.vans}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Taxis:</span>
                  <span className="resource-value">
                    {resources.transport.taxis}
                  </span>
                </div>
              </div>
            </div>

            {/* Accommodation Requirements */}
            <div className="resource-card">
              <div className="card-header">
                <i className="fas fa-hotel"></i>
                <h3>Accommodation</h3>
              </div>
              <div className="card-body">
                <div className="resource-item">
                  <span className="resource-label">Rooms Needed:</span>
                  <span className="resource-value">
                    {resources.accommodation.rooms}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Hotels Required:</span>
                  <span className="resource-value">
                    {resources.accommodation.hotels}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Requirements */}
            <div className="resource-card">
              <div className="card-header">
                <i className="fas fa-rupee-sign"></i>
                <h3>Budget</h3>
              </div>
              <div className="card-body">
                <div className="resource-item">
                  <span className="resource-label">Total Budget:</span>
                  <span className="resource-value">
                    ₹{resources.budget.total.toLocaleString()}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Staff Costs:</span>
                  <span className="resource-value">
                    ₹{resources.budget.staff.toLocaleString()}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Transport:</span>
                  <span className="resource-value">
                    ₹{resources.budget.transport.toLocaleString()}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Maintenance:</span>
                  <span className="resource-value">
                    ₹{resources.budget.maintenance.toLocaleString()}
                  </span>
                </div>
                <div className="resource-item">
                  <span className="resource-label">Emergency Buffer:</span>
                  <span className="resource-value">
                    ₹{resources.budget.emergency.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="planner-actions">
            <button className="btn btn-primary">
              <i className="fas fa-download"></i> Download Report
            </button>
            <button className="btn btn-secondary">
              <i className="fas fa-save"></i> Save Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;
