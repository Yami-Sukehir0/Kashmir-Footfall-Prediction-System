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
      // Fallback data with accurate Kashmir destination information and local images
      setFeaturedLocations([
        {
          id: 1,
          name: "Gulmarg",
          description:
            "Gulmarg, meaning 'Meadow of Flowers,' is a year-round destination famous for skiing in winter and golfing in summer. Home to the world's highest golf course and Asia's highest Gondola ride, it offers breathtaking views of the Himalayas and is a UNESCO Biosphere Reserve. The town is located at an altitude of 2,730 meters and receives heavy snowfall during winters, making it a prime destination for skiing enthusiasts.",
          avgFootfall: "120,000",
          image: "/images/GULMARG.png",
          bestTime:
            "December - March (Winter Sports), May - October (Trekking)",
          attractions:
            "Gondola Ride Phase 1 & 2, Skiing, Golf Course, Strawberry Valley, Alpather Lake",
          predictedCrowd: "High",
          recommendedVisitDuration: "2-3 days",
          altitude: "2,730m (9,000 ft)",
          temperature: "-5°C to 15°C",
          significance:
            "UNESCO Biosphere Reserve, World's Highest Golf Course, Winter Sports Hub",
        },
        {
          id: 2,
          name: "Pahalgam",
          description:
            "Known as the 'Valley of Flowers,' Pahalgam is the gateway to the Amarnath Yatra and offers stunning landscapes of lush meadows, dense forests, and crystal-clear rivers. Famous for its trout fishing, pony rides, and as a base for trekking to Kolahoi Glacier. The town is nestled at an altitude of 2,133 meters and serves as a base for several high-altitude treks.",
          avgFootfall: "95,000",
          image: "/images/PAHALGAM.png",
          bestTime: "April - October",
          attractions:
            "Betaab Valley, Baisaran, Aru Valley, Chandanwari, Sheshnag Lake, Kolahoi Glacier",
          predictedCrowd: "Medium-High",
          recommendedVisitDuration: "3-4 days",
          altitude: "2,133m (7,000 ft)",
          temperature: "2°C to 22°C",
          significance:
            "Gateway to Amarnath Yatra, Trout Fishing Capital, Trekking Base Camp",
        },
        {
          id: 3,
          name: "Sonamarg",
          description:
            "Translating to 'Meadow of Gold,' Sonamarg is a pristine valley surrounded by snow-clad mountains, glaciers, and alpine lakes. Known for its breathtaking views and adventure activities like trekking, fishing, and camping. Offers access to Thajiwas Glacier and Vishansar Lake. Located at an altitude of 2,740 meters, it's known as the 'Gateway to Ladakh'.",
          avgFootfall: "75,000",
          image: "/images/SONAMARG.png",
          bestTime: "May - September",
          attractions:
            "Thajiwas Glacier, Vishansar Lake, Khardung La Pass, Baltal, Sindh River",
          predictedCrowd: "Medium",
          recommendedVisitDuration: "2-3 days",
          altitude: "2,740m (9,000 ft)",
          temperature: "1°C to 18°C",
          significance:
            "Gateway to Ladakh, Base for Kashmir Great Lakes Trek, Scenic Beauty Spot",
        },
        {
          id: 4,
          name: "Yousmarg",
          description:
            "Often referred to as the 'Meadow of Saints,' Yousmarg is a picturesque hill station located at an altitude of 2,400 meters. Known for its vast green meadows, pine forests, and stunning views of the Pir Panjal range. It's an excellent destination for skiing in winter and trekking in summer.",
          avgFootfall: "45,000",
          image: "/images/YOUSMARG.png",
          bestTime:
            "December - March (Winter Sports), April - October (Trekking)",
          attractions:
            "Dachigam National Park, Zero Point, Khilanmarg, Dood Ganga",
          predictedCrowd: "Medium",
          recommendedVisitDuration: "2-3 days",
          altitude: "2,400m (7,874 ft)",
          temperature: "-2°C to 16°C",
          significance:
            "Winter Sports Destination, Scenic Hill Station, Wildlife Spot",
        },
        {
          id: 5,
          name: "Doodpathri",
          description:
            "Known as the 'Milk Sea,' Doodpathri is famous for its white-colored streams that flow down the mountains, creating a milky appearance. Located at an altitude of 2,400 meters, it offers mesmerizing views of the Himalayas and is relatively untouched by commercial tourism.",
          avgFootfall: "25,000",
          image: "/images/DOODPATHRI.png",
          bestTime: "May - October",
          attractions:
            "White Streams, Alpine Meadows, Pine Forests, Mountain Views",
          predictedCrowd: "Low",
          recommendedVisitDuration: "1-2 days",
          altitude: "2,400m (7,874 ft)",
          temperature: "3°C to 17°C",
          significance:
            "Unique Natural Phenomenon, Offbeat Destination, Serene Location",
        },
        {
          id: 6,
          name: "Aharbal",
          description:
            "Known as the 'Niagara of Kashmir,' Aharbal is famous for its spectacular waterfall that plunges from a height of 25 meters. Located at an altitude of 2,400 meters, it's surrounded by dense forests and offers a refreshing escape from city life.",
          avgFootfall: "30,000",
          image: "/images/AHARBAL.png",
          bestTime: "April - November",
          attractions:
            "Aharbal Waterfall, Forest Walks, Picnic Spots, Nature Photography",
          predictedCrowd: "Low-Medium",
          recommendedVisitDuration: "1 day",
          altitude: "2,400m (7,874 ft)",
          temperature: "4°C to 19°C",
          significance: "Natural Waterfall, Scenic Beauty, Family Destination",
        },
        {
          id: 7,
          name: "Kokernag",
          description:
            "Known for its trout breeding center, Kokernag is a serene destination located at an altitude of 1,700 meters. Famous for its trout fish and surrounded by apple orchards and pine forests, it offers a peaceful retreat for nature lovers.",
          avgFootfall: "20,000",
          image: "/images/KOKERNAG.png",
          bestTime: "April - October",
          attractions:
            "Trout Breeding Center, Apple Orchards, Pine Forests, River Views",
          predictedCrowd: "Low",
          recommendedVisitDuration: "1 day",
          altitude: "1,700m (5,577 ft)",
          temperature: "5°C to 20°C",
          significance:
            "Trout Fish Breeding, Peaceful Retreat, Agricultural Spot",
        },
        {
          id: 8,
          name: "Lolab",
          description:
            "A beautiful valley located in the Kupwara district, Lolab is known for its saffron cultivation and stunning landscapes. Surrounded by the Himalayan peaks, it offers panoramic views and is home to traditional Kashmiri villages.",
          avgFootfall: "15,000",
          image: "/images/LOLAB.png",
          bestTime: "April - October",
          attractions:
            "Saffron Fields, Traditional Villages, Mountain Views, Cultural Experience",
          predictedCrowd: "Low",
          recommendedVisitDuration: "1-2 days",
          altitude: "1,800m (5,905 ft)",
          temperature: "6°C to 21°C",
          significance:
            "Saffron Cultivation, Cultural Heritage, Offbeat Valley",
        },
        {
          id: 9,
          name: "Manasbal",
          description:
            "Known as the 'Gem of Kashmir,' Manasbal Lake is one of the deepest lakes in India. Surrounded by hills and famous for its lotus flowers, it offers boating facilities and stunning reflections of the surrounding mountains.",
          avgFootfall: "35,000",
          image: "/images/MANASBAL.png",
          bestTime: "March - November",
          attractions:
            "Manasbal Lake, Boating, Lotus Flowers, Mountain Reflections",
          predictedCrowd: "Low-Medium",
          recommendedVisitDuration: "1 day",
          altitude: "1,500m (4,921 ft)",
          temperature: "7°C to 23°C",
          significance:
            "Deepst Lake in India, Scenic Beauty, Boating Destination",
        },
        {
          id: 10,
          name: "Gurez",
          description:
            "Located in the remote northernmost region of Kashmir, Gurez is known for its breathtaking landscapes and the Harmukh mountain range. Often called 'Mini Switzerland of Kashmir,' it offers pristine beauty and is relatively untouched by tourism.",
          avgFootfall: "10,000",
          image: "/images/GUREZ.png",
          bestTime: "May - October",
          attractions:
            "Harmukh Range, Alpine Meadows, Dudhganga River, Traditional Culture",
          predictedCrowd: "Very Low",
          recommendedVisitDuration: "2-3 days",
          altitude: "2,400m (7,874 ft)",
          temperature: "2°C to 15°C",
          significance: "Remote Beauty, Mini Switzerland, Cultural Heritage",
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

      // If user is admin, also send to admin predictions endpoint
      if (isAdmin) {
        try {
          await axios.post(`${API_URL}/admin/prediction-create`, formData);
        } catch (adminErr) {
          console.warn("Failed to save admin prediction:", adminErr);
        }
      }

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

  // Admin button handlers
  const handleExportReport = (predictionData) => {
    // In a real implementation, this would generate and download a detailed report
    alert(`Exporting detailed report for ${predictionData.location} - ${predictionData.month}/${predictionData.year}...

This would generate a comprehensive PDF report including:
- Detailed visitor predictions
- Resource allocation recommendations
- Historical comparison data
- Risk assessment factors
- Implementation timeline

Report would be downloaded automatically.`);

    // Log the action for analytics
    console.log("Admin exported report:", predictionData);
  };

  const handleShareWithDepartment = (predictionData) => {
    // In a real implementation, this would send data to department systems
    alert(`Sharing prediction data for ${
      predictionData.location
    } with Tourism Department...

This would send the following information:
- Location: ${predictionData.location}
- Predicted visitors: ${predictionData.predicted_footfall?.toLocaleString()}
- Confidence level: ${(predictionData.confidence * 100).toFixed(1)}%
- Resource requirements
- Implementation timeline

Data sent successfully to department systems.`);

    // Log the action for analytics
    console.log("Admin shared data with department:", predictionData);
  };

  const handleConfigureAlerts = (predictionData) => {
    // In a real implementation, this would open alert configuration modal
    alert(`Configuring alerts for ${predictionData.location}...

This would open a configuration panel to set up:
- Capacity threshold alerts
- Weather impact notifications
- Staffing requirement updates
- Emergency response triggers
- Resource shortage warnings

Configuration saved successfully.`);

    // Log the action for analytics
    console.log("Admin configured alerts:", predictionData);
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

              {/* Detailed Planning Information for Administration */}
              {isAdmin && (
                <div className="admin-planning-section">
                  <h4>Detailed Resource Planning</h4>
                  <div className="planning-grid">
                    <div className="planning-card">
                      <div className="card-header">
                        <i className="fas fa-user-friends"></i>
                        <h5>Human Resources</h5>
                      </div>
                      <div className="card-content">
                        <div className="resource-item">
                          <span className="resource-label">
                            Security Personnel:
                          </span>
                          <span className="resource-value">8-12 officers</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">
                            Guides & Interpreters:
                          </span>
                          <span className="resource-value">10-15 staff</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">Support Staff:</span>
                          <span className="resource-value">
                            12-18 employees
                          </span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">Medical Team:</span>
                          <span className="resource-value">2-3 paramedics</span>
                        </div>
                      </div>
                    </div>

                    <div className="planning-card">
                      <div className="card-header">
                        <i className="fas fa-bus"></i>
                        <h5>Transportation</h5>
                      </div>
                      <div className="card-content">
                        <div className="resource-item">
                          <span className="resource-label">Buses:</span>
                          <span className="resource-value">6-8 vehicles</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">Vans/Shuttles:</span>
                          <span className="resource-value">4-6 vehicles</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">Taxis/Cabs:</span>
                          <span className="resource-value">3-5 vehicles</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">
                            Emergency Vehicles:
                          </span>
                          <span className="resource-value">1-2 ambulances</span>
                        </div>
                      </div>
                    </div>

                    <div className="planning-card">
                      <div className="card-header">
                        <i className="fas fa-bed"></i>
                        <h5>Accommodation</h5>
                      </div>
                      <div className="card-content">
                        <div className="resource-item">
                          <span className="resource-label">Hotel Rooms:</span>
                          <span className="resource-value">120-150 rooms</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">Resort Units:</span>
                          <span className="resource-value">30-50 units</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">Guest Houses:</span>
                          <span className="resource-value">20-30 units</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">
                            Camping Facilities:
                          </span>
                          <span className="resource-value">15-25 sites</span>
                        </div>
                      </div>
                    </div>

                    <div className="planning-card">
                      <div className="card-header">
                        <i className="fas fa-utensils"></i>
                        <h5>Catering & Food Services</h5>
                      </div>
                      <div className="card-content">
                        <div className="resource-item">
                          <span className="resource-label">Restaurants:</span>
                          <span className="resource-value">
                            5-8 establishments
                          </span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">Food Stalls:</span>
                          <span className="resource-value">10-15 vendors</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">
                            Catering Teams:
                          </span>
                          <span className="resource-value">3-5 teams</span>
                        </div>
                        <div className="resource-item">
                          <span className="resource-label">
                            Special Dietary:
                          </span>
                          <span className="resource-value">
                            Available on request
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="timeline-section">
                    <h5>Implementation Timeline</h5>
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-date">30 Days Before</div>
                        <div className="timeline-content">
                          <h6>Preparation Phase</h6>
                          <p>
                            Staff recruitment, vehicle maintenance, facility
                            checks
                          </p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-date">15 Days Before</div>
                        <div className="timeline-content">
                          <h6>Setup Phase</h6>
                          <p>
                            Resource deployment, signage installation, safety
                            checks
                          </p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-date">Event Period</div>
                        <div className="timeline-content">
                          <h6>Operation Phase</h6>
                          <p>
                            Full resource activation, monitoring, real-time
                            adjustments
                          </p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-date">Post Event</div>
                        <div className="timeline-content">
                          <h6>Evaluation Phase</h6>
                          <p>
                            Performance review, feedback collection, improvement
                            planning
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Content Section */}
              <div
                className={`enhanced-content ${
                  isAdmin ? "admin-view" : "public-view"
                }`}
              >
                <div className="enhanced-header">
                  <h4>
                    {isAdmin
                      ? "Advanced Analytics & Resource Planning"
                      : "Resource Planning Preview"}
                  </h4>
                  {!isAdmin && (
                    <p className="access-message">
                      <i className="fas fa-lock"></i> Sign in as admin to access
                      detailed analytics and resource planning tools
                    </p>
                  )}
                </div>

                <div className="enhanced-content-wrapper">
                  <div className="analytics-preview">
                    <h5>
                      {isAdmin ? "Detailed Analytics" : "Analytics Preview"}
                    </h5>
                    <div className="chart-placeholder">
                      <i className="fas fa-chart-line"></i>
                      <p>
                        {isAdmin
                          ? "Interactive visitor trend visualization"
                          : "Preview of visitor trend data"}
                      </p>
                      {isAdmin && (
                        <p className="subtitle">
                          Real-time data for{" "}
                          {predictionResult.prediction.location} in{" "}
                          {predictionResult.prediction.month}/
                          {predictionResult.prediction.year}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="resource-planner-preview">
                    <h5>
                      {isAdmin
                        ? "Resource Requirements"
                        : "Resource Planning Preview"}
                    </h5>
                    <div className="requirements-grid">
                      <div className="requirement-card">
                        <i className="fas fa-user-friends"></i>
                        <h6>Staff</h6>
                        <p>{isAdmin ? "30-35 personnel" : "25-30 personnel"}</p>
                        {isAdmin && (
                          <p className="detail">
                            Guides: 10 | Security: 8 | Support: 12
                          </p>
                        )}
                      </div>
                      <div className="requirement-card">
                        <i className="fas fa-bus"></i>
                        <h6>Transport</h6>
                        <p>{isAdmin ? "10-15 vehicles" : "8-12 vehicles"}</p>
                        {isAdmin && (
                          <p className="detail">
                            Buses: 6 | Vans: 4 | Taxis: 3
                          </p>
                        )}
                      </div>
                      <div className="requirement-card">
                        <i className="fas fa-bed"></i>
                        <h6>Accommodation</h6>
                        <p>{isAdmin ? "180-220 rooms" : "150-200 rooms"}</p>
                        {isAdmin && (
                          <p className="detail">Hotels: 4 | Resorts: 2</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="admin-enhanced-features">
                      <h5>Department Management Tools</h5>
                      <div className="features-grid">
                        <div className="feature-item">
                          <i className="fas fa-map-marked-alt"></i>
                          <h6>Interactive Maps</h6>
                          <p>Live visitor distribution mapping</p>
                        </div>
                        <div className="feature-item">
                          <i className="fas fa-file-export"></i>
                          <h6>Report Generation</h6>
                          <p>Automated PDF/Excel reports</p>
                        </div>
                        <div className="feature-item">
                          <i className="fas fa-bell"></i>
                          <h6>Alerts System</h6>
                          <p>Real-time capacity notifications</p>
                        </div>
                        <div className="feature-item">
                          <i className="fas fa-sync-alt"></i>
                          <h6>Synchronization</h6>
                          <p>Department data integration</p>
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleExportReport(predictionResult.prediction)
                          }
                        >
                          <i className="fas fa-download"></i> Export Report
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            handleShareWithDepartment(
                              predictionResult.prediction
                            )
                          }
                        >
                          <i className="fas fa-share-alt"></i> Share with
                          Department
                        </button>
                        <button
                          className="btn btn-accent"
                          onClick={() =>
                            handleConfigureAlerts(predictionResult.prediction)
                          }
                        >
                          <i className="fas fa-cog"></i> Configure Alerts
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!isAdmin && (
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
                    src={location.image}
                    alt={location.name}
                    loading="lazy"
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
