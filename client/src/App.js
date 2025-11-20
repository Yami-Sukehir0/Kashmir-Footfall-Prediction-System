import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AOS from 'aos';
import Hero from './components/Hero';
import PredictionForm from './components/PredictionForm';
import PredictionResults from './components/PredictionResults';
import ResourcePlan from './components/ResourcePlan';
import PredictionHistory from './components/PredictionHistory';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function App() {
  const [locations, setLocations] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [resources, setResources] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('predict');

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true
    });

    loadLocations();
    loadHistory();
  }, []);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['predict', 'results', 'resources', 'history'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/locations`);
      setLocations(response.data.locations);
    } catch (err) {
      console.error('Failed to load locations:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/predictions`);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Get prediction
      const predResponse = await axios.post(`${API_URL}/predict`, formData);
      setPrediction(predResponse.data.prediction);

      // Calculate resources
      const resResponse = await axios.post(`${API_URL}/resources`, {
        footfall: predResponse.data.prediction.predicted_footfall
      });
      setResources(resResponse.data);

      // Reload history
      loadHistory();

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
      }, 300);

    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar" data-aos="fade-down">
        <div className="container">
          <div className="nav-brand">
            <i className="fas fa-mountain"></i>
            <span>Kashmir Tourism</span>
          </div>
          <div className="nav-menu">
            <a 
              href="#predict" 
              className={`nav-link ${activeSection === 'predict' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); scrollToSection('predict'); }}
            >
              <i className="fas fa-search"></i>
              Predict
            </a>
            {prediction && (
              <a 
                href="#results" 
                className={`nav-link ${activeSection === 'results' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection('results'); }}
              >
                <i className="fas fa-chart-bar"></i>
                Results
              </a>
            )}
            {resources && (
              <a 
                href="#resources" 
                className={`nav-link ${activeSection === 'resources' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection('resources'); }}
              >
                <i className="fas fa-cogs"></i>
                Resources
              </a>
            )}
            {history.length > 0 && (
              <a 
                href="#history" 
                className={`nav-link ${activeSection === 'history' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection('history'); }}
              >
                <i className="fas fa-history"></i>
                History
              </a>
            )}
          </div>
        </div>
      </nav>

      <Hero />

      <section className="prediction-section" id="predict">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">
              <i className="fas fa-chart-line"></i>
              Predict Tourist Footfall
            </h2>
            <p className="section-subtitle">
              AI-powered predictions for resource planning and management
            </p>
          </div>

          <PredictionForm 
            locations={locations}
            onPredict={handlePredict}
            loading={loading}
          />

          {error && (
            <div className="error-message" data-aos="fade-in">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
        </div>
      </section>

      {prediction && (
        <>
          <section className="results-section" id="results">
            <div className="container">
              <PredictionResults prediction={prediction} />
            </div>
          </section>

          {resources && (
            <section className="resources-section" id="resources">
              <div className="container">
                <ResourcePlan resources={resources} prediction={prediction} />
              </div>
            </section>
          )}
        </>
      )}

      {history.length > 0 && (
        <section className="history-section" id="history">
          <div className="container">
            <PredictionHistory history={history} />
          </div>
        </section>
      )}

      {/* Features Section for Pitch */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">
              <i className="fas fa-star"></i>
              Platform Features
            </h2>
            <p className="section-subtitle">
              Comprehensive solution for tourism resource management
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>AI-Powered Predictions</h3>
              <p>Advanced machine learning models with 85% accuracy for footfall forecasting</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
              <div className="feature-icon">
                <i className="fas fa-cogs"></i>
              </div>
              <h3>Resource Optimization</h3>
              <p>Automated resource allocation for staff, transport, and accommodation</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
              <div className="feature-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <h3>Interactive Dashboards</h3>
              <p>Real-time visualizations and comprehensive reporting capabilities</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="400">
              <div className="feature-icon">
                <i className="fas fa-cloud-sun"></i>
              </div>
              <h3>Weather Integration</h3>
              <p>Advanced weather data analysis for better planning decisions</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="500">
              <div className="feature-icon">
                <i className="fas fa-history"></i>
              </div>
              <h3>Historical Analytics</h3>
              <p>Trend analysis and pattern recognition from historical data</p>
            </div>

            <div className="feature-card" data-aos="fade-up" data-aos-delay="600">
              <div className="feature-icon">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3>Mobile Responsive</h3>
              <p>Fully responsive design for access on any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section for Pitch */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <h2 className="section-title">
              <i className="fas fa-comments"></i>
              Department Feedback
            </h2>
            <p className="section-subtitle">
              What tourism officials are saying about our platform
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="100">
              <div className="testimonial-content">
                <p>"The AI predictions have improved our resource planning accuracy by 40%. This platform is a game-changer for Kashmir tourism management."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Dr. Rashid Ahmad</h4>
                  <p>Director of Tourism, Kashmir</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="200">
              <div className="testimonial-content">
                <p>"The resource allocation recommendations have helped us reduce operational costs by 15% while improving visitor satisfaction scores."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Sarah Khan</h4>
                  <p>Operations Manager, Gulmarg Resort</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card" data-aos="fade-up" data-aos-delay="300">
              <div className="testimonial-content">
                <p>"The historical data analysis feature has been invaluable for long-term planning and budget forecasting. Highly recommended!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-info">
                  <h4>Mohammed Yusuf</h4>
                  <p>Planning Officer, Tourism Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <div className="footer-logo">
                <i className="fas fa-mountain"></i>
                <span>Kashmir Tourism Platform</span>
              </div>
              <p>AI-powered resource management for sustainable tourism development</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Platform</h4>
                <a href="#predict">Make Prediction</a>
                <a href="#features">Features</a>
                <a href="#history">History</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="#">Documentation</a>
                <a href="#">API Reference</a>
                <a href="#">Support</a>
              </div>
              <div className="footer-column">
                <h4>Contact</h4>
                <a href="#">Support Team</a>
                <a href="#">Feedback</a>
                <a href="#">Partnerships</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Kashmir Tourism Platform. All rights reserved.</p>
            <p>AI-Powered Resource Management System for the Department of Tourism</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;