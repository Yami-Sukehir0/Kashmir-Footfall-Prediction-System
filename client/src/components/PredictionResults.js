import React, { useState } from 'react';
import './PredictionResults.css';

function PredictionResults({ prediction }) {
  const { 
    location, 
    year, 
    month, 
    predicted_footfall, 
    confidence, 
    weather, 
    holidays,
    comparative_analysis,
    insights,
    resource_suggestions
  } = prediction;
  
  const [activeTab, setActiveTab] = useState('overview');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const crowdLevel = predicted_footfall < 20000 ? 'LOW' : predicted_footfall < 40000 ? 'MODERATE' : 'HIGH';
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
        <button 
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <i className="fas fa-lightbulb"></i>
          Insights & Planning
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
                    <i className={`fas fa-arrow-${comparative_analysis.trend === 'increase' ? 'up' : 'down'}`}></i>
                    <span>{Math.abs(comparative_analysis.year_over_year_change)}% {comparative_analysis.trend} from {comparative_analysis.previous_year}</span>
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
                    {confidence > 0.9 ? 'Very High confidence' : confidence > 0.8 ? 'High confidence prediction' : confidence > 0.7 ? 'Moderate confidence' : 'Low confidence'}
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
                Key Insights
              </h3>
              <div className="insights-list">
                {insights && insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <i className="fas fa-info-circle"></i>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="tab-pane">
            <div className="weather-details">
              <div className="weather-summary">
                <h3>Weather Conditions for {location}</h3>
                <p>Detailed weather analysis for optimal tourism planning</p>
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
                    <i className="fas fa-tint"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{weather.precipitation}mm</div>
                    <div className="metric-label">Precipitation</div>
                    <div className="metric-range">
                      {weather.precipitation > 100 ? 'Heavy Rain' : weather.precipitation > 50 ? 'Moderate Rain' : 'Light Rain'}
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
              </div>
              
              <div className="weather-impact-card">
                <h4><i className="fas fa-exclamation-circle"></i> Weather Impact Analysis</h4>
                <div className="impact-recommendations">
                  <h5>Weather-Based Recommendations:</h5>
                  <ul>
                    {weather.snowfall > 50 && <li>Ensure snow clearance equipment is ready and road maintenance crews are on standby</li>}
                    {weather.temperature_min < 0 && <li>Provide heating facilities for visitors and ensure accommodation preparedness</li>}
                    {weather.sunshine_hours > 250 && <li>Promote outdoor activities and sightseeing with extended hours</li>}
                    {weather.precipitation > 100 && <li>Prepare for wet conditions with proper drainage and slip-resistant walkways</li>}
                    {weather.wind > 30 && <li>Secure loose outdoor equipment and signage</li>}
                    <li>Monitor weather forecasts daily and communicate updates to visitors</li>
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
                    <div className="metric-value">{holidays.long_weekends}</div>
                    <div className="metric-label">Long Weekends</div>
                  </div>
                </div>
                
                <div className="holiday-metric">
                  <div className="metric-icon">
                    <i className="fas fa-flag"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{holidays.national_holidays}</div>
                    <div className="metric-label">National Holidays</div>
                  </div>
                </div>
                
                <div className="holiday-metric">
                  <div className="metric-icon">
                    <i className="fas fa-glass-cheers"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{holidays.festival_holidays}</div>
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
                        backgroundColor: holidays.count >= 4 ? '#ef4444' : holidays.count >= 3 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                  </div>
                  <div className="impact-text">
                    {holidays.count >= 4 ? 'Very High Impact' : holidays.count >= 3 ? 'High Impact' : holidays.count >= 2 ? 'Moderate Impact' : 'Low Impact'}
                  </div>
                </div>
                
                <div className="impact-recommendations">
                  <h5>Holiday-Based Recommendations:</h5>
                  <ul>
                    {holidays.count >= 4 && (
                      <>
                        <li>Increase staffing by 40% during holiday periods to manage large crowds</li>
                        <li>Enhance security measures and crowd management protocols</li>
                        <li>Prepare additional accommodation options and transportation services</li>
                        <li>Extend operating hours for major attractions and facilities</li>
                      </>
                    )}
                    {holidays.count >= 3 && holidays.count < 4 && (
                      <>
                        <li>Increase staffing by 30% during peak holiday periods</li>
                        <li>Ensure adequate transport availability and parking facilities</li>
                        <li>Monitor booking trends and adjust capacity accordingly</li>
                      </>
                    )}
                    {holidays.count === 2 && (
                      <>
                        <li>Moderate staffing increase recommended for weekends</li>
                        <li>Ensure regular transportation schedules are maintained</li>
                        <li>Prepare contingency plans for unexpected surges</li>
                      </>
                    )}
                    {holidays.count < 2 && (
                      <>
                        <li>Standard operations sufficient with regular monitoring</li>
                        <li>Monitor booking trends for adjustments</li>
                        <li>Maintain flexibility for last-minute changes</li>
                      </>
                    )}
                    {holidays.long_weekends > 0 && (
                      <li>Extend operating hours for attractions during long weekends</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="tab-pane">
            <div className="insights-details">
              <div className="insights-summary">
                <h3>Resource Planning & Strategic Insights</h3>
                <p>Actionable recommendations for optimal tourism management</p>
              </div>
              
              <div className="resource-planning-section">
                <h4><i className="fas fa-user-friends"></i> Staffing Recommendations</h4>
                <div className="recommendations-list">
                  {resource_suggestions && resource_suggestions.filter(s => s.includes('staff') || s.includes('guides')).map((suggestion, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-user-check"></i>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                  {(!resource_suggestions || !resource_suggestions.some(s => s.includes('staff') || s.includes('guides'))) && (
                    <div className="recommendation-item">
                      <i className="fas fa-user-check"></i>
                      <span>Maintain standard staffing levels with on-call support for flexibility</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="resource-planning-section">
                <h4><i className="fas fa-shuttle-van"></i> Transportation & Logistics</h4>
                <div className="recommendations-list">
                  {resource_suggestions && resource_suggestions.filter(s => s.includes('transportation') || s.includes('buses') || s.includes('taxis')).map((suggestion, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-shuttle-van"></i>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                  {(!resource_suggestions || !resource_suggestions.some(s => s.includes('transportation') || s.includes('buses') || s.includes('taxis'))) && (
                    <div className="recommendation-item">
                      <i className="fas fa-shuttle-van"></i>
                      <span>Ensure regular transportation schedules are maintained with backup vehicles available</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="resource-planning-section">
                <h4><i className="fas fa-hotel"></i> Accommodation & Facilities</h4>
                <div className="recommendations-list">
                  {resource_suggestions && resource_suggestions.filter(s => s.includes('accommodation') || s.includes('hotels')).map((suggestion, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-hotel"></i>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                  {(!resource_suggestions || !resource_suggestions.some(s => s.includes('accommodation') || s.includes('hotels'))) && (
                    <div className="recommendation-item">
                      <i className="fas fa-hotel"></i>
                      <span>Monitor hotel occupancy rates and prepare overflow plans with local homestays</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="resource-planning-section">
                <h4><i className="fas fa-first-aid"></i> Emergency Services</h4>
                <div className="recommendations-list">
                  {resource_suggestions && resource_suggestions.filter(s => s.includes('emergency') || s.includes('medical')).map((suggestion, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-first-aid"></i>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                  {(!resource_suggestions || !resource_suggestions.some(s => s.includes('emergency') || s.includes('medical'))) && (
                    <div className="recommendation-item">
                      <i className="fas fa-first-aid"></i>
                      <span>Maintain standard emergency services coverage with additional first aid stations during peak periods</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="resource-planning-section">
                <h4><i className="fas fa-snowplow"></i> Special Considerations</h4>
                <div className="recommendations-list">
                  {resource_suggestions && resource_suggestions.filter(s => s.includes('snow') || s.includes('weather')).map((suggestion, index) => (
                    <div key={index} className="recommendation-item">
                      <i className="fas fa-snowplow"></i>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                  {(!resource_suggestions || !resource_suggestions.some(s => s.includes('snow') || s.includes('weather'))) && (
                    <div className="recommendation-item">
                      <i className="fas fa-snowplow"></i>
                      <span>Monitor weather conditions daily and communicate updates to visitors and staff</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="strategic-insights">
                <h4><i className="fas fa-chart-bar"></i> Strategic Planning Insights</h4>
                <div className="insights-grid">
                  <div className="insight-card">
                    <i className="fas fa-chart-line"></i>
                    <div className="insight-content">
                      <h5>Growth Trend</h5>
                      <p>{comparative_analysis.year_over_year_change > 10 ? 'Strong growth indicates increasing popularity' : comparative_analysis.year_over_year_change > 0 ? 'Steady growth trend observed' : 'Declining trend requires attention'}</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <i className="fas fa-calendar-alt"></i>
                    <div className="insight-content">
                      <h5>Seasonal Pattern</h5>
                      <p>{season.name} season typically sees {crowdLevel.toLowerCase()} visitor density</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <i className="fas fa-bullhorn"></i>
                    <div className="insight-content">
                      <h5>Marketing Focus</h5>
                      <p>Target {crowdLevel.toLowerCase()} season promotions to optimize visitor distribution</p>
                    </div>
                  </div>
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