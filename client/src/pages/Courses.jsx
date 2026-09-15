import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [newInstructor, setNewInstructor] = useState('');

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin';

  const loadCourses = async () => {
    const data = await api.getCourses();
    setCourses(data);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleDeleteCourse = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await api.deleteCourse(id);
      setMessage(`Course "${title}" deleted successfully.`);
      loadCourses();
    }
  };

  const handleAssignInstructor = async (id) => {
    if (!newInstructor.trim()) {
      setMessage('Please enter an instructor email.');
      return;
    }
    await api.assignInstructor(id, newInstructor.trim());
    setMessage(`Instructor updated for course.`);
    setAssigningId(null);
    setNewInstructor('');
    loadCourses();
  };

  const filteredCourses = courses.filter((course) =>
    [course.title, course.category, course.instructor, course.description]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="panel" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Courses</h1>
          <p style={{ color: '#666', margin: '0.25rem 0 0' }}>Search, view, edit, and manage courses.</p>
        </div>
        {isInstructorOrAdmin && (
          <Link to="/create-course" className="btn btn-primary">
            ➕ Add New Course
          </Link>
        )}
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', color: '#15803d', borderRadius: '0.5rem', marginBottom: '1.25rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {/* Search Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          value={search}
          placeholder="🔍 Search courses by title, instructor, description or category..."
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
        />
      </div>

      {/* Course List Grid */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {filteredCourses.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#64748b' }}>No courses found. Try a different search term.</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#fff' }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#0f172a' }}>{course.title}</h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{course.description}</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0' }}>
                  <strong>Instructor:</strong> {course.instructor || 'Unassigned'}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 1rem' }}>
                  <strong>Category:</strong> {course.category || 'General'}
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link to={`/courses/${course.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center', fontSize: '0.85rem' }}>
                    View Details
                  </Link>

                  {isInstructorOrAdmin && (
                    <>
                      <Link to={`/edit-course/${course.id}`} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                        ✏️ Edit
                      </Link>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        style={{ fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5' }}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                </div>

                {isInstructorOrAdmin && (
                  <div>
                    {assigningId === course.id ? (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <input
                          type="email"
                          placeholder="Instructor email"
                          value={newInstructor}
                          onChange={(e) => setNewInstructor(e.target.value)}
                          style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.85rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                        />
                        <button className="btn btn-primary" type="button" onClick={() => handleAssignInstructor(course.id)} style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}>
                          Save
                        </button>
                        <button className="btn btn-secondary" type="button" onClick={() => setAssigningId(null)} style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-link"
                        type="button"
                        onClick={() => { setAssigningId(course.id); setNewInstructor(course.instructor || ''); }}
                        style={{ fontSize: '0.8rem', color: '#2563eb', padding: 0, marginTop: '0.25rem' }}
                      >
                        🎓 Assign Instructor
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
