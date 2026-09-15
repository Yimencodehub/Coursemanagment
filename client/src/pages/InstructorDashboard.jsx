import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function InstructorDashboard() {
  const [activeSection, setActiveSection] = useState('courses');

  return (
    <div style={{ display: 'flex', gap: '1.5rem', minHeight: '60vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          flexShrink: 0,
          background: 'linear-gradient(160deg, #064e3b 0%, #059669 100%)',
          borderRadius: '1rem',
          padding: '1.5rem 1rem',
          color: '#fff',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', opacity: 0.95 }}>
          Instructor Panel
        </h2>
        <nav>
          <button
            type="button"
            onClick={() => setActiveSection('courses')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 0.85rem',
              marginBottom: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeSection === 'courses' ? 700 : 500,
              background: activeSection === 'courses' ? 'rgba(255,255,255,0.25)' : 'transparent',
              color: '#fff',
              fontSize: '0.95rem',
            }}
          >
            📚 Manage Courses
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('assignments')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 0.85rem',
              marginBottom: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeSection === 'assignments' ? 700 : 500,
              background: activeSection === 'assignments' ? 'rgba(255,255,255,0.25)' : 'transparent',
              color: '#fff',
              fontSize: '0.95rem',
            }}
          >
            📝 Manage Assignments
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('quizzes')}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '0.75rem 0.85rem',
              marginBottom: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeSection === 'quizzes' ? 700 : 500,
              background: activeSection === 'quizzes' ? 'rgba(255,255,255,0.25)' : 'transparent',
              color: '#fff',
              fontSize: '0.95rem',
            }}
          >
            ❓ Manage Quizzes
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="panel" style={{ flex: 1 }}>
        <h1 style={{ marginBottom: '0.25rem' }}>Instructor Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Manage your learning content, assignments, and quizzes.
        </p>

        {/* ── MANAGE COURSES ──────────────────────────────────── */}
        {activeSection === 'courses' && (
          <div>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#064e3b', fontSize: '1.15rem' }}>
                📚 Manage Courses
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: '2.1', fontSize: '0.95rem', color: '#334155' }}>
                <li>View All Courses</li>
                <li>Search Courses</li>
                <li>View Course Details</li>
                <li>Edit Course</li>
                <li>Delete Course</li>
                <li>Assign Instructor</li>
              </ul>
            </div>

            <div className="grid">
              <div className="card">
                <h3>📋 View & Search Courses</h3>
                <p>Browse, view details, search, and manage your courses.</p>
                <Link to="/courses">
                  <button className="btn btn-primary" type="button" style={{ marginTop: '0.75rem' }}>
                    Go to Courses
                  </button>
                </Link>
              </div>
              <div className="card">
                <h3>➕ Create New Course</h3>
                <p>Add fresh lessons and learning materials.</p>
                <Link to="/create-course">
                  <button className="btn btn-secondary" type="button" style={{ marginTop: '0.75rem' }}>
                    Add Course
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── MANAGE ASSIGNMENTS ──────────────────────────────── */}
        {activeSection === 'assignments' && (
          <div>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#064e3b', fontSize: '1.15rem' }}>
                📝 Manage Assignments
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: '2.1', fontSize: '0.95rem', color: '#334155' }}>
                <li>View Assignments</li>
                <li>Delete / Review Assignments</li>
              </ul>
            </div>

            <div className="grid">
              <div className="card">
                <h3>📝 View & Review Assignments</h3>
                <p>Review student submissions and manage assignment lists.</p>
                <Link to="/assignments">
                  <button className="btn btn-primary" type="button" style={{ marginTop: '0.75rem' }}>
                    Go to Assignments
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── MANAGE QUIZZES ───────────────────────────────────── */}
        {activeSection === 'quizzes' && (
          <div>
            <div
              style={{
                padding: '1.25rem 1.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#064e3b', fontSize: '1.15rem' }}>
                ❓ Manage Quizzes
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, lineHeight: '2.1', fontSize: '0.95rem', color: '#334155' }}>
                <li>View Quizzes</li>
                <li>Delete / Review Quizzes</li>
              </ul>
            </div>

            <div className="grid">
              <div className="card">
                <h3>❓ View & Manage Quizzes</h3>
                <p>Inspect student quiz attempts and maintain question sets.</p>
                <Link to="/quizzes">
                  <button className="btn btn-primary" type="button" style={{ marginTop: '0.75rem' }}>
                    Go to Quizzes
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
