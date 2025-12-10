import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PredictionDetail.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const PredictionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Function to generate sample prediction details for demo purposes
  const generateSamplePrediction = (predictionId) => {
    const locations = [
      "Gulmarg",
      "Pahalgam",
      "Sonamarg",
      "Yousmarg",
      "Doodpathri",
    ];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Generate realistic insights based on location and season
    const locationInsights = {
      Gulmarg: [
        "Gulmarg is experiencing peak ski season with maximum tourist inflow.",
        "Cold temperatures require additional heating facilities for visitors.",
        "High precipitation expected. May impact outdoor activities.",
        "Strong recent momentum detected (32,500 avg visitors). Expect continued growth.",
      ],
      Pahalgam: [
        "Pahalgam is in high season. Good tourist activity expected.",
        "Moderate temperatures suitable for all age groups.",
        "4 holidays this month will likely boost tourism.",
        "Stable recent performance (28,750 avg visitors) indicates predictable trends.",
      ],
      Sonamarg: [
        "Sonamarg is experiencing rising season with increasing visitor numbers.",
        "Pleasant weather conditions expected throughout the month.",
        "Weekend effect will contribute to increased visitor numbers.",
        "Growing popularity with 15% year-over-year growth.",
      ],
    };

    const defaultInsights = [
      "Location showing steady growth in tourist interest.",
      "Seasonal patterns indicate moderate visitor activity.",
      "Weather conditions favorable for tourism activities.",
      "Historical data shows consistent performance for this period.",
    ];

    const locationSuggestions = {
      Gulmarg: [
        "Deploy additional tour guides and support staff for peak visitor capacity.",
        "Increase transportation services (taxis, buses) to handle visitor influx.",
        "Coordinate with hotels for additional capacity. Consider temporary accommodations.",
        "Enhance medical and emergency services coverage for high visitor density.",
        "Ensure snow clearing equipment is ready and road maintenance crews are on standby.",
      ],
      Pahalgam: [
        "Maintain standard staffing levels with on-call support.",
        "Ensure regular transportation schedules are maintained.",
        "Monitor hotel occupancy rates and prepare overflow plans.",
        "Prepare for wet conditions with proper drainage and slip-resistant walkways.",
        "High recent visitor volume suggests need for enhanced crowd management protocols.",
      ],
      Sonamarg: [
        "Standard staffing sufficient. Consider cross-training for flexibility.",
        "Promote eco-friendly tourism initiatives to preserve natural beauty.",
        "Develop guided nature walks and photography tours.",
        "Coordinate with local vendors for authentic cultural experiences.",
        "Low recent visitor volume suggests opportunity for targeted promotional campaigns.",
      ],
    };

    const defaultSuggestions = [
      "Maintain standard staffing levels with on-call support.",
      "Ensure regular transportation schedules are maintained.",
      "Monitor accommodation availability and coordinate with providers.",
      "Review marketing strategies to increase visitor engagement.",
      "Implement feedback collection mechanisms for continuous improvement.",
    ];

    return {
      _id: predictionId,
      location: location,
      year: currentYear,
      month: currentMonth,
      predicted_footfall: Math.floor(15000 + Math.random() * 35000),
      confidence: 0.75 + Math.random() * 0.2,
      user_email: "admin@tourismkashmir.gov.in",
      createdAt: new Date().toISOString(),
      resourceRequirements: {
        staff: Math.floor(20 + Math.random() * 40),
        vehicles: Math.floor(5 + Math.random() * 15),
        rooms: Math.floor(50 + Math.random() * 100),
      },
      comparative_analysis: {
        comparison_type: "previous_month",
        reference_period: `${currentMonth - 1}/${currentYear}`,
        reference_value: Math.floor(12000 + Math.random() * 30000),
        change: Math.round((Math.random() * 30 - 10) * 10) / 10,
        trend: Math.random() > 0.5 ? "increase" : "decrease",
      },
      weather: {
        temperature_mean: Math.floor(5 + Math.random() * 20),
        temperature_max: Math.floor(10 + Math.random() * 25),
        temperature_min: Math.floor(-5 + Math.random() * 15),
        precipitation: Math.floor(Math.random() * 200),
        snowfall: Math.floor(Math.random() * 100),
        sunshine_hours: Math.floor(100 + Math.random() * 200),
        wind_speed: Math.floor(10 + Math.random() * 25),
      },
      holidays: {
        count: Math.floor(Math.random() * 5),
        long_weekends: Math.floor(Math.random() * 3),
        national_holidays: Math.floor(Math.random() * 2),
        festival_holidays: Math.floor(Math.random() * 3),
      },
      insights: locationInsights[location] || defaultInsights,
      resource_suggestions: locationSuggestions[location] || defaultSuggestions,
    };
  };

  useEffect(() => {
    const loadPredictionDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate sample prediction since we don't have a database
        const samplePrediction = generateSamplePrediction(id);
        setPrediction(samplePrediction);
        setInsights(samplePrediction.insights);
        setSuggestions(samplePrediction.resource_suggestions);
      } catch (err) {
        console.error("Failed to load prediction details:", err);
        setError("Failed to load prediction details. Using demo data instead.");

        // Set demo data as fallback
        const demoPrediction = generateSamplePrediction(id);
        setPrediction(demoPrediction);
        setInsights(demoPrediction.insights);
        setSuggestions(demoPrediction.resource_suggestions);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPredictionDetail();
    }
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBack = () => {
    navigate("/admin/predictions");
  };

  const handleAllocateResources = () => {
    alert(
      "Opening resource allocation interface...\n\nThis would allow you to:\n- Assign staff to locations\n- Reserve transportation\n- Book accommodation facilities\n- Schedule emergency services"
    );
  };

  const handleShareWithDepartment = () => {
    alert(
      "Sharing prediction details with Tourism Department...\n\nThis would transmit:\n- Detailed visitor projections\n- Resource requirements\n- Weather advisories\n- Implementation timeline"
    );
  };

  const handleGenerateReport = () => {
    alert(
      "Generating comprehensive prediction report...\n\nThis report includes:\n- Detailed methodology\n- Historical data comparison\n- Confidence factors\n- Resource allocation specifics\n- Risk assessment\n- Implementation recommendations"
    );
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading prediction details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="detail-not-found">
        <i className="fas fa-search"></i>
        <p>Prediction not found</p>
      </div>
    );
  }

  return (
    <div className="prediction-detail">
      <div className="detail-header">
        <h1>
          <i className="fas fa-chart-line"></i> Prediction Details
        </h1>
        <div className="breadcrumb">
          <button className="btn btn-small" onClick={handleBack}>
            ← Back to Predictions
          </button>
        </div>
      </div>

      <div className="detail-card">
        <div className="card-header">
          <h2>
            {prediction.location} - {prediction.month}/{prediction.year}
          </h2>
          <span
            className={`urgency-badge ${
              prediction.confidence > 0.9
                ? "high"
                : prediction.confidence > 0.7
                ? "medium"
                : "low"
            }`}
          >
            {prediction.confidence > 0.9
              ? "High"
              : prediction.confidence > 0.7
              ? "Medium"
              : "Low"}{" "}
            Confidence
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Location:</label>
                <span>{prediction.location}</span>
              </div>
              <div className="info-item">
                <label>Date:</label>
                <span>
                  {prediction.month}/{prediction.year}
                </span>
              </div>
              <div className="info-item">
                <label>Predicted Visitors:</label>
                <span>
                  {prediction.predicted_footfall?.toLocaleString() || 0}
                </span>
              </div>
              <div className="info-item">
                <label>Confidence Level:</label>
                <span>{(prediction.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="info-item">
                <label>Generated By:</label>
                <span>{prediction.user_email || "System"}</span>
              </div>
              <div className="info-item">
                <label>Generated On:</label>
                <span>{formatDate(prediction.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Comparative Analysis</h3>
            <div className="comparison-grid">
              <div className="comparison-item">
                <label>Reference Period:</label>
                <span>
                  {prediction.comparative_analysis?.reference_period || "N/A"}
                </span>
              </div>
              <div className="comparison-item">
                <label>Previous Value:</label>
                <span>
                  {prediction.comparative_analysis?.reference_value?.toLocaleString() ||
                    "N/A"}
                </span>
              </div>
              <div className="comparison-item">
                <label>Change:</label>
                <span
                  className={
                    prediction.comparative_analysis?.change > 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {prediction.comparative_analysis?.change > 0 ? "+" : ""}
                  {prediction.comparative_analysis?.change?.toFixed(1) || "0.0"}
                  %
                </span>
              </div>
              <div className="comparison-item">
                <label>Trend:</label>
                <span>{prediction.comparative_analysis?.trend || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Resource Requirements</h3>
            <div className="resource-grid">
              <div className="resource-item">
                <div className="resource-icon">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className="resource-info">
                  <h4>Staff</h4>
                  <p>{prediction.resourceRequirements?.staff || 0} personnel</p>
                </div>
              </div>
              <div className="resource-item">
                <div className="resource-icon">
                  <i className="fas fa-bus"></i>
                </div>
                <div className="resource-info">
                  <h4>Transport</h4>
                  <p>
                    {prediction.resourceRequirements?.vehicles || 0} vehicles
                  </p>
                </div>
              </div>
              <div className="resource-item">
                <div className="resource-icon">
                  <i className="fas fa-bed"></i>
                </div>
                <div className="resource-info">
                  <h4>Accommodation</h4>
                  <p>{prediction.resourceRequirements?.rooms || 0} rooms</p>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Weather Conditions</h3>
            <div className="weather-grid">
              <div className="weather-item">
                <label>Temperature:</label>
                <span>
                  {prediction.weather?.temperature_mean || "N/A"}°C (Min:{" "}
                  {prediction.weather?.temperature_min || "N/A"}°C, Max:{" "}
                  {prediction.weather?.temperature_max || "N/A"}°C)
                </span>
              </div>
              <div className="weather-item">
                <label>Precipitation:</label>
                <span>{prediction.weather?.precipitation || "N/A"}mm</span>
              </div>
              <div className="weather-item">
                <label>Snowfall:</label>
                <span>{prediction.weather?.snowfall || "N/A"}mm</span>
              </div>
              <div className="weather-item">
                <label>Sunshine:</label>
                <span>{prediction.weather?.sunshine_hours || "N/A"} hours</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Holiday Information</h3>
            <div className="holiday-grid">
              <div className="holiday-item">
                <label>Total Holidays:</label>
                <span>{prediction.holidays?.count || 0}</span>
              </div>
              <div className="holiday-item">
                <label>Long Weekends:</label>
                <span>{prediction.holidays?.long_weekends || 0}</span>
              </div>
              <div className="holiday-item">
                <label>National Holidays:</label>
                <span>{prediction.holidays?.national_holidays || 0}</span>
              </div>
              <div className="holiday-item">
                <label>Festival Holidays:</label>
                <span>{prediction.holidays?.festival_holidays || 0}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Key Insights</h3>
            <ul className="insights-list">
              {insights.map((insight, index) => (
                <li key={index}>
                  <i className="fas fa-lightbulb"></i>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Resource Planning Suggestions</h3>
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <i className="fas fa-check-circle"></i>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Department Notes</h3>
            <div className="notes-area">
              <textarea
                placeholder="Add notes about this prediction..."
                defaultValue={""}
              ></textarea>
              <button className="btn btn-primary">
                <i className="fas fa-save"></i> Save Notes
              </button>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button className="btn btn-primary" onClick={handleAllocateResources}>
            <i className="fas fa-cogs"></i> Allocate Resources
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleShareWithDepartment}
          >
            <i className="fas fa-share-alt"></i> Share with Department
          </button>
          <button className="btn" onClick={handleGenerateReport}>
            <i className="fas fa-file-pdf"></i> Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionDetail;
