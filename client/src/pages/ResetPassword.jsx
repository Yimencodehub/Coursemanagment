import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = sessionStorage.getItem('pending_reset_token') || '';
    setToken(storedToken);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('No reset token was found. Please start the reset process again.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to reset password');

      sessionStorage.removeItem('pending_reset_token');
      setMessage('Password updated successfully. You can log in with your new password.');
      setTimeout(() => navigate('/login', { state: { message: 'Password updated successfully. Please sign in.' } }), 1200);
    } catch (err) {
      setError(err.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: '460px', margin: '2rem auto' }}>
      <h2>Reset Password</h2>
      <p style={{ color: '#666', marginBottom: '1.25rem' }}>Enter the reset token and your new password.</p>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Reset Token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your reset token" required />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>New Password</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required />
            <button type="button" className="btn btn-secondary" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Confirm Password</label>
          <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Updating...' : 'Reset Password'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/login" style={{ color: '#2563eb', fontWeight: '500' }}>Back to Login</Link>
      </p>
    </div>
  );
}
