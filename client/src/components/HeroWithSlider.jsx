import React from "react";
import { Link } from "react-router-dom";
import { ImagesSlider } from "./ui/images-slider";
import "./Hero.css";

function HeroWithSlider() {
  // Kashmir tourism images
  const images = [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  return (
    <ImagesSlider
      className="hero-slider"
      images={images}
      overlay={true}
      overlayClassName="hero-slider-overlay"
    >
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
          <br />
          and make data-driven decisions for Kashmir tourism
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
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-chart-line"></i>
            Make Prediction
          </Link>
          <Link to="/features" className="btn btn-secondary">
            <i className="fas fa-info-circle"></i>
            Learn More
          </Link>
          <Link to="/auth/login" className="btn btn-accent">
            <i className="fas fa-sign-in-alt"></i>
            Admin Access
          </Link>
        </div>
      </div>
    </ImagesSlider>
  );
}

export default HeroWithSlider;
