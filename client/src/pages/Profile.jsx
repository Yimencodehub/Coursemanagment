import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', bio: '', phone: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
    setMessage('Profile updated successfully.');
  };

  return (
    <div className="panel" style={{ maxWidth: '700px' }}>
      <h1>My Profile</h1>
      <p>Update your profile details and keep your account information current.</p>

      {message && <p style={{ color: '#15803d' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label>Full name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label>Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label>Bio</label>
          <textarea rows="4" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div>
          <strong>Current role:</strong> {user?.role || 'student'}
        </div>
        <button className="btn btn-primary" type="submit">Save changes</button>
      </form>
    </div>
  );
}
