import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="shader-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <div className="hero-content">
        <div className="hero-badge" data-aos="fade-down">
          <span className="badge-icon">🏔️</span>
          <span className="badge-text">AI-Powered Tourism Platform</span>
        </div>

        <h1 className="hero-title" data-aos="fade-up" data-aos-delay="200">
          Kashmir Tourism
          <span className="gradient-text">Resource Management</span>
        </h1>

        <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="400">
          Predict tourist footfall, optimize resource allocation,
          <br />and make data-driven decisions for Kashmir tourism
        </p>

        <div className="stats" data-aos="fade-up" data-aos-delay="600">
          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">85%</div>
            <div className="stat-label">Prediction Accuracy</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon">📍</div>
            <div className="stat-value">10</div>
            <div className="stat-label">Destinations</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">AI</div>
            <div className="stat-label">Powered</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-value">22</div>
            <div className="stat-label">Features</div>
          </div>
        </div>

        <div className="cta-group" data-aos="fade-up" data-aos-delay="800">
          <a href="#predict" className="btn btn-primary">
            <i className="fas fa-chart-line"></i>
            Make Prediction
          </a>
          <a href="#features" className="btn btn-secondary">
            <i className="fas fa-info-circle"></i>
            Learn More
          </a>
        </div>
      </div>
      
      <div className="hero-decoration">
        <div className="decoration-element element-1"></div>
        <div className="decoration-element element-2"></div>
        <div className="decoration-element element-3"></div>
      </div>
    </section>
  );
}

export default Hero;