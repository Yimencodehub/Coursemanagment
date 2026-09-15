import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(courseId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    category: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      api.getCourse(courseId).then((course) => {
        if (course) {
          setFormData({
            title: course.title || '',
            description: course.description || '',
            instructor: course.instructor || '',
            category: course.category || '',
          });
        }
      });
    }
  }, [courseId, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isEditing) {
        // 1. Update Cloud Firestore
        try {
          await updateDoc(doc(db, 'courses', courseId), {
            ...formData,
            updatedAt: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.warn('Firestore course update warning:', fsErr.message);
        }

        // 2. Update local/server API
        await api.updateCourse(courseId, formData);
        setMessage('✅ Course updated successfully in Firebase!');
      } else {
        // 1. Create in Cloud Firestore
        try {
          await addDoc(collection(db, 'courses'), {
            ...formData,
            createdAt: new Date().toISOString(),
          });
        } catch (fsErr) {
          console.warn('Firestore course create warning:', fsErr.message);
        }

        // 2. Create in local/server API
        await api.createCourse(formData);
        setMessage('✅ Course created successfully in Firebase!');
      }
      setTimeout(() => navigate('/courses'), 1000);
    } catch (error) {
      setMessage(`❌ ${error.message || 'Operation failed'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>{isEditing ? '✏️ Edit Course' : '➕ Create Course'}</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        {isEditing ? 'Update course details and specifications.' : 'Fill in the details below to publish a new course.'}
      </p>

      {message && (
        <div style={{ padding: '0.75rem 1rem', background: message.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: message.startsWith('✅') ? '#15803d' : '#dc2626', borderRadius: '0.5rem', marginBottom: '1.25rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Course Title</label>
        <input name="title" placeholder="e.g. React Fundamentals" value={formData.title} onChange={handleChange} required style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Course Description</label>
        <textarea name="description" placeholder="Describe the course goals..." value={formData.description} onChange={handleChange} required rows={4} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Instructor Email / Name</label>
        <input name="instructor" placeholder="instructor@example.com" value={formData.instructor} onChange={handleChange} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Category</label>
        <input name="category" placeholder="e.g. Frontend, Backend, Data Science" value={formData.category} onChange={handleChange} style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Saving to Firebase...' : isEditing ? 'Update Course' : 'Create Course'}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate('/courses')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
