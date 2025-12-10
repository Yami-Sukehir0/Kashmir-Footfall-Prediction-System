import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Dr. Farooq Ahmad",
      role: "Chief Tourism Officer",
      bio: "20+ years of experience in Kashmir tourism development and policy making.",
      image: "/placeholder-team.jpg",
    },
    {
      name: "Ms. Tanvi Sharma",
      role: "Data Science Lead",
      bio: "Expert in predictive analytics and machine learning for tourism applications.",
      image: "/placeholder-team.jpg",
    },
    {
      name: "Mr. Riyaz Ahmad",
      role: "Technology Director",
      bio: "Specializes in digital transformation for government tourism departments.",
      image: "/placeholder-team.jpg",
    },
  ];

  const achievements = [
    {
      icon: "fas fa-chart-line",
      value: "25%",
      description: "Average increase in tourist footfall after implementation",
    },
    {
      icon: "fas fa-rupee-sign",
      value: "₹1.2 Cr",
      description: "Annual cost savings through optimized resource allocation",
    },
    {
      icon: "fas fa-users",
      value: "10",
      description: "Major tourist locations covered",
    },
    {
      icon: "fas fa-star",
      value: "4.8/5",
      description: "User satisfaction rating from tourism officials",
    },
  ];

  return (
    <div className="about-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transforming Kashmir's Tourism with AI
            </h1>
            <p className="hero-subtitle">
              Empowering the Kashmir Tourism Department with cutting-edge
              technology for sustainable growth
            </p>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2 className="section-title">Our Mission</h2>
              <p className="mission-description">
                We are committed to revolutionizing tourism management in
                Kashmir through artificial intelligence and data-driven
                insights. Our platform helps the Tourism Department make
                informed decisions, optimize resources, and enhance visitor
                experiences while preserving the natural beauty of Kashmir.
              </p>
              <div className="mission-points">
                <div className="point">
                  <i className="fas fa-check-circle"></i>
                  <span>Predictive analytics for better planning</span>
                </div>
                <div className="point">
                  <i className="fas fa-check-circle"></i>
                  <span>Real-time resource optimization</span>
                </div>
                <div className="point">
                  <i className="fas fa-check-circle"></i>
                  <span>Sustainable tourism development</span>
                </div>
                <div className="point">
                  <i className="fas fa-check-circle"></i>
                  <span>Data-driven policy making</span>
                </div>
              </div>
            </div>
            <div className="mission-image">
              <img src="/placeholder-about.jpg" alt="Kashmir Tourism" />
            </div>
          </div>
        </div>
      </section>

      <section className="achievements-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Achievements</h2>
            <p className="section-subtitle">
              Measurable impact of our platform on Kashmir's tourism sector
            </p>
          </div>

          <div className="achievements-grid">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="achievement-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="achievement-icon">
                  <i className={achievement.icon}></i>
                </div>
                <div className="achievement-value">{achievement.value}</div>
                <div className="achievement-description">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Leadership Team</h2>
            <p className="section-subtitle">
              Experts dedicated to advancing Kashmir's tourism through
              technology
            </p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="team-member"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <div className="member-role">{member.role}</div>
                  <p className="member-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="technology-section">
        <div className="container">
          <div className="tech-content">
            <div className="tech-text">
              <h2 className="section-title">Powered by Advanced Technology</h2>
              <p className="tech-description">
                Our platform leverages state-of-the-art machine learning
                algorithms, real-time data processing, and intuitive
                visualization tools to provide actionable insights for tourism
                management.
              </p>
              <ul className="tech-features">
                <li>
                  <i className="fas fa-microchip"></i>
                  <span>
                    XGBoost and Random Forest models for accurate predictions
                  </span>
                </li>
                <li>
                  <i className="fas fa-cloud"></i>
                  <span>
                    Cloud-native architecture for scalability and reliability
                  </span>
                </li>
                <li>
                  <i className="fas fa-shield-alt"></i>
                  <span>Enterprise-grade security and data protection</span>
                </li>
                <li>
                  <i className="fas fa-mobile-alt"></i>
                  <span>Fully responsive design for all devices</span>
                </li>
              </ul>
            </div>
            <div className="tech-image">
              <img src="/placeholder-tech.jpg" alt="Technology" />
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Kashmir's Tourism?</h2>
            <p className="cta-subtitle">
              Join us in creating a sustainable and prosperous future for
              Kashmir's tourism industry
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

export default AboutPage;
