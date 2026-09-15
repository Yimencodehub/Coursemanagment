import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CourseCard({ course }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const handleEnroll = async () => {
    if (!user?.email) {
      setMessage('Please log in to enroll in a course.');
      return;
    }

    await api.enrollCourse(course.id, user.email);
    setMessage('Enrollment saved successfully.');
  };

  return (
    <div className="panel" style={{ marginBottom: '1rem' }}>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <p><strong>Instructor:</strong> {course.instructor}</p>
      <p><strong>Category:</strong> {course.category}</p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link className="btn btn-primary" to={`/courses/${course.id}`}>View Details</Link>
        <button className="btn btn-secondary" type="button" onClick={handleEnroll}>Enroll</button>
      </div>
      {message && <p style={{ marginTop: '0.75rem', color: '#2563eb' }}>{message}</p>}
    </div>
  );
}
