import { db } from '../config/db.js';

const norm = (v) => String(v ?? '').trim();

// ── Get all enrollments ───────────────────────────────────────────────────────
export const getEnrollments = async (req, res, next) => {
  try {
    const snapshot = await db.collection('enrollments').get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    next(error);
  }
};

// ── Enroll a student ──────────────────────────────────────────────────────────
export const enrollStudent = async (req, res, next) => {
  try {
    const { studentEmail, courseId } = req.body || {};
    if (!norm(studentEmail) || !norm(courseId)) {
      return res.status(400).json({ message: 'studentEmail and courseId are required.' });
    }

    const enrollment = {
      studentEmail: norm(studentEmail).toLowerCase(),
      courseId:     norm(courseId),
      enrolledAt:   new Date().toISOString(),
    };

    const docRef = await db.collection('enrollments').add(enrollment);
    res.status(201).json({ message: 'Student enrolled.', enrollment: { id: docRef.id, ...enrollment } });
  } catch (error) {
    next(error);
  }
};

// ── Delete enrollment ─────────────────────────────────────────────────────────
export const deleteEnrollment = async (req, res, next) => {
  try {
    await db.collection('enrollments').doc(req.params.id).delete();
    res.json({ message: 'Enrollment removed.' });
  } catch (error) {
    next(error);
  }
};
