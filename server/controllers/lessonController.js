import { db } from '../config/db.js';

const norm = (v) => String(v ?? '').trim();

// ── Get all lessons ───────────────────────────────────────────────────────────
export const getLessons = async (req, res, next) => {
  try {
    const snapshot = await db.collection('lessons').get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    next(error);
  }
};

// ── Get single lesson ─────────────────────────────────────────────────────────
export const getLesson = async (req, res, next) => {
  try {
    const snap = await db.collection('lessons').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ message: 'Lesson not found.' });
    res.json({ id: req.params.id, ...snap.data() });
  } catch (error) {
    next(error);
  }
};

// ── Create lesson ─────────────────────────────────────────────────────────────
export const createLesson = async (req, res, next) => {
  try {
    const { title, content, courseId, order } = req.body || {};
    if (!norm(title)) return res.status(400).json({ message: 'Lesson title is required.' });

    const lesson = {
      title:     norm(title),
      content:   norm(content),
      courseId:  norm(courseId),
      order:     Number(order) || 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('lessons').add(lesson);
    res.status(201).json({ message: 'Lesson created.', lesson: { id: docRef.id, ...lesson } });
  } catch (error) {
    next(error);
  }
};

// ── Update lesson ─────────────────────────────────────────────────────────────
export const updateLesson = async (req, res, next) => {
  try {
    const docRef = db.collection('lessons').doc(req.params.id);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ message: 'Lesson not found.' });

    await docRef.update({ ...req.body, updatedAt: new Date().toISOString() });
    res.json({ message: 'Lesson updated.' });
  } catch (error) {
    next(error);
  }
};

// ── Delete lesson ─────────────────────────────────────────────────────────────
export const deleteLesson = async (req, res, next) => {
  try {
    await db.collection('lessons').doc(req.params.id).delete();
    res.json({ message: 'Lesson deleted.' });
  } catch (error) {
    next(error);
  }
};
