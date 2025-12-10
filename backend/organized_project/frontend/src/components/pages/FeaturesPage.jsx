import React from "react";
import "./FeaturesPage.css";

const FeaturesPage = () => {
  const features = [
    {
      icon: "fas fa-brain",
      title: "AI-Powered Predictions",
      description:
        "Advanced machine learning algorithms predict tourist footfall with 85% accuracy using weather, holiday, and historical data.",
    },
    {
      icon: "fas fa-chart-line",
      title: "Resource Planning",
      description:
        "Automatically calculate optimal staff, transport, and accommodation requirements based on predicted visitor numbers.",
    },
    {
      icon: "fas fa-map-marked-alt",
      title: "Interactive Heatmaps",
      description:
        "Visualize tourist distribution across locations and time periods with interactive heatmaps for better decision-making.",
    },
    {
      icon: "fas fa-bell",
      title: "Real-Time Alerts",
      description:
        "Receive notifications for unusual traffic patterns, weather events, or capacity thresholds.",
    },
    {
      icon: "fas fa-database",
      title: "Historical Analytics",
      description:
        "Access comprehensive reports and trend analysis to identify patterns and inform strategic decisions.",
    },
    {
      icon: "fas fa-mobile-alt",
      title: "Mobile Responsive",
      description:
        "Fully responsive design works seamlessly across all devices from desktops to smartphones.",
    },
  ];

  const benefits = [
    {
      icon: "fas fa-rupee-sign",
      title: "Cost Optimization",
      description:
        "Reduce operational costs by 20% through precise resource allocation based on accurate predictions.",
    },
    {
      icon: "fas fa-user-friends",
      title: "Visitor Experience",
      description:
        "Improve tourist satisfaction with better crowd management and resource availability.",
    },
    {
      icon: "fas fa-shield-alt",
      title: "Risk Management",
      description:
        "Proactively manage capacity and safety concerns with predictive analytics.",
    },
    {
      icon: "fas fa-lightbulb",
      title: "Data-Driven Decisions",
      description:
        "Make informed policy and investment decisions backed by comprehensive data insights.",
    },
  ];

  return (
    <div className="features-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Powerful Features for Smart Tourism Management
            </h1>
            <p className="hero-subtitle">
              Our platform combines cutting-edge AI technology with deep tourism
              expertise to help you make smarter decisions
            </p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Core Features</h2>
            <p className="section-subtitle">
              Everything you need to manage and optimize Kashmir's tourism
              resources
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Key Benefits</h2>
            <p className="section-subtitle">
              How our platform transforms tourism management for the Kashmir
              Tourism Department
            </p>
          </div>

          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="benefit-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="benefit-icon">
                  <i className={benefit.icon}></i>
                </div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Transform Your Tourism Management?
            </h2>
            <p className="cta-subtitle">
              Join other forward-thinking tourism departments using our platform
              to optimize resources and enhance visitor experiences.
            </p>
            <div className="cta-buttons">
              <a href="/auth/login" className="btn btn-primary">
                <i className="fas fa-sign-in-alt"></i>
                Access Admin Portal
              </a>
              <a href="/" className="btn btn-secondary">
                <i className="fas fa-home"></i>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
