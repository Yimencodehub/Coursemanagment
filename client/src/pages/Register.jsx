import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    employeeId: '',
    employeeEmail: '',
    organizationName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.role === 'instructor') {
      if (!form.employeeId || !form.employeeEmail || !form.organizationName) {
        setError('Please fill in instructor details (Employee ID, Employee Email, Organization Name).');
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Register with AuthContext (localStorage / Auth)
      await registerUser(form.name, form.email, form.password, form.role);

      // 2. Additional data in Cloud Firestore if instructor
      const cleanEmail = form.email.trim().toLowerCase();
      try {
        const payload = {
          name: form.name.trim(),
          email: cleanEmail,
          role: form.role,
          active: true,
          createdAt: new Date().toISOString(),
          ...(form.role === 'instructor' && {
            employeeId: form.employeeId.trim(),
            employeeEmail: form.employeeEmail.trim().toLowerCase(),
            organizationName: form.organizationName.trim(),
          }),
        };
        await setDoc(doc(db, 'users', cleanEmail), payload);
      } catch (fsErr) {
        console.warn('Firestore register instructor warning:', fsErr.message);
      }

      navigate('/login', {
        state: { message: 'Registration successful! Please log in with your credentials.' },
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: '480px', margin: '2rem auto' }}>
      <h2>Create an Account</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Register to join the Course Management System</p>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

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

        <div style={{ marginBottom: '1rem' }}>
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

        {/* Account Role: Only Student and Instructor allowed */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Account Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        {/* Conditional Instructor Fields */}
        {form.role === 'instructor' && (
          <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '0.95rem' }}>👨‍🏫 Instructor Details</h4>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: '500' }}>Employee ID</label>
              <input
                type="text"
                placeholder="EMP-10293"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                required={form.role === 'instructor'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: '500' }}>Employee Email</label>
              <input
                type="email"
                placeholder="instructor.work@org.com"
                value={form.employeeEmail}
                onChange={(e) => setForm({ ...form, employeeEmail: e.target.value })}
                required={form.role === 'instructor'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: '500' }}>Organization Name</label>
              <input
                type="text"
                placeholder="Highland Education Center"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                required={form.role === 'instructor'}
              />
            </div>
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Saving User to DB...' : 'Register Account'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Already registered? <Link to="/login" style={{ color: '#2563eb', fontWeight: '500' }}>Log In</Link>
      </p>
    </div>
  );
}
