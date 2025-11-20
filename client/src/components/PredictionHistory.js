import React from 'react';
import './PredictionHistory.css';

function PredictionHistory({ history }) {
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

  return (
    <div className="prediction-history" data-aos="fade-up">
      <div className="history-header">
        <h2>
          <i className="fas fa-history"></i>
          Recent Predictions
        </h2>
        <p>View your prediction history</p>
      </div>

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
            {history.map((pred, index) => (
              <tr key={index} data-aos="fade-up" data-aos-delay={index * 50}>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PredictionHistory;
