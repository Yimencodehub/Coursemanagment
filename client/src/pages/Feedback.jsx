import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function Feedback() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!message.trim()) {
      setError('Please enter your feedback message.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        name: name.trim() || 'Anonymous',
        email: email.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
      setSuccess('Thank you for your feedback! It has been submitted successfully.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>Submit Feedback</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        We value your feedback. Please let us know how we can improve our system.
      </p>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name (Optional)</label>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email (Optional)</label>
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Feedback Message *</label>
          <textarea
            rows="5"
            placeholder="Enter your feedback here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
          ></textarea>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
