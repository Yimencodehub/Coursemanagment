import { db } from '../config/db.js';

const norm = (v) => String(v ?? '').trim();

// ── Get all assignments ───────────────────────────────────────────────────────
export const getAssignments = async (req, res, next) => {
  try {
    const snapshot = await db.collection('assignments').get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    next(error);
  }
};

// ── Get single assignment ─────────────────────────────────────────────────────
export const getAssignment = async (req, res, next) => {
  try {
    const snap = await db.collection('assignments').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Assignment not found.' });
    res.json({ id: req.params.id, ...snap.data() });
  } catch (error) {
    next(error);
  }
};

// ── Create assignment ─────────────────────────────────────────────────────────
export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, courseId, dueDate, maxScore } = req.body || {};
    if (!norm(title)) return res.status(400).json({ message: 'Assignment title is required.' });

    const assignment = {
      title:       norm(title),
      description: norm(description),
      courseId:    norm(courseId),
      dueDate:     norm(dueDate),
      maxScore:    Number(maxScore) || 100,
      createdBy:   req.user?.email || '',
      createdAt:   new Date().toISOString(),
    };

    const docRef = await db.collection('assignments').add(assignment);
    res.status(201).json({ message: 'Assignment created.', assignment: { id: docRef.id, ...assignment } });
  } catch (error) {
    next(error);
  }
};

// ── Update assignment ─────────────────────────────────────────────────────────
export const updateAssignment = async (req, res, next) => {
  try {
    const docRef = db.collection('assignments').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ message: 'Assignment not found.' });

    await docRef.update({ ...req.body, updatedAt: new Date().toISOString() });
    res.json({ message: 'Assignment updated.' });
  } catch (error) {
    next(error);
  }
};

// ── Delete assignment ─────────────────────────────────────────────────────────
export const deleteAssignment = async (req, res, next) => {
  try {
    await db.collection('assignments').doc(req.params.id).delete();
    res.json({ message: 'Assignment deleted.' });
  } catch (error) {
    next(error);
  }
};

// ── Submit assignment (student uploads answer) ────────────────────────────────
export const submitAssignment = async (req, res, next) => {
  try {
    const { studentEmail, answer } = req.body || {};
    if (!norm(studentEmail)) return res.status(400).json({ message: 'studentEmail is required.' });

    const submission = {
      assignmentId:  req.params.id,
      studentEmail:  norm(studentEmail).toLowerCase(),
      answer:        norm(answer),
      submittedAt:   new Date().toISOString(),
      graded:        false,
      score:         null,
    };

    const docRef = await db.collection('assignmentSubmissions').add(submission);
    res.status(201).json({ message: 'Assignment submitted.', submission: { id: docRef.id, ...submission } });
  } catch (error) {
    next(error);
  }
};
