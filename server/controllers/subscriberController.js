import { db } from '../config/db.js';

const norm = (v) => String(v ?? '').trim();

// ── Subscribe ─────────────────────────────────────────────────────────────────
export const subscribe = async (req, res, next) => {
  try {
    const email = norm(req.body?.email).toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    await db.collection('subscribers').doc(email).set({
      email,
      subscribedAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Subscribed successfully.' });
  } catch (error) {
    next(error);
  }
};

// ── Get all subscribers ───────────────────────────────────────────────────────
export const getSubscribers = async (req, res, next) => {
  try {
    const snapshot = await db.collection('subscribers').get();
    res.json(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    next(error);
  }
};

// ── Unsubscribe ───────────────────────────────────────────────────────────────
export const unsubscribe = async (req, res, next) => {
  try {
    const email = norm(req.params.email).toLowerCase();
    await db.collection('subscribers').doc(email).delete();
    res.json({ message: 'Unsubscribed.' });
  } catch (error) {
    next(error);
  }
};
