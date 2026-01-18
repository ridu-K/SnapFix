import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  Droplet, 
  Zap, 
  TreeDeciduous, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Shield
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <Shield size={32} />
              <span>Complaint Bridge</span>
            </div>
            <div className="nav-links">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Report Public Issues.<br />
              Track Solutions.<br />
              <span className="highlight">Build Better Communities.</span>
            </h1>
            <p className="hero-subtitle">
              A centralized platform connecting citizens with authorities to resolve 
              public infrastructure issues efficiently and transparently.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-large">
                Register Now
              </Link>
              <Link to="/login" className="btn-1">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-card">
              <div className="floating-card card-1">
                <AlertCircle size={24} color="#ef4444" />
                <span>Road Accident Reported</span>
              </div>
              <div className="floating-card card-2">
                <Droplet size={24} color="#3b82f6" />
                <span>Water Leakage Fixed</span>
              </div>
              <div className="floating-card card-3">
                <TreeDeciduous size={24} color="#10b981" />
                <span>Fallen Tree Cleared</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Complaint Bridge?</h2>
          <p className="section-subtitle">
            A comprehensive solution for modern complaint management
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <AlertCircle size={32} />
              </div>
              <h3>Easy Reporting</h3>
              <p>Submit complaints instantly with photos, location, and detailed descriptions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={32} />
              </div>
              <h3>Real-Time Tracking</h3>
              <p>Monitor your complaint status from submission to resolution in real-time.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Efficient Assignment</h3>
              <p>Automated assignment to appropriate workers based on complaint category.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <CheckCircle size={32} />
              </div>
              <h3>Transparent Process</h3>
              <p>Complete visibility into complaint handling with update notifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2 className="section-title">What Can You Report?</h2>
          
          <div className="categories-grid">
            <div className="category-card">
              <AlertCircle size={40} color="#ef4444" />
              <h3>Road Accidents</h3>
              <p>Vehicle collisions, damaged roads, traffic hazards</p>
            </div>

            <div className="category-card">
              <Droplet size={40} color="#3b82f6" />
              <h3>Water Issues</h3>
              <p>Pipeline leaks, water supply problems, drainage issues</p>
            </div>

            <div className="category-card">
              <TreeDeciduous size={40} color="#10b981" />
              <h3>Tree & Pole Damage</h3>
              <p>Fallen trees, damaged electric poles, broken structures</p>
            </div>

            <div className="category-card">
              <Zap size={40} color="#f59e0b" />
              <h3>Electrical Issues</h3>
              <p>Power outages, damaged lines, street light problems</p>
            </div>

            <div className="category-card">
              <Shield size={40} color="#8b5cf6" />
              <h3>Infrastructure</h3>
              <p>Broken benches, damaged footpaths, public property issues</p>
            </div>

            <div className="category-card">
              <CheckCircle size={40} color="#06b6d4" />
              <h3>And More...</h3>
              <p>Any public service related issue in your area</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register & Login</h3>
              <p>Create your account and access the platform</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Submit Complaint</h3>
              <p>Report issues with photos and location details</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Track Progress</h3>
              <p>Monitor status updates and resolution progress</p>
            </div>

            <div className="step-arrow">→</div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Issue Resolved</h3>
              <p>Get notified when your complaint is completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Make a Difference?</h2>
            <p>Join thousands of citizens working together to build better communities</p>
            <Link to="/register" className="btn btn-primary btn-large">
              Start Reporting Today
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <Shield size={28} />
                <span>Complaint Bridge</span>
              </div>
              <p>Connecting citizens with authorities for efficient public service management.</p>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact</h4>
              <p>Email: support@complaintbridge.com</p>
              <p>Phone: +91 1234567890</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Complaint Bridge Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
