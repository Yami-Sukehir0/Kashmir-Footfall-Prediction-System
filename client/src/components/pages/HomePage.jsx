import React, { useState, useEffect } from "react";
import axios from "axios";
import Hero from "../Hero";
import PredictionForm from "../PredictionForm";
import { useAuth } from "../../context/AuthContext";
import "./HomePage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const HomePage = () => {
  const { isAdmin } = useAuth();
  const [locations, setLocations] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [featuredLocations, setFeaturedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    loadLocations();
    loadStatistics();
    loadFeaturedLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/locations`);
      setLocations(response.data.locations);
    } catch (err) {
      console.error("Failed to load locations:", err);
      // Fallback data
      setLocations([
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
      ]);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/statistics`);
      setStatistics(response.data);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      // Fallback data
      setStatistics({
        totalVisitors: 1250000,
        avgMonthlyVisitors: 104000,
        peakMonth: "July",
        peakLocation: "Gulmarg",
      });
    }
  };

  const loadFeaturedLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/featured-locations`);
      setFeaturedLocations(response.data);
    } catch (err) {
      console.error("Failed to load featured locations:", err);
      // Fallback data
      setFeaturedLocations([
        {
          name: "Gulmarg",
          description:
            "World-famous ski resort with breathtaking mountain views and adventure activities.",
          avgFootfall: "85,000",
          image: "/placeholder-location.jpg",
        },
        {
          name: "Pahalgam",
          description:
            "Picturesque valley town known as the 'Valley of Flowers' with lush green meadows.",
          avgFootfall: "72,000",
          image: "/placeholder-location.jpg",
        },
        {
          name: "Sonamarg",
          description:
            "Stunning valley surrounded by snow-capped peaks and pristine lakes.",
          avgFootfall: "58,000",
          image: "/placeholder-location.jpg",
        },
      ]);
    }
  };

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      // Call the actual prediction API
      const response = await axios.post(`${API_URL}/predict`, formData);
      setPredictionResult(response.data);
      // Show success message
      alert(
        `Prediction generated successfully!\nExpected visitors: ${response.data.prediction.predicted_footfall?.toLocaleString()}`
      );
    } catch (err) {
      console.error("Prediction failed:", err);
      setError(
        err.response?.data?.error || "Prediction failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <Hero />

      {/* Statistics Section */}
      <section className="statistics-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tourism Statistics</h2>
            <p className="section-subtitle">Key metrics for Kashmir tourism</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <h3>
                  {statistics.totalVisitors?.toLocaleString() || "1,250,000"}
                </h3>
                <p>Total Visitors</p>
              </div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-content">
                <h3>
                  {statistics.avgMonthlyVisitors?.toLocaleString() || "104,000"}
                </h3>
                <p>Avg. Monthly Visitors</p>
              </div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
              <div className="stat-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="stat-content">
                <h3>{statistics.peakMonth || "July"}</h3>
                <p>Peak Season</p>
              </div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="400">
              <div className="stat-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="stat-content">
                <h3>{statistics.peakLocation || "Gulmarg"}</h3>
                <p>Most Visited Location</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Platform Features</h2>
            <p className="section-subtitle">
              Powerful tools for smart tourism management
            </p>
          </div>

          <div className="features-grid">
            <div
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="feature-title">AI Predictions</h3>
              <p className="feature-description">
                Accurate footfall predictions using advanced machine learning
                algorithms
              </p>
            </div>

            <div
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="feature-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3 className="feature-title">Analytics Dashboard</h3>
              <p className="feature-description">
                Comprehensive data visualization and trend analysis
              </p>
            </div>

            <div
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="feature-icon">
                <i className="fas fa-cogs"></i>
              </div>
              <h3 className="feature-title">Resource Planning</h3>
              <p className="feature-description">
                Optimize staff, transport, and accommodation allocation
              </p>
            </div>

            <div
              className="feature-card"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="feature-title">Secure Access</h3>
              <p className="feature-description">
                Role-based access control for authorized personnel only
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prediction Section */}
      <section className="prediction-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Predict Tourist Footfall</h2>
            <p className="section-subtitle">
              AI-powered predictions for resource planning
            </p>
          </div>

          <PredictionForm
            locations={locations}
            onPredict={handlePredict}
            loading={loading}
          />

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          {predictionResult && (
            <div className="prediction-result">
              <h3>Prediction Result</h3>
              <div className="result-details">
                <div className="result-item">
                  <span className="label">Location:</span>
                  <span className="value">
                    {predictionResult.prediction.location}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Period:</span>
                  <span className="value">
                    {predictionResult.prediction.month}/
                    {predictionResult.prediction.year}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Expected Visitors:</span>
                  <span className="value highlight">
                    {predictionResult.prediction.predicted_footfall?.toLocaleString()}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Confidence:</span>
                  <span className="value">
                    {(predictionResult.prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="result-insights">
                <h4>Key Insights</h4>
                <ul>
                  {predictionResult.prediction.insights
                    ?.slice(0, 3)
                    .map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                </ul>
              </div>

              {/* Restricted Content Section */}
              <div className={`restricted-content ${isAdmin ? "" : "blurred"}`}>
                <div className="restricted-header">
                  <h4>Advanced Analytics & Resource Planning</h4>
                  {!isAdmin && (
                    <p className="access-message">
                      <i className="fas fa-lock"></i> Sign in as admin to access
                      detailed analytics and resource planning tools
                    </p>
                  )}
                </div>

                {isAdmin ? (
                  <div className="admin-content">
                    <div className="analytics-preview">
                      <h5>Detailed Analytics</h5>
                      <div className="chart-placeholder">
                        <i className="fas fa-chart-line"></i>
                        <p>Interactive visitor trend visualization</p>
                      </div>
                    </div>

                    <div className="resource-planner-preview">
                      <h5>Resource Requirements</h5>
                      <div className="requirements-grid">
                        <div className="requirement-card">
                          <i className="fas fa-user-friends"></i>
                          <h6>Staff</h6>
                          <p>25-30 personnel</p>
                        </div>
                        <div className="requirement-card">
                          <i className="fas fa-bus"></i>
                          <h6>Transport</h6>
                          <p>8-12 vehicles</p>
                        </div>
                        <div className="requirement-card">
                          <i className="fas fa-bed"></i>
                          <h6>Accommodation</h6>
                          <p>150-200 rooms</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="restricted-overlay">
                    <div className="blur-effect"></div>
                    <div className="overlay-content">
                      <i className="fas fa-lock"></i>
                      <h5>Restricted Content</h5>
                      <p>
                        Advanced analytics and resource planning tools are only
                        accessible to authorized administrators.
                      </p>
                      <a href="/auth/login" className="btn btn-primary">
                        <i className="fas fa-sign-in-alt"></i> Admin Login
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Locations */}
      <section className="featured-locations-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Destinations</h2>
            <p className="section-subtitle">Discover the beauty of Kashmir</p>
          </div>

          <div className="locations-grid">
            {featuredLocations.map((location, index) => (
              <div
                key={index}
                className="location-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="location-image">
                  <img
                    src={location.image || "/placeholder-location.jpg"}
                    alt={location.name}
                  />
                </div>
                <div className="location-content">
                  <h3>{location.name}</h3>
                  <p>{location.description}</p>
                  <div className="location-stats">
                    <span>
                      <i className="fas fa-users"></i>
                      Avg. {location.avgFootfall} visitors/month
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="section-cta">
            <a href="/locations" className="btn btn-primary">
              <i className="fas fa-map-marked-alt"></i>
              Explore All Locations
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
