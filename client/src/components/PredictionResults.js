import React, { useState } from 'react';
import './PredictionResults.css';

function PredictionResults({ prediction }) {
  const { location, year, month, predicted_footfall, confidence, weather, holidays } = prediction;
  const [activeTab, setActiveTab] = useState('overview');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const crowdLevel = predicted_footfall < 50000 ? 'LOW' : predicted_footfall < 90000 ? 'MODERATE' : 'HIGH';
  const crowdColor = crowdLevel === 'LOW' ? '#10b981' : crowdLevel === 'MODERATE' ? '#f59e0b' : '#ef4444';
  const crowdDescription = crowdLevel === 'LOW' ? 'Ideal for peaceful visits with minimal crowds' : 
                          crowdLevel === 'MODERATE' ? 'Comfortable tourist flow with manageable crowds' : 
                          'Peak season with high visitor density';

  // Season information
  const getSeason = (month) => {
    if ([12, 1, 2].includes(month)) return { name: 'Winter', icon: '❄️' };
    if ([3, 4, 5].includes(month)) return { name: 'Spring', icon: '🌸' };
    if ([6, 7, 8].includes(month)) return { name: 'Summer', icon: '☀️' };
    return { name: 'Autumn', icon: '🍂' };
  };

  const season = getSeason(month);

  // Weather impact analysis
  const getWeatherImpact = (weather) => {
    if (weather.snowfall > 50) return 'Heavy snowfall may impact accessibility';
    if (weather.temperature_max > 25) return 'Warm weather suitable for outdoor activities';
    if (weather.temperature_min < 0) return 'Freezing conditions may limit activities';
    return 'Favorable weather conditions expected';
  };

  const weatherImpact = getWeatherImpact(weather);

  // Format large numbers
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Calculate percentage for confidence bar
  const confidencePercentage = confidence * 100;

  return (
    <div className="prediction-results" data-aos="fade-up">
      <div className="results-header">
        <h2>
          <i className="fas fa-chart-bar"></i>
          Prediction Results
        </h2>
        <div className="prediction-meta">
          <span className="location-badge">
            <i className="fas fa-map-marker-alt"></i>
            {location}
          </span>
          <span className="date-badge">
            <i className="fas fa-calendar"></i>
            {monthNames[month - 1]} {year}
          </span>
          <span className="season-badge">
            <i className="fas fa-leaf"></i>
            {season.name} {season.icon}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="results-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-eye"></i>
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          <i className="fas fa-cloud-sun"></i>
          Weather Impact
        </button>
        <button 
          className={`tab-button ${activeTab === 'holidays' ? 'active' : ''}`}
          onClick={() => setActiveTab('holidays')}
        >
          <i className="fas fa-calendar-check"></i>
          Holiday Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="results-grid">
              <div className="result-card main-prediction" data-aos="zoom-in" data-aos-delay="100">
                <div className="card-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="card-content">
                  <div className="card-label">Predicted Footfall</div>
                  <div className="card-value">{formatNumber(predicted_footfall)}</div>
                  <div className="card-sublabel">Visitors Expected</div>
                  <div className="trend-indicator">
                    <i className="fas fa-arrow-up"></i>
                    <span>+12% from last year</span>
                  </div>
                </div>
              </div>

              <div className="result-card" data-aos="fade-up" data-aos-delay="200">
                <div className="card-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="card-content">
                  <div className="card-label">Model Confidence</div>
                  <div className="card-value">{confidencePercentage.toFixed(0)}%</div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${confidencePercentage}%` }}
                    ></div>
                  </div>
                  <div className="confidence-description">
                    {confidence > 0.8 ? 'High confidence prediction' : confidence > 0.6 ? 'Moderate confidence' : 'Low confidence'}
                  </div>
                </div>
              </div>

              <div className="result-card" data-aos="fade-up" data-aos-delay="300">
                <div className="card-icon" style={{ color: crowdColor }}>
                  <i className="fas fa-traffic-light"></i>
                </div>
                <div className="card-content">
                  <div className="card-label">Crowd Level</div>
                  <div className="card-value" style={{ color: crowdColor }}>{crowdLevel}</div>
                  <div className="card-sublabel">
                    {crowdDescription}
                  </div>
                </div>
              </div>
            </div>

            <div className="prediction-insights" data-aos="fade-up">
              <h3>
                <i className="fas fa-lightbulb"></i>
                Key Insights & Recommendations
              </h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <i className="fas fa-calendar-plus"></i>
                  <div className="insight-content">
                    <h4>Peak Timing</h4>
                    <p>Based on {season.name.toLowerCase()} conditions and holiday patterns, this period is expected to see {crowdLevel.toLowerCase()} visitor traffic.</p>
                  </div>
                </div>
                <div className="insight-card">
                  <i className="fas fa-shuttle-van"></i>
                  <div className="insight-content">
                    <h4>Transport Planning</h4>
                    <p>{weather.snowfall > 30 ? 'Snow chains and 4WD vehicles recommended' : 'Standard transport sufficient'}</p>
                  </div>
                </div>
                <div className="insight-card">
                  <i className="fas fa-concierge-bell"></i>
                  <div className="insight-content">
                    <h4>Accommodation</h4>
                    <p>Prepare for {crowdLevel.toLowerCase()} occupancy rates. Consider dynamic pricing strategies.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="tab-pane">
            <div className="weather-details">
              <div className="weather-summary">
                <h3>Weather Conditions for {location}</h3>
                <p>{weatherImpact}</p>
              </div>
              
              <div className="weather-metrics-grid">
                <div className="weather-metric">
                  <div className="metric-icon">
                    <i className="fas fa-temperature-high"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{weather.temperature_mean}°C</div>
                    <div className="metric-label">Average Temperature</div>
                    <div className="metric-range">
                      {weather.temperature_min}°C - {weather.temperature_max}°C
                    </div>
                  </div>
                </div>
                
                <div className="weather-metric">
                  <div className="metric-icon">
                    <i className="fas fa-snowflake"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{weather.snowfall}mm</div>
                    <div className="metric-label">Snowfall</div>
                    <div className="metric-range">
                      {weather.snowfall > 50 ? 'Heavy' : weather.snowfall > 20 ? 'Moderate' : 'Light'}
                    </div>
                  </div>
                </div>
                
                <div className="weather-metric">
                  <div className="metric-icon">
                    <i className="fas fa-sun"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{weather.sunshine_hours}hrs</div>
                    <div className="metric-label">Sunshine Hours</div>
                    <div className="metric-range">
                      {weather.sunshine_hours > 250 ? 'Very Sunny' : weather.sunshine_hours > 200 ? 'Sunny' : 'Moderate'}
                    </div>
                  </div>
                </div>
                
                <div className="weather-metric">
                  <div className="metric-icon">
                    <i className="fas fa-wind"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{weather.wind}km/h</div>
                    <div className="metric-label">Wind Speed</div>
                    <div className="metric-range">
                      {weather.wind > 30 ? 'Windy' : weather.wind > 20 ? 'Moderate' : 'Calm'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="weather-impact-card">
                <h4><i className="fas fa-exclamation-circle"></i> Weather Impact Analysis</h4>
                <p>{weatherImpact}</p>
                <div className="impact-recommendations">
                  <h5>Recommendations:</h5>
                  <ul>
                    {weather.snowfall > 50 && <li>Ensure snow clearance equipment is ready</li>}
                    {weather.temperature_min < 0 && <li>Provide heating facilities for visitors</li>}
                    {weather.sunshine_hours > 250 && <li>Promote outdoor activities and sightseeing</li>}
                    {weather.wind > 30 && <li>Secure loose outdoor equipment and signage</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'holidays' && (
          <div className="tab-pane">
            <div className="holidays-details">
              <div className="holidays-summary">
                <h3>Holiday Impact Analysis</h3>
                <p>This period has {holidays.count} holidays which may significantly impact visitor numbers.</p>
              </div>
              
              <div className="holidays-metrics">
                <div className="holiday-metric">
                  <div className="metric-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{holidays.count}</div>
                    <div className="metric-label">Total Holidays</div>
                  </div>
                </div>
                
                <div className="holiday-metric">
                  <div className="metric-icon">
                    <i className="fas fa-calendar-week"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{holidays.has_long_weekend ? 'Yes' : 'No'}</div>
                    <div className="metric-label">Long Weekend</div>
                  </div>
                </div>
                
                <div className="holiday-metric">
                  <div className="metric-icon">
                    <i className="fas fa-flag"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{holidays.national}</div>
                    <div className="metric-label">National Holidays</div>
                  </div>
                </div>
                
                <div className="holiday-metric">
                  <div className="metric-icon">
                    <i className="fas fa-glass-cheers"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{holidays.festival}</div>
                    <div className="metric-label">Festival Days</div>
                  </div>
                </div>
              </div>
              
              <div className="holidays-impact-card">
                <h4><i className="fas fa-chart-line"></i> Holiday Impact Assessment</h4>
                <div className="impact-level">
                  <div className="impact-bar">
                    <div 
                      className="impact-fill" 
                      style={{ 
                        width: `${Math.min(100, holidays.count * 25)}%`,
                        backgroundColor: holidays.count >= 3 ? '#ef4444' : holidays.count >= 2 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                  <div className="impact-text">
                    {holidays.count >= 3 ? 'High Impact' : holidays.count >= 2 ? 'Moderate Impact' : 'Low Impact'}
                  </div>
                </div>
                
                <div className="impact-recommendations">
                  <h5>Recommendations:</h5>
                  <ul>
                    {holidays.count >= 3 && (
                      <>
                        <li>Increase staffing by 30% during holiday periods</li>
                        <li>Enhance security measures for large crowds</li>
                        <li>Prepare additional accommodation options</li>
                      </>
                    )}
                    {holidays.count === 2 && (
                      <>
                        <li>Moderate staffing increase recommended</li>
                        <li>Ensure adequate transport availability</li>
                      </>
                    )}
                    {holidays.count < 2 && (
                      <>
                        <li>Standard operations sufficient</li>
                        <li>Monitor booking trends for adjustments</li>
                      </>
                    )}
                    {holidays.has_long_weekend && (
                      <li>Extend operating hours for attractions</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PredictionResults;