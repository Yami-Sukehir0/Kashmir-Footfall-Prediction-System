import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LocationsPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/public/locations`);
      setLocations(response.data.locations);
    } catch (err) {
      console.error("Failed to load locations:", err);
      setError("Failed to load locations. Please try again later.");
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
    } finally {
      setLoading(false);
    }
  };

  const locationDetails = {
    Gulmarg: {
      description:
        "World-famous ski resort with breathtaking mountain views and adventure activities. Known for the highest golf course in the world.",
      bestTime:
        "December to February (Winter Sports), May to October (Trekking)",
      attractions: [
        "Gondola Ride",
        "Skiing",
        "Golf Course",
        "St. Mary's Church",
      ],
      altitude: "2,730 m (8,957 ft)",
    },
    Pahalgam: {
      description:
        "Picturesque valley town known as the 'Valley of Flowers' with lush green meadows. Starting point for the Amarnath Yatra.",
      bestTime: "April to October",
      attractions: ["Betaab Valley", "Baisaran", "Aru Valley", "Chandanwari"],
      altitude: "2,133 m (7,000 ft)",
    },
    Sonamarg: {
      description:
        "Stunning valley surrounded by snow-capped peaks and pristine lakes. Gateway to the Kashmir valley.",
      bestTime: "April to October",
      attractions: [
        "Thajiwas Glacier",
        "Vishansar Lake",
        "Krishnasar Lake",
        "Sind River",
      ],
      altitude: "2,743 m (9,000 ft)",
    },
    Yousmarg: {
      description:
        "Emerging tourist destination with beautiful landscapes and adventure activities. Known for its scenic beauty.",
      bestTime: "April to October",
      attractions: [
        "Tarsar Lake",
        "Marsar Lake",
        "Dachigam National Park",
        "Trekking Trails",
      ],
      altitude: "2,400 m (7,874 ft)",
    },
    Doodpathri: {
      description:
        "Emerging tourist spot with unique features including natural springs and beautiful landscapes.",
      bestTime: "May to September",
      attractions: [
        "Natural Springs",
        "Scenic Valleys",
        "Trekking Trails",
        "Photography Spots",
      ],
      altitude: "2,300 m (7,546 ft)",
    },
    Kokernag: {
      description:
        "Mountainous area with specific weather patterns and beautiful landscapes.",
      bestTime: "June to September",
      attractions: [
        "Apple Orchards",
        "Scenic Valleys",
        "Trekking Routes",
        "Local Markets",
      ],
      altitude: "1,900 m (6,234 ft)",
    },
    Lolab: {
      description:
        "Remote valley with distinct seasonal variations and untouched natural beauty.",
      bestTime: "April to November",
      attractions: [
        "Lolab Valley",
        "Scenic Landscapes",
        "Local Culture",
        "Photography",
      ],
      altitude: "1,800 m (5,906 ft)",
    },
    Manasbal: {
      description:
        "Beautiful lake destination with water-based activities and surrounding scenic beauty.",
      bestTime: "April to October",
      attractions: ["Manasbal Lake", "Water Sports", "Boating", "Scenic Views"],
      altitude: "1,580 m (5,184 ft)",
    },
    Aharbal: {
      description:
        "Waterfall location with specific conditions and natural beauty.",
      bestTime: "June to August",
      attractions: [
        "Aharbal Waterfall",
        "Trekking Trails",
        "Natural Pools",
        "Scenic Views",
      ],
      altitude: "2,400 m (7,874 ft)",
    },
    Gurez: {
      description:
        "Very remote valley with unique climate and untouched natural beauty.",
      bestTime: "June to September",
      attractions: [
        "Gurez Valley",
        "Hirpora Wildlife Sanctuary",
        "Local Culture",
        "Photography",
      ],
      altitude: "2,400 m (7,874 ft)",
    },
  };

  return (
    <div className="locations-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Explore Kashmir's Beautiful Destinations
            </h1>
            <p className="hero-subtitle">
              Discover the breathtaking landscapes and unique experiences each
              location has to offer
            </p>
          </div>
        </div>
      </section>

      <section className="locations-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Tourist Locations</h2>
            <p className="section-subtitle">
              Plan your perfect Kashmir trip with detailed information about
              each destination
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading locations...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <i className="fas fa-exclamation-circle"></i>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={loadLocations}>
                <i className="fas fa-redo"></i>
                Retry
              </button>
            </div>
          ) : (
            <div className="locations-grid">
              {locations.map((location, index) => {
                const details = locationDetails[location] || {
                  description:
                    "Beautiful destination in Kashmir with unique attractions.",
                  bestTime: "Year-round",
                  attractions: [
                    "Scenic Views",
                    "Local Culture",
                    "Natural Beauty",
                  ],
                  altitude: "Varies",
                };

                return (
                  <div
                    key={index}
                    className="location-card"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="location-header">
                      <h3 className="location-name">{location}</h3>
                      <div className="location-altitude">
                        <i className="fas fa-mountain"></i>
                        {details.altitude}
                      </div>
                    </div>
                    <p className="location-description">
                      {details.description}
                    </p>
                    <div className="location-details">
                      <div className="detail-item">
                        <h4>
                          <i className="fas fa-calendar-alt"></i> Best Time to
                          Visit
                        </h4>
                        <p>{details.bestTime}</p>
                      </div>
                      <div className="detail-item">
                        <h4>
                          <i className="fas fa-star"></i> Key Attractions
                        </h4>
                        <ul>
                          {details.attractions.map((attraction, idx) => (
                            <li key={idx}>{attraction}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="location-actions">
                      <button className="btn btn-secondary">
                        <i className="fas fa-map-marker-alt"></i>
                        View on Map
                      </button>
                      <button className="btn btn-primary">
                        <i className="fas fa-chart-line"></i>
                        Predict Footfall
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Plan Your Perfect Kashmir Trip</h2>
            <p className="cta-subtitle">
              Use our AI-powered footfall predictions to choose the best time to
              visit each location
            </p>
            <div className="cta-buttons">
              <a href="/" className="btn btn-primary">
                <i className="fas fa-search"></i>
                Make a Prediction
              </a>
              <a href="/auth/login" className="btn btn-secondary">
                <i className="fas fa-sign-in-alt"></i>
                Admin Access
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;
