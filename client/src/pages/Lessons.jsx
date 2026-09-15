import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LessonCard from '../components/LessonCard';

const STORAGE_KEY = 'app_lessons';
const PROGRESS_KEY = 'app_progress';

export default function Lessons() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', material: '', videoUrl: '' });
  const [message, setMessage] = useState('');
  const isInstructor = user?.role === 'instructor';

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setLessons(stored);
  }, []);

  const saveLessons = (next) => {
    setLessons(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setMessage('Please fill in the lesson title and description.');
      return;
    }

    const next = [{ id: Date.now(), ...form }, ...lessons];
    saveLessons(next);
    setForm({ title: '', description: '', material: '', videoUrl: '' });
    setMessage('Lesson published successfully.');
  };

  const handleComplete = (lessonId) => {
    const stored = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    const next = stored.filter((entry) => entry.lessonId !== lessonId);
    next.push({ lessonId, email: user?.email || 'student@example.com', completedAt: new Date().toISOString() });
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    setMessage('Lesson marked as completed.');
  };

  return (
    <div>
      <h1>{isInstructor ? 'Manage Lessons' : 'Lessons'}</h1>
      <p>{isInstructor ? 'Publish lessons and course materials for students.' : 'Watch lessons, open materials, and track your progress.'}</p>
      {message && <p style={{ color: '#2563eb' }}>{message}</p>}

      {isInstructor && (
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          <input value={form.title} placeholder="Lesson title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea value={form.description} placeholder="Lesson description" onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input value={form.material} placeholder="Material link or note" onChange={(e) => setForm({ ...form, material: e.target.value })} />
          <input value={form.videoUrl} placeholder="Video URL" onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          <button className="btn btn-primary" type="submit">Publish Lesson</button>
        </form>
      )}

      <div className="grid">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onOpen={setSelectedLesson} />
        ))}
      </div>

      {selectedLesson && (
        <div className="panel" style={{ marginTop: '1rem' }}>
          <h3>{selectedLesson.title}</h3>
          <p>{selectedLesson.description}</p>
          {selectedLesson.material && <p><strong>Material:</strong> {selectedLesson.material}</p>}
          {selectedLesson.videoUrl && <a href={selectedLesson.videoUrl} target="_blank" rel="noreferrer">Open video</a>}
          {!isInstructor && <button className="btn btn-secondary" type="button" onClick={() => handleComplete(selectedLesson.id)} style={{ marginTop: '0.5rem' }}>Mark as completed</button>}
        </div>
      )}
    </div>
  );
}
