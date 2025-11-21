import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PredictionHistory.css';

function PredictionHistory({ history }) {
  const [filteredHistory, setFilteredHistory] = useState(history);
  const [filters, setFilters] = useState({
    location: '',
    year: '',
    month: ''
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, filters]);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/predictions/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];
    
    if (filters.location) {
      filtered = filtered.filter(pred => pred.location === filters.location);
    }
    
    if (filters.year) {
      filtered = filtered.filter(pred => pred.year === parseInt(filters.year));
    }
    
    if (filters.month) {
      filtered = filtered.filter(pred => pred.month === parseInt(filters.month));
    }
    
    setFilteredHistory(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      year: '',
      month: ''
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get unique locations for filter dropdown
  const getUniqueLocations = () => {
    const locations = [...new Set(history.map(pred => pred.location))];
    return locations.sort();
  };

  // Get unique years for filter dropdown
  const getUniqueYears = () => {
    const years = [...new Set(history.map(pred => pred.year))];
    return years.sort((a, b) => b - a);
  };

  return (
    <div className="prediction-history" data-aos="fade-up">
      <div className="history-header">
        <h2>
          <i className="fas fa-history"></i>
          Prediction History
        </h2>
        <p>View and analyze your prediction history</p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="history-stats" data-aos="fade-up">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-calculator"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.overall.totalPredictions || 0}</div>
                <div className="stat-label">Total Predictions</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {stats.overall.averageFootfall ? Math.round(stats.overall.averageFootfall).toLocaleString() : '0'}
                </div>
                <div className="stat-label">Avg. Footfall</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.overall.locations?.length || 0}</div>
                <div className="stat-label">Locations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="history-filters" data-aos="fade-up">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="location-filter">Location</label>
            <select
              id="location-filter"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {getUniqueLocations().map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="year-filter">Year</label>
            <select
              id="year-filter"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Years</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="month-filter">Month</label>
            <select
              id="month-filter"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Months</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                <option key={month} value={month}>
                  {new Date(2024, month-1, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-actions">
            <button className="btn btn-clear" onClick={clearFilters}>
              <i className="fas fa-times"></i>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredHistory.length} of {history.length} predictions
      </div>

      {/* History Table */}
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Date</th>
              <th>Predicted Footfall</th>
              <th>Confidence</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((pred, index) => (
                <tr key={pred._id || index} data-aos="fade-up" data-aos-delay={index * 50}>
                  <td>
                    <div className="location-cell">
                      <i className="fas fa-map-marker-alt"></i>
                      {pred.location}
                    </div>
                  </td>
                  <td>
                    <span className="date-badge">
                      {pred.year}-{String(pred.month).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="footfall-cell">
                    {pred.predictedFootfall?.toLocaleString() || 'N/A'}
                  </td>
                  <td>
                    <div className="confidence-badge">
                      {(pred.confidence * 100).toFixed(0)}%
                    </div>
                  </td>
                  <td className="timestamp-cell">
                    {formatDate(pred.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  <i className="fas fa-search"></i>
                  <p>No predictions found matching your filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PredictionHistory;