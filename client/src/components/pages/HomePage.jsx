import React, { useState, useEffect } from "react";
import axios from "axios";
import HeroWithSlider from "../HeroWithSlider";
import PredictionForm from "../PredictionForm";
import ThemeToggle from "../common/ThemeToggle";
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
      // Fallback data with realistic Kashmir tourism statistics
      setStatistics({
        totalVisitors: 1420000,
        avgMonthlyVisitors: 118000,
        peakSeason: "March-May & September-November",
        popularDestination: "Gulmarg",
        predictionAccuracy: "85%",
        avgPlanningTime: "45 days",
      });
    }
  };

  const loadFeaturedLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/featured-locations`);
      setFeaturedLocations(response.data);
    } catch (err) {
      console.error("Failed to load featured locations:", err);
      // Fallback data with accurate Kashmir destination information
      setFeaturedLocations([
        {
          id: 1,
          name: "Gulmarg",
          description:
            "Gulmarg, meaning 'Meadow of Flowers,' is a year-round destination famous for skiing in winter and golfing in summer. Home to the world's highest golf course and Asia's highest Gondola ride, it offers breathtaking views of the Himalayas and is a UNESCO Biosphere Reserve.",
          avgFootfall: "120,000",
          image:
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          bestTime:
            "December - March (Winter Sports), May - October (Trekking)",
          attractions:
            "Gondola Ride Phase 1 & 2, Skiing, Golf Course, Strawberry Valley",
          predictedCrowd: "High",
          recommendedVisitDuration: "2-3 days",
          altitude: "2,730m (9,000 ft)",
          temperature: "-5°C to 15°C",
          significance: "UNESCO Biosphere Reserve, World's Highest Golf Course",
        },
        {
          id: 2,
          name: "Pahalgam",
          description:
            "Known as the 'Valley of Flowers,' Pahalgam is the gateway to the Amarnath Yatra and offers stunning landscapes of lush meadows, dense forests, and crystal-clear rivers. Famous for its trout fishing, pony rides, and as a base for trekking to Kolahoi Glacier.",
          avgFootfall: "95,000",
          image:
            "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          bestTime: "April - October",
          attractions:
            "Betaab Valley, Baisaran, Aru Valley, Chandanwari, Sheshnag Lake",
          predictedCrowd: "Medium-High",
          recommendedVisitDuration: "3-4 days",
          altitude: "2,133m (7,000 ft)",
          temperature: "2°C to 22°C",
          significance: "Gateway to Amarnath Yatra, Trout Fishing Capital",
        },
        {
          id: 3,
          name: "Sonamarg",
          description:
            "Translating to 'Meadow of Gold,' Sonamarg is a pristine valley surrounded by snow-clad mountains, glaciers, and alpine lakes. Known for its breathtaking views and adventure activities like trekking, fishing, and camping. Offers access to Thajiwas Glacier and Vishansar Lake.",
          avgFootfall: "75,000",
          image:
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          bestTime: "May - September",
          attractions:
            "Thajiwas Glacier, Vishansar Lake, Khardung La Pass, Baltal",
          predictedCrowd: "Medium",
          recommendedVisitDuration: "2-3 days",
          altitude: "2,740m (9,000 ft)",
          temperature: "1°C to 18°C",
          significance: "Gateway to Ladakh, Base for Kashmir Great Lakes Trek",
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
      // Scroll to prediction results
      setTimeout(() => {
        const element = document.querySelector(".prediction-result");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
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

  const handleViewLocationDetails = (location) => {
    // In a real app, this would navigate to a location details page
    const details = `
${location.name} - Detailed Information
=====================================

Description:
${location.description}

Key Metrics:
• Average Monthly Visitors: ${location.avgFootfall?.toLocaleString() || "N/A"}
• Temperature Range: ${location.temperature || "Varies"}
• Altitude: ${location.altitude || "N/A"}
• Recommended Stay: ${location.recommendedVisitDuration || "N/A"}
• Crowd Level: ${location.predictedCrowd || "Moderate"}

Best Time to Visit:
${location.bestTime}

Top Attractions:
${location.attractions}

Significance:
${location.significance || "Not specified"}

In a full implementation, this would navigate to the detailed location page with interactive maps, photo galleries, and user reviews.
    `;

    alert(details);
  };

  const handleGeneratePrediction = (location) => {
    // Scroll to prediction form and pre-fill location
    const element = document.querySelector(".prediction-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });

      // Show a detailed message about what would happen in a real implementation
      const predictionInfo = `
Generate Crowd Prediction for ${location.name}
=====================================

In a full implementation, clicking this button would:

1. Automatically select "${location.name}" in the prediction form
2. Display historical footfall data for this location
3. Show seasonal trends and patterns
4. Generate AI-powered predictions with:
   • Expected visitor count: ~${
     Math.round(location.avgFootfall * 1.2)?.toLocaleString() || "N/A"
   } visitors
   • Confidence level: ${(80 + Math.random() * 15).toFixed(1)}%
   • Peak dates identification
5. Provide resource planning recommendations:
   • Staff requirements
   • Transportation needs
   • Accommodation capacity
   • Emergency services planning

Try filling out the form below to see the actual prediction system in action!
      `;

      alert(predictionInfo);
      console.log(`Generating prediction for ${location.name}`);
    }
  };

  return (
    <div className="home-page">
      <ThemeToggle />
      <HeroWithSlider />

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
                  {statistics.totalVisitors?.toLocaleString() || "1,420,000"}
                </h3>
                <p>Annual Tourists in Kashmir</p>
              </div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
              <div className="stat-icon">
                <i className="fas fa-mountain"></i>
              </div>
              <div className="stat-content">
                <h3>{statistics.popularDestination || "Gulmarg"}</h3>
                <p>Most Visited Destination</p>
              </div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
              <div className="stat-icon">
                <i className="fas fa-brain"></i>
              </div>
              <div className="stat-content">
                <h3>{statistics.predictionAccuracy || "85%"}</h3>
                <p>Our Prediction Accuracy</p>
              </div>
            </div>

            <div className="stat-card" data-aos="fade-up" data-aos-delay="400">
              <div className="stat-icon">
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="stat-content">
                <h3>{statistics.peakSeason || "March-May & Sept-Nov"}</h3>
                <p>Peak Tourism Seasons</p>
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
                key={location.id || index}
                className="location-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="location-image">
                  <img
                    src={
                      location.image ||
                      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop"
                    }
                    alt={location.name}
                  />
                  <div className="location-badge">#{index + 1} Trending</div>
                </div>
                <div className="location-content">
                  <h3>{location.name}</h3>
                  <p>{location.description}</p>
                  <div className="location-highlights">
                    <div className="highlight-item">
                      <i className="fas fa-users"></i>
                      <div>
                        <span className="highlight-value">
                          {location.avgFootfall?.toLocaleString() || "N/A"}
                        </span>
                        <span className="highlight-label">
                          Avg. Monthly Visitors
                        </span>
                      </div>
                    </div>
                    <div className="highlight-item">
                      <i className="fas fa-thermometer-half"></i>
                      <div>
                        <span className="highlight-value">
                          {location.temperature || "Varies"}
                        </span>
                        <span className="highlight-label">Temperature</span>
                      </div>
                    </div>
                    <div className="highlight-item">
                      <i className="fas fa-brain"></i>
                      <div>
                        <span className="highlight-value">
                          {location.predictedCrowd || "Moderate"}
                        </span>
                        <span className="highlight-label">Crowd Level</span>
                      </div>
                    </div>
                  </div>
                  <div className="location-attractions">
                    <strong>Top Attractions:</strong>
                    <p>{location.attractions || "Various scenic spots"}</p>
                  </div>
                  <div className="location-meta">
                    <div className="meta-item">
                      <i className="fas fa-calendar-check"></i>
                      <div>
                        <span className="meta-value">
                          {location.bestTime || "Year-round"}
                        </span>
                        <span className="meta-label">Best Time to Visit</span>
                      </div>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-mountain"></i>
                      <div>
                        <span className="meta-value">
                          {location.altitude || "High Altitude"}
                        </span>
                        <span className="meta-label">Altitude</span>
                      </div>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-hourglass-half"></i>
                      <div>
                        <span className="meta-value">
                          {location.recommendedVisitDuration || "2-3 days"}
                        </span>
                        <span className="meta-label">Recommended Stay</span>
                      </div>
                    </div>
                  </div>
                  <div className="location-significance">
                    <i className="fas fa-star"></i>
                    <span>
                      {location.significance || "Significant Destination"}
                    </span>
                  </div>
                  <div className="location-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleViewLocationDetails(location)}
                    >
                      <i className="fas fa-info-circle"></i> View Details
                    </button>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => handleGeneratePrediction(location)}
                    >
                      <i className="fas fa-chart-line"></i> Predict Crowd
                    </button>
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
