import { db } from '../config/db.js';

const norm = (v) => String(v ?? '').trim();

// ── Get all quizzes ───────────────────────────────────────────────────────────
export const getQuizzes = async (req, res, next) => {
  try {
    const snapshot = await db.collection('quizzes').get();
    const quizzes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// ── Get single quiz ───────────────────────────────────────────────────────────
export const getQuiz = async (req, res, next) => {
  try {
    const snap = await db.collection('quizzes').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Quiz not found.' });
    res.json({ id: req.params.id, ...snap.data() });
  } catch (error) {
    next(error);
  }
};

// ── Create quiz ───────────────────────────────────────────────────────────────
export const createQuiz = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const title = norm(payload.title);
    const questions = Array.isArray(payload.questions) ? payload.questions : [];

    if (!title) return res.status(400).json({ message: 'Quiz title is required.' });
    if (questions.length === 0) return res.status(400).json({ message: 'At least one question is required.' });

    const cleanQuestions = questions
      .filter((q) => norm(q.question))
      .map((q) => ({
        question:      norm(q.question),
        options:       (q.options || []).map(norm).filter(Boolean).slice(0, 4),
        correctAnswer: norm(q.correctAnswer),
      }));

    const quiz = {
      title,
      questions: cleanQuestions,
      courseId:  norm(payload.courseId),
      createdBy: norm(payload.createdBy) || req.user?.email || '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('quizzes').add(quiz);
    res.status(201).json({ message: 'Quiz created.', quiz: { id: docRef.id, ...quiz } });
  } catch (error) {
    next(error);
  }
};

// ── Update quiz ───────────────────────────────────────────────────────────────
export const updateQuiz = async (req, res, next) => {
  try {
    const docRef = db.collection('quizzes').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ message: 'Quiz not found.' });

    await docRef.update({ ...req.body, updatedAt: new Date().toISOString() });
    res.json({ message: 'Quiz updated.' });
  } catch (error) {
    next(error);
  }
};

// ── Delete quiz ───────────────────────────────────────────────────────────────
export const deleteQuiz = async (req, res, next) => {
  try {
    await db.collection('quizzes').doc(req.params.id).delete();
    res.json({ message: 'Quiz deleted.' });
  } catch (error) {
    next(error);
  }
};

// ── Submit quiz attempt ───────────────────────────────────────────────────────
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const quizSnap = await db.collection('quizzes').doc(req.params.quizId).get();
    if (!quizSnap.exists) return res.status(404).json({ message: 'Quiz not found.' });

    const quiz = quizSnap.data();
    const submitted = Array.isArray(req.body.answers) ? req.body.answers : [];

    let score = 0;
    const results = (quiz.questions || []).map((q, i) => {
      const ans = norm(submitted[i]?.answer || '');
      const correct = ans.toLowerCase() === norm(q.correctAnswer).toLowerCase();
      if (correct) score++;
      return { question: q.question, submittedAnswer: ans, correctAnswer: norm(q.correctAnswer), isCorrect: correct };
    });

    const total = quiz.questions?.length || 0;
    const attempt = {
      quizId:        req.params.quizId,
      quizTitle:     quiz.title,
      studentName:   norm(req.body.studentName  || req.user?.name  || ''),
      studentEmail:  norm(req.body.studentEmail || req.user?.email || ''),
      answers:       submitted,
      results,
      score,
      totalQuestions: total,
      percentage:    total ? Math.round((score / total) * 100) : 0,
      submittedAt:   new Date().toISOString(),
    };

    const docRef = await db.collection('quizAttempts').add(attempt);
    res.status(201).json({ message: 'Quiz submitted.', attempt: { id: docRef.id, ...attempt } });
  } catch (error) {
    next(error);
  }
};

// ── Get all quiz attempts ─────────────────────────────────────────────────────
export const getQuizAttempts = async (req, res, next) => {
  try {
    const snapshot = await db.collection('quizAttempts').get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    next(error);
  }
};
