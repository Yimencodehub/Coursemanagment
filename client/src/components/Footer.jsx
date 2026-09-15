import { useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const SUBSCRIBER_STORAGE_KEY = 'app_subscribers';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // 1. Write to Firestore Database (Cloud Firestore collection: subscribers)
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: trimmedEmail,
        subscribedAt: new Date().toISOString(),
      });
    } catch (fsError) {
      console.warn('Firestore subscriber write warning:', fsError.message);
    }

    // 2. Write to Server API
    try {
      await fetch('http://localhost:5000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
    } catch {
      // ignore
    }

    // 3. Write to LocalStorage
    const stored = JSON.parse(localStorage.getItem(SUBSCRIBER_STORAGE_KEY) || '[]');
    const alreadyExists = stored.some((entry) => entry.email === trimmedEmail);
    if (!alreadyExists) {
      stored.push({ email: trimmedEmail, subscribedAt: new Date().toISOString() });
      localStorage.setItem(SUBSCRIBER_STORAGE_KEY, JSON.stringify(stored));
    }

    setMessage('✅ Thanks for subscribing!');
    setEmail('');
    setLoading(false);
  };

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo-badge">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">CourseHub</span>
            </div>
            <p className="footer-desc">
              Empowering learners worldwide with interactive courses, real-time tracking, and expert-led education management.
            </p>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Browse Courses</Link></li>
              <li><Link to="/login">Account Login</Link></li>
              <li><Link to="/register">Join Platform</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Learning Hub</h4>
            <ul>
              <li><Link to="/my-courses">My Enrolled Courses</Link></li>
              <li><Link to="/assignments">Assignments</Link></li>
              <li><Link to="/quizzes">Quizzes & Assessments</Link></li>
              <li><Link to="/profile">User Profile</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Stay Connected</h4>
            <p className="footer-subtext">Subscribe for top course recommendations and updates.</p>
            <form className="footer-newsletter" onSubmit={handleJoin}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join'}
              </button>
            </form>
            {message && <p style={{ marginTop: '0.5rem', color: message.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{message}</p>}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CourseHub LMS. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#support">Support</a>
            <Link to="/feedback">Feedback</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
