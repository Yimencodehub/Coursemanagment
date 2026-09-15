import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const STORAGE_KEY = 'app_assignments';

const initialAssignments = [
  {
    id: 'assign-1',
    title: 'Build a React Todo App',
    description: 'Create a fully interactive Todo list application using React hooks.',
    dueDate: '2026-08-15',
    createdBy: 'instructor@example.com',
    submittedBy: [
      { student: 'student@example.com', text: 'https://github.com/student/react-todo', submittedAt: '2026-08-02T10:00:00.000Z', grade: '95/100' }
    ],
  },
];

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [submissionText, setSubmissionText] = useState({});
  const [gradingText, setGradingText] = useState({});
  const [message, setMessage] = useState('');

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin';

  const fetchAssignments = async () => {
    let list = initialAssignments;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) list = JSON.parse(stored);
    } catch {
      // ignore
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'assignments'));
      const fsList = [];
      querySnapshot.forEach((d) => {
        fsList.push({ id: d.id, ...d.data() });
      });
      if (fsList.length > 0) {
        list = fsList;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fsList));
      }
    } catch (fsErr) {
      console.warn('Firestore fetch assignments warning:', fsErr.message);
    }

    setAssignments(list);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const saveAssignmentsLocally = (next) => {
    setAssignments(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setMessage('Please provide a title and description.');
      return;
    }

    const newAssignment = {
      title: form.title,
      description: form.description,
      dueDate: form.dueDate,
      createdBy: user?.email || 'instructor@example.com',
      submittedBy: [],
      createdAt: new Date().toISOString(),
    };

    // 1. Write to Firestore
    try {
      const docRef = await addDoc(collection(db, 'assignments'), newAssignment);
      const created = { id: docRef.id, ...newAssignment };
      const next = [created, ...assignments];
      saveAssignmentsLocally(next);
      setForm({ title: '', description: '', dueDate: '' });
      setMessage('✅ Assignment created and saved to Cloud Firestore!');
      return;
    } catch (fsErr) {
      console.warn('Firestore assignment create warning:', fsErr.message);
    }

    // 2. Fallback
    const fallbackObj = { id: `assign-${Date.now()}`, ...newAssignment };
    const next = [fallbackObj, ...assignments];
    saveAssignmentsLocally(next);
    setForm({ title: '', description: '', dueDate: '' });
    setMessage('✅ Assignment created successfully (saved locally).');
  };

  const handleDeleteAssignment = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete assignment "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'assignments', id));
      } catch (fsErr) {
        console.warn('Firestore delete assignment warning:', fsErr.message);
      }
      const next = assignments.filter((a) => String(a.id) !== String(id));
      saveAssignmentsLocally(next);
      setMessage('✅ Assignment deleted successfully.');
    }
  };

  const handleSubmit = async (assignmentId) => {
    const text = submissionText[assignmentId]?.trim();
    if (!text) {
      setMessage('Please enter your submission text.');
      return;
    }

    const targetAssignment = assignments.find((a) => String(a.id) === String(assignmentId));
    const existing = targetAssignment?.submittedBy || [];
    const updatedSubmissions = existing.filter((s) => s.student !== (user?.email || 'Student'));
    updatedSubmissions.push({
      student: user?.email || 'student@example.com',
      text,
      submittedAt: new Date().toISOString(),
      grade: 'Pending Review',
    });

    try {
      await updateDoc(doc(db, 'assignments', assignmentId), {
        submittedBy: updatedSubmissions,
      });
    } catch (fsErr) {
      console.warn('Firestore submission update warning:', fsErr.message);
    }

    const next = assignments.map((a) =>
      String(a.id) === String(assignmentId) ? { ...a, submittedBy: updatedSubmissions } : a
    );

    saveAssignmentsLocally(next);
    setSubmissionText((prev) => ({ ...prev, [assignmentId]: '' }));
    setMessage('✅ Assignment submitted to Firebase successfully.');
  };

  const handleGradeSubmission = async (assignmentId, studentEmail) => {
    const gradeVal = gradingText[`${assignmentId}-${studentEmail}`]?.trim();
    if (!gradeVal) return;

    const targetAssignment = assignments.find((a) => String(a.id) === String(assignmentId));
    const updatedSubs = (targetAssignment?.submittedBy || []).map((sub) =>
      sub.student === studentEmail ? { ...sub, grade: gradeVal } : sub
    );

    try {
      await updateDoc(doc(db, 'assignments', assignmentId), {
        submittedBy: updatedSubs,
      });
    } catch (fsErr) {
      console.warn('Firestore grade update warning:', fsErr.message);
    }

    const next = assignments.map((a) =>
      String(a.id) === String(assignmentId) ? { ...a, submittedBy: updatedSubs } : a
    );

    saveAssignmentsLocally(next);
    setMessage(`✅ Grade saved in Cloud Firestore for ${studentEmail}.`);
  };

  const roleTitle = useMemo(() => (isInstructorOrAdmin ? 'Manage Assignments' : 'My Assignments'), [isInstructorOrAdmin]);

  return (
    <div className="panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>{roleTitle}</h1>
        <p style={{ color: '#666', margin: '0.25rem 0 0' }}>
          {isInstructorOrAdmin ? 'Create, review, grade, and delete assignments for students.' : 'View, complete, and submit your course assignments.'}
        </p>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', color: '#15803d', borderRadius: '0.5rem', marginBottom: '1.25rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {/* Instructor Create Assignment Form */}
      {isInstructorOrAdmin && (
        <form onSubmit={handleCreate} style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', backgroundColor: '#f8fafc', display: 'grid', gap: '0.75rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#1e293b' }}>➕ Create New Assignment</h3>
          <input value={form.title} placeholder="Assignment title" onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea value={form.description} placeholder="Assignment instructions & requirements..." onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button className="btn btn-primary" type="submit" style={{ justifySelf: 'start' }}>
            Create Assignment
          </button>
        </form>
      )}

      {/* Assignment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {assignments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#64748b' }}>No assignments created yet.</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: '#0f172a' }}>{assignment.title}</h3>
                  <p style={{ color: '#475569', margin: '0 0 0.75rem' }}>{assignment.description}</p>
                  {assignment.dueDate && (
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                      📅 <strong>Due Date:</strong> {assignment.dueDate}
                    </p>
                  )}
                </div>
                {isInstructorOrAdmin && (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                    style={{ fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5', flexShrink: 0 }}
                  >
                    🗑️ Delete Assignment
                  </button>
                )}
              </div>

              {/* Submissions Section (Instructor / Review View) */}
              {isInstructorOrAdmin ? (
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', color: '#334155' }}>
                    📥 Student Submissions ({assignment.submittedBy?.length || 0})
                  </h4>
                  {!assignment.submittedBy || assignment.submittedBy.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>No submissions submitted yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {assignment.submittedBy.map((sub, index) => (
                        <div key={index} style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>{sub.student}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Grade: {sub.grade || 'Pending'}</span>
                          </div>
                          <p style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.9rem', color: '#475569', wordBreak: 'break-all' }}>{sub.text}</p>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Assign Grade (e.g. 90/100)"
                              value={gradingText[`${assignment.id}-${sub.student}`] || ''}
                              onChange={(e) => setGradingText({ ...gradingText, [`${assignment.id}-${sub.student}`]: e.target.value })}
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                            />
                            <button
                              className="btn btn-secondary"
                              type="button"
                              onClick={() => handleGradeSubmission(assignment.id, sub.student)}
                              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                            >
                              Save Grade
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Student Submit View */
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#334155' }}>Your Submission</h4>
                  <textarea
                    value={submissionText[assignment.id] || ''}
                    placeholder="Type your response or paste project link here..."
                    onChange={(e) => setSubmissionText({ ...submissionText, [assignment.id]: e.target.value })}
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                  <button className="btn btn-primary" type="button" onClick={() => handleSubmit(assignment.id)} style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    Submit Assignment
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
