import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const QUIZ_STORAGE_KEY = 'app_quizzes';
const ATTEMPT_STORAGE_KEY = 'app_quiz_attempts';

const initialQuizzes = [
  {
    id: 'quiz-1',
    title: 'React & JavaScript Core Quiz',
    createdBy: 'instructor@example.com',
    questions: [
      {
        question: 'What hook is used for state in functional components?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 'useState',
      },
      {
        question: 'What is 2 + 2 in JavaScript?',
        options: ['3', '4', '5', '22'],
        correctAnswer: '4',
      },
    ],
  },
];

export default function Quizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [form, setForm] = useState({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }] });
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isInstructorOrAdmin = user?.role === 'instructor' || user?.role === 'admin';

  const readLocalQuizzes = () => {
    try {
      const stored = localStorage.getItem(QUIZ_STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialQuizzes;
    } catch {
      return initialQuizzes;
    }
  };

  const readLocalAttempts = () => {
    try {
      const stored = localStorage.getItem(ATTEMPT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveLocalQuizzes = (list) => {
    setQuizzes(list);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(list));
  };

  const saveLocalAttempts = (list) => {
    setAttempts(list);
    localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(list));
  };

  const fetchData = async () => {
    let loadedQuizzes = readLocalQuizzes();
    let loadedAttempts = readLocalAttempts();

    // Fetch from Firebase Cloud Firestore
    try {
      const quizSnapshot = await getDocs(collection(db, 'quizzes'));
      const fsQuizzes = [];
      quizSnapshot.forEach((d) => {
        fsQuizzes.push({ id: d.id, ...d.data() });
      });
      if (fsQuizzes.length > 0) {
        loadedQuizzes = fsQuizzes;
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(fsQuizzes));
      }
    } catch (fsErr) {
      console.warn('Firestore fetch quizzes warning:', fsErr.message);
    }

    try {
      const attemptSnapshot = await getDocs(collection(db, 'quizAttempts'));
      const fsAttempts = [];
      attemptSnapshot.forEach((d) => {
        fsAttempts.push({ id: d.id, ...d.data() });
      });
      if (fsAttempts.length > 0) {
        loadedAttempts = fsAttempts;
        localStorage.setItem(ATTEMPT_STORAGE_KEY, JSON.stringify(fsAttempts));
      }
    } catch (fsErr) {
      console.warn('Firestore fetch quiz attempts warning:', fsErr.message);
    }

    setQuizzes(loadedQuizzes);
    setAttempts(loadedAttempts);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateQuestion = (index, field, value) => {
    const nextQuestions = [...form.questions];
    nextQuestions[index] = { ...nextQuestions[index], [field]: value };
    setForm({ ...form, questions: nextQuestions });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const nextQuestions = [...form.questions];
    const options = [...(nextQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    nextQuestions[questionIndex] = { ...nextQuestions[questionIndex], options };
    setForm({ ...form, questions: nextQuestions });
  };

  const addQuestion = () => {
    setForm({
      ...form,
      questions: [...form.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }],
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const newQuizObj = {
      title: form.title,
      createdBy: user?.email || 'instructor@example.com',
      questions: form.questions,
      createdAt: new Date().toISOString(),
    };

    // 1. Write to Firebase Cloud Firestore 'quizzes' collection
    try {
      const docRef = await addDoc(collection(db, 'quizzes'), newQuizObj);
      const createdQuiz = { id: docRef.id, ...newQuizObj };
      const nextList = [createdQuiz, ...quizzes];
      saveLocalQuizzes(nextList);
      setForm({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }] });
      setMessage('✅ Quiz created and saved to Cloud Firestore successfully.');
      setLoading(false);
      return;
    } catch (fsErr) {
      console.warn('Firestore quiz create warning:', fsErr.message);
    }

    // 2. Fallback to localStorage if Firebase fails
    const fallbackQuiz = { id: `quiz-${Date.now()}`, ...newQuizObj };
    const nextList = [fallbackQuiz, ...quizzes];
    saveLocalQuizzes(nextList);
    setForm({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }] });
    setMessage('✅ Quiz created successfully (saved locally).');
    setLoading(false);
  };

  const handleDeleteQuiz = async (quizId, title) => {
    if (window.confirm(`Are you sure you want to delete quiz "${title}"?`)) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
      } catch (fsErr) {
        console.warn('Firestore delete quiz warning:', fsErr.message);
      }
      const next = quizzes.filter((q) => String(q.id) !== String(quizId));
      saveLocalQuizzes(next);
      setMessage(`✅ Quiz "${title}" deleted successfully.`);
    }
  };

  const handleSubmitAttempt = async (quizId) => {
    const quizObj = quizzes.find((q) => String(q.id) === String(quizId));
    const studentAnswerList = (quizObj?.questions || []).map((_, index) => ({
      answer: answers[`${quizId}-${index}`] || '',
    }));

    if (studentAnswerList.some((item) => !item.answer.trim())) {
      setMessage('Please answer every question before submitting.');
      return;
    }

    let score = 0;
    (quizObj?.questions || []).forEach((q, i) => {
      const studentAns = (studentAnswerList[i]?.answer || '').trim().toLowerCase();
      const correctAns = (q.correctAnswer || '').trim().toLowerCase();
      if (studentAns === correctAns) score += 1;
    });

    const totalQuestions = quizObj?.questions?.length || 0;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    const newAttempt = {
      quizId,
      quizTitle: quizObj?.title || 'Quiz',
      studentName: user?.name || user?.email || 'Student',
      studentEmail: user?.email || '',
      score,
      totalQuestions,
      percentage,
      submittedAt: new Date().toISOString(),
    };

    // Save attempt to Cloud Firestore
    try {
      const docRef = await addDoc(collection(db, 'quizAttempts'), newAttempt);
      newAttempt.id = docRef.id;
    } catch (fsErr) {
      console.warn('Firestore quiz attempt save warning:', fsErr.message);
      newAttempt.id = `attempt-${Date.now()}`;
    }

    const nextAttempts = [newAttempt, ...attempts];
    saveLocalAttempts(nextAttempts);
    setMessage(`✅ Quiz submitted! Score: ${score}/${totalQuestions} (${percentage}%)`);
    setAnswers((prev) => ({ ...prev, [quizId]: '' }));
  };

  return (
    <div className="panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>{isInstructorOrAdmin ? 'Manage Quizzes' : 'My Quizzes'}</h1>
        <p style={{ color: '#666', margin: '0.25rem 0 0' }}>
          {isInstructorOrAdmin ? 'Build quizzes, inspect student attempt scores, and delete quizzes.' : 'Take quizzes, submit your answers, and view immediate scores.'}
        </p>
      </div>

      {message && (
        <div style={{ padding: '0.75rem 1rem', background: message.startsWith('✅') ? '#dcfce7' : '#fee2e2', color: message.startsWith('✅') ? '#15803d' : '#dc2626', borderRadius: '0.5rem', marginBottom: '1.25rem', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {/* Instructor Create Quiz Form */}
      {isInstructorOrAdmin && (
        <form onSubmit={handleCreate} style={{ marginBottom: '2rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', backgroundColor: '#f8fafc', display: 'grid', gap: '1rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.25rem', color: '#1e293b' }}>➕ Create New Quiz</h3>
          <input value={form.title} placeholder="Quiz Title (e.g. JavaScript Basics)" onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ padding: '0.6rem 0.8rem', width: '100%', boxSizing: 'border-box' }} />

          {form.questions.map((question, index) => (
            <div key={index} style={{ border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#ffffff' }}>
              <h5 style={{ margin: '0 0 0.5rem', color: '#334155' }}>Question {index + 1}</h5>
              <input value={question.question} placeholder="Enter question..." onChange={(e) => updateQuestion(index, 'question', e.target.value)} required style={{ width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {question.options.map((option, optionIndex) => (
                  <input key={optionIndex} value={option} placeholder={`Option ${optionIndex + 1}`} onChange={(e) => updateOption(index, optionIndex, e.target.value)} style={{ boxSizing: 'border-box' }} />
                ))}
              </div>

              <input value={question.correctAnswer} placeholder="Exact Correct Answer" onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)} required style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={addQuestion}>
              ➕ Add Another Question
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Publish Quiz'}
            </button>
          </div>
        </form>
      )}

      {/* Quizzes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {quizzes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#64748b' }}>No quizzes available right now.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="card" style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: '0.25rem', color: '#0f172a' }}>{quiz.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Created by: {quiz.createdBy || 'Instructor'}</p>
                </div>
                {isInstructorOrAdmin && (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    style={{ fontSize: '0.85rem', color: '#dc2626', borderColor: '#fca5a5', flexShrink: 0 }}
                  >
                    🗑️ Delete Quiz
                  </button>
                )}
              </div>

              {/* Instructor Attempts Review View */}
              {isInstructorOrAdmin ? (
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#334155' }}>
                    📊 Student Attempts Review ({attempts.filter((a) => String(a.quizId) === String(quiz.id)).length})
                  </h4>
                  {attempts.filter((a) => String(a.quizId) === String(quiz.id)).length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>No student attempts yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
                      {attempts.filter((a) => String(a.quizId) === String(quiz.id)).map((entry) => (
                        <div key={entry.id} style={{ padding: '0.6rem 0.8rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: '#1e293b', display: 'block' }}>{entry.studentName}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                            Score: {entry.score}/{entry.totalQuestions} ({entry.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Student Take Quiz View */
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  {(quiz.questions || []).map((question, qIdx) => (
                    <div key={`${quiz.id}-${qIdx}`} style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                      <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#1e293b' }}>
                        Q{qIdx + 1}: {question.question}
                      </p>
                      {question.options && question.options.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                          {question.options.map((opt, oIdx) => (
                            <label key={oIdx} style={{ fontSize: '0.875rem', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <input
                                type="radio"
                                name={`radio-${quiz.id}-${qIdx}`}
                                value={opt}
                                checked={answers[`${quiz.id}-${qIdx}`] === opt}
                                onChange={(e) => setAnswers({ ...answers, [`${quiz.id}-${qIdx}`]: e.target.value })}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      <input
                        value={answers[`${quiz.id}-${qIdx}`] || ''}
                        placeholder="Or type answer here..."
                        onChange={(e) => setAnswers({ ...answers, [`${quiz.id}-${qIdx}`]: e.target.value })}
                        style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <button className="btn btn-primary" type="button" onClick={() => handleSubmitAttempt(quiz.id)}>
                    Submit Quiz Attempt
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
