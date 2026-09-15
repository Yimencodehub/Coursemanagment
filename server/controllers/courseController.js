import { db } from '../config/db.js';

const norm = (v) => String(v ?? '').trim();

// ── Get all courses ───────────────────────────────────────────────────────────
export const getCourses = async (req, res, next) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// ── Get single course ─────────────────────────────────────────────────────────
export const getCourse = async (req, res, next) => {
  try {
    const snap = await db.collection('courses').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Course not found.' });
    res.json({ id: req.params.id, ...snap.data() });
  } catch (error) {
    next(error);
  }
};

// ── Create course ─────────────────────────────────────────────────────────────
export const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructor, category } = req.body || {};
    if (!norm(title)) return res.status(400).json({ message: 'Course title is required.' });

    const course = {
      title:       norm(title),
      description: norm(description),
      instructor:  norm(instructor) || req.user?.email || 'instructor@example.com',
      category:    norm(category),
      createdAt:   new Date().toISOString(),
    };

    const docRef = await db.collection('courses').add(course);
    res.status(201).json({ message: 'Course created.', course: { id: docRef.id, ...course } });
  } catch (error) {
    next(error);
  }
};

// ── Update course ─────────────────────────────────────────────────────────────
export const updateCourse = async (req, res, next) => {
  try {
    const docRef = db.collection('courses').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ message: 'Course not found.' });

    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await docRef.update(updates);
    res.json({ message: 'Course updated.' });
  } catch (error) {
    next(error);
  }
};

// ── Delete course ─────────────────────────────────────────────────────────────
export const deleteCourse = async (req, res, next) => {
  try {
    await db.collection('courses').doc(req.params.id).delete();
    res.json({ message: 'Course deleted.' });
  } catch (error) {
    next(error);
  }
};

// ── Assign instructor ─────────────────────────────────────────────────────────
export const assignInstructor = async (req, res, next) => {
  try {
    const { instructor } = req.body || {};
    if (!norm(instructor)) return res.status(400).json({ message: 'Instructor email is required.' });

    const docRef = db.collection('courses').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ message: 'Course not found.' });

    await docRef.update({ instructor: norm(instructor), updatedAt: new Date().toISOString() });
    res.json({ message: 'Instructor assigned.' });
  } catch (error) {
    next(error);
  }
};
