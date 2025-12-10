import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './ResourcePlan.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function ResourcePlan({ resources, prediction }) {
  const { staff, transport, accommodation, budget } = resources;

  // Budget pie chart data
  const budgetChartData = {
    labels: ['Staff Salaries', 'Transport', 'Maintenance', 'Emergency Reserve', 'Marketing & Promotion'],
    datasets: [{
      data: [budget.staff, budget.transport, budget.maintenance, budget.emergency, budget.marketing],
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1
    }]
  };

  // Staff breakdown bar chart
  const staffChartData = {
    labels: ['Tour Guides', 'Security', 'Support Staff'],
    datasets: [{
      label: 'Personnel',
      data: [staff.guides, staff.security, staff.support],
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(16, 185, 129, 0.8)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(16, 185, 129, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Transport breakdown chart
  const transportChartData = {
    labels: ['Buses', 'Vans', 'Taxis', 'Specialty Vehicles'],
    datasets: [{
      label: 'Vehicles',
      data: [transport.buses, transport.vans, transport.taxis, transport.specialty],
      backgroundColor: [
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(16, 165, 204, 0.8)'
      ],
      borderColor: [
        'rgba(139, 92, 246, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(16, 165, 204, 1)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.6)' },
        grid: { display: false }
      }
    }
  };

  // Calculate resource utilization percentages
  const staffUtilization = Math.min(100, (staff.total / 3000) * 100);
  const transportUtilization = Math.min(100, (transport.total / 500) * 100);
  const accommodationUtilization = Math.min(100, (accommodation.rooms / 15000) * 100);

  // Seasonal factors for resource planning
  const getSeasonalFactor = (month) => {
    if ([12, 1, 2].includes(month)) return 1.4; // Winter peak (ski season)
    if ([6, 7, 8].includes(month)) return 1.3;  // Summer peak
    if ([3, 4, 5, 9, 10, 11].includes(month)) return 1.0; // Normal
    return 1.0;
  };

  const seasonalFactor = getSeasonalFactor(prediction.month);

  return (
    <div className="resource-plan" data-aos="fade-up">
      <div className="plan-header">
        <h2>
          <i className="fas fa-cogs"></i>
          Comprehensive Resource Allocation Plan
        </h2>
        <p>Optimized resource requirements for {prediction.predicted_footfall.toLocaleString()} expected visitors in {prediction.location} - {new Date(prediction.year, prediction.month - 1).toLocaleString('default', { month: 'long' })} {prediction.year}</p>
        <div className="prediction-insight">
          <i className="fas fa-chart-line"></i>
          <span>{prediction.comparative_analysis.year_over_year_change > 0 ? 'Growth' : 'Decline'} of {Math.abs(prediction.comparative_analysis.year_over_year_change)}% from {prediction.comparative_analysis.previous_year} | Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="resource-summary">
        <div className="summary-card" data-aos="zoom-in" data-aos-delay="100">
          <div className="summary-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Staff Required</div>
            <div className="summary-value">{staff.total}</div>
            <div className="summary-breakdown">
              Guides: {staff.guides} • Security: {staff.security} • Support: {staff.support}
            </div>
            <div className="utilization-bar">
              <div className="utilization-label">Utilization</div>
              <div className="utilization-track">
                <div className="utilization-fill" style={{ width: `${staffUtilization}%` }}></div>
              </div>
              <div className="utilization-percent">{Math.round(staffUtilization)}%</div>
            </div>
            <div className="resource-trend">
              <i className={`fas fa-arrow-${prediction.comparative_analysis.trend === 'increase' ? 'up' : 'down'}`}></i>
              <span>{Math.abs(prediction.comparative_analysis.year_over_year_change)}% {prediction.comparative_analysis.trend}</span>
            </div>
          </div>
        </div>

        <div className="summary-card" data-aos="zoom-in" data-aos-delay="200">
          <div className="summary-icon">
            <i className="fas fa-bus"></i>
          </div>
          <div className="summary-content">
            <div className="summary-label">Transport Vehicles</div>
            <div className="summary-value">{transport.total}</div>
            <div className="summary-breakdown">
              Buses: {transport.buses} • Vans: {transport.vans} • Taxis: {transport.taxis}
            </div>
            <div className="utilization-bar">
              <div className="utilization-label">Utilization</div>
              <div className="utilization-track">
                <div className="utilization-fill" style={{ width: `${transportUtilization}%`, backgroundColor: '#8b5cf6' }}></div>
              </div>
              <div className="utilization-percent">{Math.round(transportUtilization)}%</div>
            </div>
            <div className="resource-trend">
              <i className="fas fa-info-circle"></i>
              <span>Peak hour capacity: {transport.total * 40} passengers</span>
            </div>
          </div>
        </div>

        <div className="summary-card" data-aos="zoom-in" data-aos-delay="300">
          <div className="summary-icon">
            <i className="fas fa-hotel"></i>
          </div>
          <div className="summary-content">
            <div className="summary-label">Accommodation</div>
            <div className="summary-value">{accommodation.rooms}</div>
            <div className="summary-breakdown">
              Rooms needed across {accommodation.hotels} hotels
            </div>
            <div className="utilization-bar">
              <div className="utilization-label">Utilization</div>
              <div className="utilization-track">
                <div className="utilization-fill" style={{ width: `${accommodationUtilization}%`, backgroundColor: '#10b981' }}></div>
              </div>
              <div className="utilization-percent">{Math.round(accommodationUtilization)}%</div>
            </div>
            <div className="resource-trend">
              <i className="fas fa-bed"></i>
              <span>Avg. occupancy: {(accommodationUtilization * 0.8).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="summary-card highlight" data-aos="zoom-in" data-aos-delay="400">
          <div className="summary-icon">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="summary-content">
            <div className="summary-label">Estimated Budget</div>
            <div className="summary-value">₹{(budget.total / 100000).toFixed(2)}L</div>
            <div className="summary-breakdown">
              Monthly operational cost
            </div>
            <div className="budget-trend">
              <i className={`fas fa-arrow-${prediction.comparative_analysis.trend === 'increase' ? 'up' : 'down'}`}></i>
              <span>{Math.abs(prediction.comparative_analysis.year_over_year_change)}% {prediction.comparative_analysis.trend} from {prediction.comparative_analysis.previous_year}</span>
            </div>
            <div className="budget-per-visitor">
              Cost per visitor: ₹{Math.round(budget.total / prediction.predicted_footfall)}
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card" data-aos="fade-right">
          <h3>
            <i className="fas fa-chart-pie"></i>
            Budget Distribution
          </h3>
          <div className="chart-container">
            <Pie data={budgetChartData} options={{ ...chartOptions, scales: undefined }} />
          </div>
          <div className="chart-insight">
            <i className="fas fa-info-circle"></i>
            Staff salaries account for {(budget.staff / budget.total * 100).toFixed(1)}% of total budget. Marketing allocation ({(budget.marketing / budget.total * 100).toFixed(1)}%) supports visitor growth.
          </div>
        </div>

        <div className="chart-card" data-aos="fade-left">
          <h3>
            <i className="fas fa-chart-bar"></i>
            Staff Breakdown
          </h3>
          <div className="chart-container">
            <Bar data={staffChartData} options={chartOptions} />
          </div>
          <div className="chart-insight">
            <i className="fas fa-info-circle"></i>
            Security personnel make up {(staff.security / staff.total * 100).toFixed(1)}% of total staff. Tour guides ratio: 1:{Math.round(prediction.predicted_footfall / staff.guides)} visitors per guide.
          </div>
        </div>

        <div className="chart-card" data-aos="fade-up">
          <h3>
            <i className="fas fa-shuttle-van"></i>
            Transport Distribution
          </h3>
          <div className="chart-container">
            <Bar data={transportChartData} options={chartOptions} />
          </div>
          <div className="chart-insight">
            <i className="fas fa-info-circle"></i>
            Buses represent {(transport.buses / transport.total * 100).toFixed(1)}% of transport fleet. Specialty vehicles ({transport.specialty}) for {prediction.location} terrain requirements.
          </div>
        </div>
      </div>

      <div className="detailed-planning">
        <h3>
          <i className="fas fa-tasks"></i>
          Detailed Resource Planning
        </h3>
        
        <div className="planning-sections">
          <div className="planning-section" data-aos="fade-up">
            <h4><i className="fas fa-user-friends"></i> Staffing Plan</h4>
            <div className="planning-details">
              <div className="detail-item">
                <span className="detail-label">Shift Schedule:</span>
                <span className="detail-value">3 shifts (8 hours each) with 20% overlap for smooth transitions</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Training Requirements:</span>
                <span className="detail-value">All staff trained in local language, emergency procedures, and {prediction.location} specific knowledge</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Overtime Policy:</span>
                <span className="detail-value">Authorized for peak periods with 1.5x pay rate</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Seasonal Adjustment:</span>
                <span className="detail-value">{seasonalFactor > 1.2 ? 'High season staffing (+40%)' : seasonalFactor > 1.0 ? 'Standard staffing (+20%)' : 'Base staffing levels'}</span>
              </div>
            </div>
          </div>
          
          <div className="planning-section" data-aos="fade-up">
            <h4><i className="fas fa-bus-alt"></i> Transportation Plan</h4>
            <div className="planning-details">
              <div className="detail-item">
                <span className="detail-label">Route Optimization:</span>
                <span className="detail-value">Primary routes every 30 minutes, peak hour frequency every 15 minutes</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Vehicle Maintenance:</span>
                <span className="detail-value">Daily checks with 24-hour turnaround for repairs</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Special Services:</span>
                <span className="detail-value">{transport.specialty} specialty vehicles for {prediction.location} terrain accessibility</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Capacity Management:</span>
                <span className="detail-value">Real-time monitoring with dynamic dispatching during peak hours</span>
              </div>
            </div>
          </div>
          
          <div className="planning-section" data-aos="fade-up">
            <h4><i className="fas fa-hotel"></i> Accommodation Plan</h4>
            <div className="planning-details">
              <div className="detail-item">
                <span className="detail-label">Room Categories:</span>
                <span className="detail-value">{Math.round(accommodation.rooms * 0.6)} standard, {Math.round(accommodation.rooms * 0.3)} deluxe, {Math.round(accommodation.rooms * 0.1)} premium rooms</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Booking Strategy:</span>
                <span className="detail-value">Dynamic pricing with 20% advance booking discount, last-minute surge pricing</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Alternative Options:</span>
                <span className="detail-value">Partnership with {accommodation.hotels} local hotels and 50+ homestays</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quality Assurance:</span>
                <span className="detail-value">Monthly inspections with mystery guest program</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons" data-aos="fade-up">
        <button className="btn btn-download">
          <i className="fas fa-file-pdf"></i>
          Download Detailed Report (PDF)
        </button>
        <button className="btn btn-export">
          <i className="fas fa-file-excel"></i>
          Export Data to Excel
        </button>
        <button className="btn btn-share">
          <i className="fas fa-share-alt"></i>
          Share with Department
        </button>
        <button className="btn btn-print">
          <i className="fas fa-print"></i>
          Print Plan
        </button>
      </div>

      <div className="alerts-section" data-aos="fade-up">
        <h3>
          <i className="fas fa-exclamation-triangle"></i>
          Critical Alerts & Strategic Recommendations
        </h3>
        <div className="alerts-grid">
          {prediction.predicted_footfall > 50000 && (
            <div className="alert alert-critical">
              <i className="fas fa-exclamation-circle"></i>
              <div className="alert-content">
                <div className="alert-title">HIGH SEASON ALERT</div>
                <div className="alert-text">
                  Peak visitor season detected with {prediction.predicted_footfall.toLocaleString()} expected visitors. Deploy maximum resources and monitor capacity closely.
                </div>
                <div className="alert-actions">
                  <button className="btn btn-small">Increase Staff by 30%</button>
                  <button className="btn btn-small">Add Transport</button>
                </div>
              </div>
            </div>
          )}

          {staff.total > 2500 && (
            <div className="alert alert-warning">
              <i className="fas fa-users-cog"></i>
              <div className="alert-content">
                <div className="alert-title">STAFF REQUIREMENTS</div>
                <div className="alert-text">
                  {staff.total} personnel required. Begin recruitment immediately or redeploy from low-traffic areas. Consider temporary staff contracts.
                </div>
                <div className="alert-actions">
                  <button className="btn btn-small">View Recruitment Plan</button>
                  <button className="btn btn-small">Request Staff Transfer</button>
                </div>
              </div>
            </div>
          )}

          {accommodation.rooms > 12000 && (
            <div className="alert alert-warning">
              <i className="fas fa-hotel"></i>
              <div className="alert-content">
                <div className="alert-title">ACCOMMODATION CAPACITY</div>
                <div className="alert-text">
                  {accommodation.rooms} rooms needed. Partner with nearby hotels and promote homestays. Consider temporary accommodation solutions.
                </div>
                <div className="alert-actions">
                  <button className="btn btn-small">Contact Hotels</button>
                  <button className="btn btn-small">Promote Homestays</button>
                </div>
              </div>
            </div>
          )}

          <div className="alert alert-info">
            <i className="fas fa-info-circle"></i>
            <div className="alert-content">
              <div className="alert-title">BUDGET & PLANNING</div>
              <div className="alert-text">
                Estimated budget of ₹{(budget.total / 100000).toFixed(2)}L requires finance department approval. Cost per visitor: ₹{Math.round(budget.total / prediction.predicted_footfall)}. ROI tracking recommended.
              </div>
              <div className="alert-actions">
                <button className="btn btn-small">Submit for Approval</button>
                <button className="btn btn-small">View Budget Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="department-notes" data-aos="fade-up">
        <h3>
          <i className="fas fa-sticky-note"></i>
          Department Notes & Action Items
        </h3>
        <div className="notes-content">
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note1" />
              <label htmlFor="note1">Review and approve budget allocation of ₹{(budget.total / 100000).toFixed(2)}L for {new Date(prediction.year, prediction.month - 1).toLocaleString('default', { month: 'long' })} {prediction.year}</label>
            </div>
            <div className="note-due">Due: 3 days</div>
          </div>
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note2" />
              <label htmlFor="note2">Coordinate with transport department for deployment of {transport.total} vehicles including {transport.specialty} specialty vehicles for {prediction.location}</label>
            </div>
            <div className="note-due">Due: 1 week</div>
          </div>
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note3" />
              <label htmlFor="note3">Schedule staff training for peak season operations with focus on {prediction.location} specific requirements</label>
            </div>
            <div className="note-due">Due: 2 weeks</div>
          </div>
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note4" />
              <label htmlFor="note4">Contact accommodation partners for availability confirmation and rate negotiations</label>
            </div>
            <div className="note-due">Due: 10 days</div>
          </div>
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note5" />
              <label htmlFor="note5">Implement marketing campaign targeting {prediction.comparative_analysis.year_over_year_change > 0 ? 'continued growth' : 'recovery'} with ₹{(budget.marketing / 1000).toFixed(0)}K budget</label>
            </div>
            <div className="note-due">Due: 1 week</div>
          </div>
        </div>
        <div className="notes-actions">
          <button className="btn btn-primary">
            <i className="fas fa-save"></i>
            Save Notes
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-plus"></i>
            Add New Note
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResourcePlan;