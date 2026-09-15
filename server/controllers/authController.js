import { db } from '../config/db.js';

const norm = (v) => String(v ?? '').trim();
const normEmail = (e) => norm(e).toLowerCase();

// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    const cleanEmail = normEmail(email);

    if (!cleanEmail || !norm(name) || !norm(password)) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    // Duplicate check
    const existing = await db.collection('users').doc(cleanEmail).get();
    if (existing.exists) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const userData = {
      name:      norm(name),
      email:     cleanEmail,
      password:  norm(password),          // stored for local login
      role:      norm(role) || 'student',
      active:    true,
      createdAt: new Date().toISOString(),
    };

    await db.collection('users').doc(cleanEmail).set(userData);

    const { password: _pw, ...safeUser } = userData;
    res.status(201).json({ message: 'User registered successfully.', user: safeUser });
  } catch (error) {
    next(error);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = normEmail(email);

    if (!cleanEmail || !norm(password)) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const snapshot = await db.collection('users').doc(cleanEmail).get();
    if (!snapshot.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userData = snapshot.data();
    if (userData.active === false) {
      return res.status(403).json({ message: 'Account is deactivated. Contact an administrator.' });
    }
    if (userData.password !== norm(password)) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const { password: _pw, ...safeUser } = userData;
    res.json({ message: 'Login successful.', user: safeUser });
  } catch (error) {
    next(error);
  }
};

// ── Get all users (Admin) ─────────────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs
      .map((d) => { const { password: _pw, ...u } = d.data(); return { id: d.id, ...u }; })
      .filter((u) => u.role !== 'admin');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// ── Update role ───────────────────────────────────────────────────────────────
export const updateUserRole = async (req, res, next) => {
  try {
    const email = normEmail(req.params.email);
    const { role } = req.body || {};
    if (!role) return res.status(400).json({ message: 'Role is required.' });

    const docRef = db.collection('users').doc(email);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found.' });

    await docRef.update({ role: norm(role) });
    res.json({ message: 'Role updated.' });
  } catch (error) {
    next(error);
  }
};

// ── Toggle active ─────────────────────────────────────────────────────────────
export const toggleUserActive = async (req, res, next) => {
  try {
    const email = normEmail(req.params.email);
    const docRef = db.collection('users').doc(email);
    const snap = await docRef.get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found.' });

    const current = snap.data();
    await docRef.update({ active: !current.active });
    res.json({ message: `User ${!current.active ? 'activated' : 'deactivated'}.` });
  } catch (error) {
    next(error);
  }
};

// ── Delete user ───────────────────────────────────────────────────────────────
export const deleteUser = async (req, res, next) => {
  try {
    const email = normEmail(req.params.email);
    await db.collection('users').doc(email).delete();
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

// ── Forgot password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const email = normEmail(req.body?.email);
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const snap = await db.collection('users').doc(email).get();
    if (!snap.exists) return res.status(404).json({ message: 'User not found.' });

    const token = `reset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.collection('passwordResets').doc(token).set({
      email,
      token,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Reset link generated.', resetToken: token });
  } catch (error) {
    next(error);
  }
};

// ── Reset password ────────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    const resetSnap = await db.collection('passwordResets').doc(token).get();
    if (!resetSnap.exists) return res.status(404).json({ message: 'Invalid or expired reset token.' });

    const { email } = resetSnap.data();
    await db.collection('users').doc(email).update({ password: norm(password) });
    await db.collection('passwordResets').doc(token).delete();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
