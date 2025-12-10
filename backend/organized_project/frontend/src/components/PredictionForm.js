import React, { useState, useEffect } from 'react';
import './PredictionForm.css';

function PredictionForm({ locations, onPredict, loading }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    location: '',
    year: currentYear,
    month: new Date().getMonth() + 1,
    rolling_avg: 80000
  });
  
  const [isLocationValid, setIsLocationValid] = useState(false);

  useEffect(() => {
    // Set default location if none selected
    if (locations.length > 0 && !formData.location) {
      setFormData(prev => ({
        ...prev,
        location: locations[0]
      }));
    }
  }, [locations, formData.location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.location && isLocationValid) {
      onPredict(formData);
    }
  };

  // Intelligent rolling average calculation based on location and month
  const calculateIntelligentRollingAvg = (location, month) => {
    // Location-based base values (typical monthly averages)
    const locationAverages = {
      'Gulmarg': 25000,      // Popular ski resort
      'Pahalgam': 35000,     // Popular valley destination
      'Sonamarg': 20000,     // Beautiful valley
      'Yousmarg': 15000,     // Emerging destination
      'Doodpathri': 8000,    // Nearby attraction
      'Kokernag': 6000,      // Lesser known
      'Lolab': 5000,         // Remote valley
      'Manasbal': 12000,     // Beautiful lake
      'Aharbal': 4000,       // Waterfall destination
      'Gurez': 3000          // Very remote
    };

    // Seasonal multipliers (peak seasons get higher multipliers)
    const seasonalMultipliers = {
      'Gulmarg': {
        12: 3.0, 1: 2.8, 2: 2.2,  // Winter peak
        3: 0.7, 6: 0.4, 7: 0.3, 8: 0.4  // Summer off-season
      },
      'Pahalgam': {
        5: 1.2, 6: 2.5, 7: 2.3, 8: 2.0, 9: 1.5,  // Summer peak
        12: 0.5, 1: 0.4, 2: 0.3  // Winter off-season
      },
      'Sonamarg': {
        5: 1.3, 6: 1.8, 7: 1.7, 8: 1.5, 9: 1.2,  // Spring/Summer
        12: 0.6, 1: 0.5, 2: 0.4  // Winter
      }
    };

    // Default seasonal pattern for other locations
    const defaultSeasonal = {
      1: 0.6, 2: 0.7, 3: 0.9, 4: 1.0, 5: 1.2,
      6: 1.5, 7: 1.7, 8: 1.6, 9: 1.3, 10: 1.0,
      11: 0.8, 12: 0.7
    };

    const baseAvg = locationAverages[location] || 12000;
    const locationPattern = seasonalMultipliers[location] || defaultSeasonal;
    const multiplier = locationPattern[month] || defaultSeasonal[month] || 1.0;

    return Math.round(baseAvg * multiplier);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'rolling_avg' || name === 'year' || name === 'month' ? 
      (value === '' ? '' : parseInt(value)) : value;
      
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate location
    if (name === 'location') {
      setIsLocationValid(locations.includes(newValue));
      // Auto-update rolling average when location changes
      if (newValue && locations.includes(newValue)) {
        const intelligentAvg = calculateIntelligentRollingAvg(newValue, formData.month);
        setFormData(prev => ({
          ...prev,
          location: newValue,
          rolling_avg: intelligentAvg
        }));
      }
    }
    
    // Auto-update rolling average when month changes
    if (name === 'month') {
      if (formData.location) {
        const intelligentAvg = calculateIntelligentRollingAvg(formData.location, newValue);
        setFormData(prev => ({
          ...prev,
          month: newValue,
          rolling_avg: intelligentAvg
        }));
      }
    }
  };

  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  // Location descriptions for better UX
  const locationInfo = {
    'Gulmarg': { 
      description: 'Ski resort with cold climate and heavy snowfall', 
      bestSeason: 'Winter (Dec-Feb)',
      avgVisitors: 'High in winter, moderate in summer'
    },
    'Pahalgam': { 
      description: 'Valley town with moderate climate', 
      bestSeason: 'Summer (Jun-Aug)',
      avgVisitors: 'High in summer, low in winter'
    },
    'Sonamarg': { 
      description: 'Beautiful valley with diverse weather', 
      bestSeason: 'Spring & Autumn (Mar-May, Sep-Nov)',
      avgVisitors: 'Moderate year-round'
    },
    'Yousmarg': { 
      description: 'Scenic destination with varied conditions', 
      bestSeason: 'Summer & Autumn (Jun-Nov)',
      avgVisitors: 'Moderate'
    },
    'Doodpathri': { 
      description: 'Emerging tourist spot with unique features', 
      bestSeason: 'Summer (May-Aug)',
      avgVisitors: 'Low to moderate'
    },
    'Kokernag': { 
      description: 'Mountainous area with specific weather patterns', 
      bestSeason: 'Summer (Jun-Sep)',
      avgVisitors: 'Low'
    },
    'Lolab': { 
      description: 'Valley with distinct seasonal variations', 
      bestSeason: 'Spring & Autumn (Mar-May, Sep-Nov)',
      avgVisitors: 'Low to moderate'
    },
    'Manasbal': { 
      description: 'Lake destination with water-based activities', 
      bestSeason: 'Summer (May-Sep)',
      avgVisitors: 'Moderate'
    },
    'Aharbal': { 
      description: 'Waterfall location with specific conditions', 
      bestSeason: 'Summer (Jun-Aug)',
      avgVisitors: 'Low to moderate'
    },
    'Gurez': { 
      description: 'Remote valley with unique climate', 
      bestSeason: 'Summer (Jun-Sep)',
      avgVisitors: 'Low'
    }
  };

  // Get current location info
  const currentLocationInfo = formData.location ? locationInfo[formData.location] : null;

  // Quick selection buttons
  const quickSelectLocation = (location) => {
    const intelligentAvg = calculateIntelligentRollingAvg(location, formData.month);
    setFormData(prev => ({
      ...prev,
      location,
      rolling_avg: intelligentAvg
    }));
    setIsLocationValid(true);
  };

  const quickSelectTime = (monthsFromNow) => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsFromNow);
    const intelligentAvg = formData.location ? 
      calculateIntelligentRollingAvg(formData.location, date.getMonth() + 1) : 80000;
    setFormData(prev => ({
      ...prev,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      rolling_avg: intelligentAvg
    }));
  };

  return (
    <div className="prediction-form-container" data-aos="fade-up">
      <div className="form-header">
        <h3>
          <i className="fas fa-search"></i>
          Predict Tourist Footfall
        </h3>
        <p>Enter the location, time period, and optional rolling average for accurate predictions</p>
      </div>
      
      <form className="prediction-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h4><i className="fas fa-map-marker-alt"></i> Location Selection</h4>
          
          <div className="location-quick-select">
            <span>Quick Select:</span>
            {locations.slice(0, 5).map(loc => (
              <button
                key={loc}
                type="button"
                className={`btn-location ${formData.location === loc ? 'active' : ''}`}
                onClick={() => quickSelectLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
          
          <div className="form-group">
            <label htmlFor="location">
              <i className="fas fa-map-marker-alt"></i>
              Tourist Location
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={loading}
              className={`location-select ${isLocationValid ? 'valid' : 'invalid'}`}
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            
            {currentLocationInfo && (
              <div className="location-details">
                <div className="detail-item">
                  <i className="fas fa-info-circle"></i>
                  <span>{currentLocationInfo.description}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-calendar-check"></i>
                  <span>Best Season: {currentLocationInfo.bestSeason}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-users"></i>
                  <span>Avg Visitors: {currentLocationInfo.avgVisitors}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h4><i className="fas fa-calendar-alt"></i> Time Period</h4>
          
          <div className="time-quick-select">
            <span>Quick Select:</span>
            <button type="button" className="btn-time" onClick={() => quickSelectTime(0)}>This Month</button>
            <button type="button" className="btn-time" onClick={() => quickSelectTime(1)}>Next Month</button>
            <button type="button" className="btn-time" onClick={() => quickSelectTime(3)}>3 Months</button>
            <button type="button" className="btn-time" onClick={() => quickSelectTime(6)}>6 Months</button>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">
                <i className="fas fa-calendar-alt"></i>
                Year
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2024"
                max="2030"
                required
                disabled={loading}
                className="year-input"
              />
              <div className="input-hint">Select year for prediction (2024-2030)</div>
            </div>

            <div className="form-group">
              <label htmlFor="month">
                <i className="fas fa-calendar"></i>
                Month
              </label>
              <select
                id="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                required
                disabled={loading}
                className="month-select"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.name}</option>
                ))}
              </select>
              <div className="input-hint">Select month for prediction</div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4><i className="fas fa-chart-line"></i> Advanced Settings (Optional)</h4>
          
          <div className="form-group">
            <label htmlFor="rolling_avg">
              <i className="fas fa-history"></i>
              Historical Average Footfall
            </label>
            <input
              type="number"
              id="rolling_avg"
              name="rolling_avg"
              value={formData.rolling_avg}
              onChange={handleChange}
              placeholder="80000"
              min="0"
              disabled={loading}
              className="rolling-avg-input"
            />
            <div className="input-hint">
              Auto-calculated based on location/season. Edit to override.
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-predict" 
            disabled={loading || !formData.location || !isLocationValid}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Analyzing Data...
              </>
            ) : (
              <>
                <i className="fas fa-brain"></i>
                Generate Prediction
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-reset"
            onClick={() => {
              const intelligentAvg = locations.length > 0 ? 
                calculateIntelligentRollingAvg(locations[0], new Date().getMonth() + 1) : 80000;
              setFormData({
                location: locations.length > 0 ? locations[0] : '',
                year: currentYear,
                month: new Date().getMonth() + 1,
                rolling_avg: intelligentAvg
              });
              setIsLocationValid(locations.length > 0);
            }}
            disabled={loading}
          >
            <i className="fas fa-redo"></i>
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}

export default PredictionForm;