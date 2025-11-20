import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import './ResourcePlan.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function ResourcePlan({ resources, prediction }) {
  const { staff, transport, accommodation, budget } = resources;

  // Budget pie chart data
  const budgetChartData = {
    labels: ['Staff Salaries', 'Transport', 'Maintenance', 'Emergency Reserve'],
    datasets: [{
      data: [budget.staff, budget.transport, budget.maintenance, budget.emergency],
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)'
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
    labels: ['Buses', 'Vans', 'Taxis'],
    datasets: [{
      label: 'Vehicles',
      data: [transport.buses, transport.vans, transport.taxis],
      backgroundColor: [
        'rgba(139, 92, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgba(139, 92, 246, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(236, 72, 153, 1)'
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
  const staffUtilization = Math.min(100, (staff.total / 2500) * 100);
  const transportUtilization = Math.min(100, (transport.total / 300) * 100);
  const accommodationUtilization = Math.min(100, (accommodation.rooms / 12000) * 100);

  return (
    <div className="resource-plan" data-aos="fade-up">
      <div className="plan-header">
        <h2>
          <i className="fas fa-cogs"></i>
          Resource Allocation Plan
        </h2>
        <p>Optimized resource requirements for {prediction.predicted_footfall.toLocaleString()} expected visitors</p>
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
              <i className="fas fa-arrow-up"></i>
              <span>+8% from last period</span>
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
            Staff salaries account for {(budget.staff / budget.total * 100).toFixed(1)}% of total budget
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
            Security personnel make up {(staff.security / staff.total * 100).toFixed(1)}% of total staff
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
            Buses represent {(transport.buses / transport.total * 100).toFixed(1)}% of transport fleet
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
          Critical Alerts & Recommendations
        </h3>
        <div className="alerts-grid">
          {prediction.predicted_footfall > 90000 && (
            <div className="alert alert-critical">
              <i className="fas fa-exclamation-circle"></i>
              <div className="alert-content">
                <div className="alert-title">HIGH SEASON ALERT</div>
                <div className="alert-text">
                  Peak visitor season detected. Deploy maximum resources and monitor capacity closely.
                </div>
                <div className="alert-actions">
                  <button className="btn btn-small">Increase Staff by 20%</button>
                  <button className="btn btn-small">Add Transport</button>
                </div>
              </div>
            </div>
          )}

          {staff.total > 2000 && (
            <div className="alert alert-warning">
              <i className="fas fa-users-cog"></i>
              <div className="alert-content">
                <div className="alert-title">STAFF SHORTAGE RISK</div>
                <div className="alert-text">
                  {staff.total} personnel required. Begin recruitment immediately or redeploy from low-traffic areas.
                </div>
                <div className="alert-actions">
                  <button className="btn btn-small">View Recruitment Plan</button>
                  <button className="btn btn-small">Request Staff Transfer</button>
                </div>
              </div>
            </div>
          )}

          {accommodation.rooms > 10000 && (
            <div className="alert alert-warning">
              <i className="fas fa-hotel"></i>
              <div className="alert-content">
                <div className="alert-title">ACCOMMODATION CAPACITY</div>
                <div className="alert-text">
                  {accommodation.rooms} rooms needed. Partner with nearby hotels and promote homestays.
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
              <div className="alert-title">BUDGET APPROVAL REQUIRED</div>
              <div className="alert-text">
                Estimated budget of ₹{(budget.total / 100000).toFixed(2)}L requires finance department approval.
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
              <label htmlFor="note1">Review and approve budget allocation</label>
            </div>
            <div className="note-due">Due: 3 days</div>
          </div>
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note2" />
              <label htmlFor="note2">Coordinate with transport department for vehicle deployment</label>
            </div>
            <div className="note-due">Due: 1 week</div>
          </div>
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note3" />
              <label htmlFor="note3">Schedule staff training for peak season</label>
            </div>
            <div className="note-due">Due: 2 weeks</div>
          </div>
          <div className="note-item">
            <div className="note-checkbox">
              <input type="checkbox" id="note4" />
              <label htmlFor="note4">Contact accommodation partners for availability confirmation</label>
            </div>
            <div className="note-due">Due: 10 days</div>
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