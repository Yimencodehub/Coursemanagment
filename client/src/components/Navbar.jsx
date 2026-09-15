import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="navbar-header">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-brand">Y.A CourseHub</span>
          </Link>

          <nav className="navbar-links">
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
            <Link to="/courses" className={`nav-item ${isActive('/courses') ? 'active' : ''}`}>
              Courses
            </Link>
            {isActive('/') && (
              <>
                <button
                  type="button"
                  className="nav-item nav-btn-link"
                  onClick={() => setShowAboutModal(true)}
                >
                  About Us
                </button>
                <button
                  type="button"
                  className="nav-item nav-btn-link"
                  onClick={() => setShowContactModal(true)}
                >
                  Contact Us
                </button>
              </>
            )}

            {user && (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'instructor' ? '/instructor-dashboard' : '/student-dashboard'}
                  className={`nav-item ${location.pathname.includes('dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link to="/my-courses" className={`nav-item ${isActive('/my-courses') ? 'active' : ''}`}>
                  My Learning
                </Link>
              </>
            )}
          </nav>

          <div className="navbar-actions">
            {user ? (
              <div className="user-profile-menu">
                <Link to="/profile" className="user-info">
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.name || user.email.split('@')[0]}</span>
                    <span className={`role-badge badge-${user.role || 'student'}`}>
                      {user.role || 'student'}
                    </span>
                  </div>
                </Link>
                <button className="btn btn-logout" onClick={logout} title="Sign Out">
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost">Log In</Link>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="custom-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2>ℹ️ About Us</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowAboutModal(false)}>✕</button>
            </div>
            <div className="custom-modal-body">
              <p>Welcome to <strong>CourseHub LMS</strong>! We are dedicated to providing world-class online learning management tools for students, instructors, and educational institutions.</p>
              <p>Our platform enables seamless course delivery, real-time assessment tracking, assignments, and interactive learning environments.</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Us Modal */}
      {showContactModal && (
        <div className="custom-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h2>📞 Contact Us</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowContactModal(false)}>✕</button>
            </div>
            <div className="custom-modal-body contact-details-list">
              <div className="contact-detail-item">
                <span className="contact-icon">📱</span>
                <div>
                  <strong>Phone:</strong>
                  <p>+251927735242</p>
                </div>
              </div>

              <div className="contact-detail-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <strong>Email:</strong>
                  <p><a href="mailto:yimenanmaw711@gmail.com">yimenanmaw711@gmail.com</a></p>
                </div>
              </div>

              <div className="contact-detail-item">
                <span className="contact-icon">✈️</span>
                <div>
                  <strong>Telegram:</strong>
                  <p><a href="https://t.me/yimen27" target="_blank" rel="noreferrer">t.me/yimen27</a></p>
                </div>
              </div>

              <div className="contact-detail-item">
                <span className="contact-icon">🎵</span>
                <div>
                  <strong>TikTok:</strong>
                  <p><a href="https://tiktok.com/@yimen211" target="_blank" rel="noreferrer">@yimen211</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
