import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();
const CURRENT_USER_KEY = 'app_current_user';
const ALL_USERS_KEY = 'app_registered_users';

// ── Local storage helpers ─────────────────────────────────────────────────────

const getLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(ALL_USERS_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveLocalUser = (email, userData) => {
  const users = getLocalUsers();
  users[email.toLowerCase()] = { ...userData, email: email.toLowerCase() };
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
};

const saveCurrentUser = (userData) => {
  if (userData) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session immediately from localStorage so UI is not blank
    const storedUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
    }

    // Also listen to Firebase auth state changes (works if Firebase is configured)
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const nextUser = userDoc.exists()
            ? { uid: firebaseUser.uid, ...userDoc.data() }
            : { uid: firebaseUser.uid, email: firebaseUser.email, role: 'student' };
          setUser(nextUser);
          saveCurrentUser(nextUser);
        } catch {
          // Firebase Firestore unavailable – keep localStorage user
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────

  const registerUser = async (name, email, password, role) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Check if already registered locally
    const existingUsers = getLocalUsers();
    if (existingUsers[normalizedEmail]) {
      throw new Error('This email address is already registered. Please log in.');
    }

    // STEP 1 – Always save to localStorage (guaranteed to work)
    const localData = {
      name: name.trim(),
      email: normalizedEmail,
      password,                          // stored for local login check
      role: role || 'student',
      active: true,
      createdAt: new Date().toISOString(),
    };
    saveLocalUser(normalizedEmail, localData);

    // STEP 2 – Also try Firebase (bonus, non-blocking)
    try {
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const uid = credential.user.uid;

      try {
        await setDoc(doc(db, 'users', uid), {
          name: name.trim(),
          email: normalizedEmail,
          role: role || 'student',
          createdAt: localData.createdAt,
        });
      } catch {
        // Firestore write failed – localStorage already has the data
      }

      await firebaseSignOut(auth); // don't auto-login after register
    } catch (fbErr) {
      // Firebase failed – that's fine, localStorage is the source of truth
      console.info('Firebase registration skipped:', fbErr.code || fbErr.message);
    }

    return { success: true };
  };

  // ── Login ───────────────────────────────────────────────────────────────────

  const loginUser = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    // STEP 1 – Try Firebase Auth
    try {
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const uid = credential.user.uid;

      let userData;
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        userData = userDoc.exists()
          ? { uid, ...userDoc.data() }
          : { uid, email: normalizedEmail, role: 'student', name: normalizedEmail.split('@')[0] };
      } catch {
        userData = { uid, email: normalizedEmail, role: 'student', name: normalizedEmail.split('@')[0] };
      }

      setUser(userData);
      saveCurrentUser(userData);
      return userData;
    } catch (fbErr) {
      console.info('Firebase login not available:', fbErr.code || fbErr.message);
    }

    // STEP 2 – Fallback: check localStorage users
    const localUsers = getLocalUsers();
    const localUser = localUsers[normalizedEmail];

    if (localUser && localUser.password === password) {
      if (localUser.active === false) {
        throw new Error('Your account has been deactivated. Please contact an administrator.');
      }
      const userData = {
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        bio: localUser.bio || '',
        phone: localUser.phone || '',
        active: localUser.active !== false,
      };
      setUser(userData);
      saveCurrentUser(userData);
      return userData;
    }

    // Not found anywhere
    throw new Error('Invalid email or password. Please check your credentials.');
  };

  // ── Update profile ──────────────────────────────────────────────────────────

  const updateProfile = async (updates) => {
    const nextUser = { ...(user || {}), ...updates };
    setUser(nextUser);
    saveCurrentUser(nextUser);

    if (nextUser.email) {
      const users = getLocalUsers();
      users[nextUser.email.toLowerCase()] = {
        ...(users[nextUser.email.toLowerCase()] || {}),
        ...nextUser,
      };
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    }

    return nextUser;
  };

  // ── Logout ──────────────────────────────────────────────────────────────────

  const logout = async () => {
    try { await firebaseSignOut(auth); } catch { /* ignore */ }
    setUser(null);
    saveCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, registerUser, loginUser, logout, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
