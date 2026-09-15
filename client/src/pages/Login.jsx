import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoUsers = {
  admin: { email: 'admin@example.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  instructor: { email: 'instructor@example.com', password: 'instructor123', role: 'instructor', name: 'Instructor User' },
  student: { email: 'student@example.com', password: 'student123', role: 'student', name: 'Student User' },
};

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Try Firebase Authentication
      const loggedUser = await loginUser(form.email, form.password);
      const redirectPath = loggedUser.role === 'admin'
        ? '/admin-dashboard'
        : loggedUser.role === 'instructor'
          ? '/instructor-dashboard'
          : '/student-dashboard';
      navigate(redirectPath);
    } catch (err) {
      // 2. Fallback check for demo static accounts
      const matchedUser = Object.values(demoUsers).find(
        (user) => user.email === form.email && user.password === form.password
      );

      if (matchedUser) {
        setUser(matchedUser);
        const redirectPath = matchedUser.role === 'admin'
          ? '/admin-dashboard'
          : matchedUser.role === 'instructor'
            ? '/instructor-dashboard'
            : '/student-dashboard';
        navigate(redirectPath);
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (roleKey) => {
    const demo = demoUsers[roleKey];
    setForm({ email: demo.email, password: demo.password });
  };

  const handleForgotPassword = async () => {
    const resetEmail = form.email.trim().toLowerCase();

    if (!resetEmail) {
      setError('Enter your email to reset your password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to process reset request');

      setError('');
      setForm((prev) => ({ ...prev, password: '' }));
      sessionStorage.setItem('pending_reset_token', data.resetToken);
      navigate('/reset-password');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: '450px', margin: '2rem auto' }}>
      <h2>Log In</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Access your Course Management</p>

      {successMessage && (
        <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          ✅ {successMessage}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
          <input 
            type="email" 
            placeholder="user@example.com" 
            value={form.email} 
            onChange={(e) => setForm({ ...form, email: e.target.value })} 
            required 
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
            />
            <button type="button" className="btn btn-secondary" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Quick Demo Accounts:</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => handleDemoClick('student')}>Student Demo</button>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => handleDemoClick('instructor')}>Instructor Demo</button>
          <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => handleDemoClick('admin')}>Admin Demo</button>
        </div>
      </div>

      <p style={{ marginTop: '0.5rem', textAlign: 'center' }}>
        <button type="button" className="btn btn-link" onClick={handleForgotPassword} style={{ color: '#2563eb', fontWeight: '500', padding: 0 }}>Forgot password?</button>
      </p>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: '500' }}>Register Here</Link>
      </p>
    </div>
  );
}

