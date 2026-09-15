import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir  = path.join(__dirname, '../data');
const dataFile = path.join(dataDir, 'store.json');

// ─── Default schema ────────────────────────────────────────────────────────────
const DEFAULT_STORE = {
  users:          {},   // key = email (normalized)
  courses:        {},   // key = auto id
  lessons:        {},   // key = auto id
  assignments:    {},   // key = auto id
  quizzes:        {},   // key = auto id
  quizAttempts:   {},   // key = auto id
  passwordResets: {},   // key = token
  subscribers:    {},   // key = email
  enrollments:    {},   // key = auto id
  progress:       {},   // key = auto id
};

// ─── File helpers ──────────────────────────────────────────────────────────────
function ensureFile() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(dataFile)) writeFileSync(dataFile, JSON.stringify(DEFAULT_STORE, null, 2));
}

function loadStore() {
  ensureFile();
  try {
    const parsed = JSON.parse(readFileSync(dataFile, 'utf8'));
    // Merge parsed data with default so any new table is always present
    return Object.keys(DEFAULT_STORE).reduce((acc, key) => {
      acc[key] = parsed[key] && typeof parsed[key] === 'object' ? parsed[key] : {};
      return acc;
    }, {});
  } catch (err) {
    console.warn('⚠️  store.json parse error, starting fresh:', err.message);
    return { ...DEFAULT_STORE };
  }
}

function persist(store) {
  ensureFile();
  writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

// ─── In-memory store (loaded once at startup) ──────────────────────────────────
const store = loadStore();
console.log('✅ Local JSON store loaded from', dataFile);

// ─── ID generator ──────────────────────────────────────────────────────────────
const genId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Document class ────────────────────────────────────────────────────────────
class Doc {
  constructor(collection, id) {
    this._col = collection;
    this.id   = id;
  }

  get exists() {
    return !!(store[this._col] && store[this._col][this.id]);
  }

  /** Read */
  async get() {
    const data = store[this._col]?.[this.id];
    if (!data) return { exists: false, data: () => undefined };
    return { exists: true, data: () => ({ ...data }) };
  }

  /** Create / overwrite / merge */
  async set(data, options = {}) {
    store[this._col] = store[this._col] || {};
    const existing = store[this._col][this.id] || {};
    store[this._col][this.id] = options.merge
      ? { ...existing, ...data, id: this.id }
      : { ...data, id: this.id };
    persist(store);
    return this;
  }

  /** Update specific fields (like Firestore update) */
  async update(data) {
    store[this._col] = store[this._col] || {};
    const existing = store[this._col][this.id];
    if (!existing) throw new Error(`Document ${this.id} not found in ${this._col}`);
    store[this._col][this.id] = { ...existing, ...data };
    persist(store);
    return this;
  }

  /** Delete */
  async delete() {
    if (store[this._col]?.[this.id]) {
      delete store[this._col][this.id];
      persist(store);
    }
  }
}

// ─── Collection class ──────────────────────────────────────────────────────────
class Collection {
  constructor(name) {
    this.name = name;
  }

  doc(id) {
    return new Doc(this.name, id);
  }

  /** Add a new document with auto-generated id */
  async add(data) {
    const id = genId(this.name);
    const docRef = new Doc(this.name, id);
    await docRef.set(data);
    return { id };
  }

  /** Get all documents */
  async get() {
    const col = store[this.name] || {};
    const docs = Object.entries(col).map(([id, value]) => ({
      id,
      data: () => ({ ...value }),
    }));
    return { docs };
  }

  /** Get documents where field equals value */
  async where(field, _op, value) {
    const col = store[this.name] || {};
    const docs = Object.entries(col)
      .filter(([, v]) => v[field] === value)
      .map(([id, v]) => ({ id, data: () => ({ ...v }) }));
    return { docs };
  }
}

// ─── DB façade ─────────────────────────────────────────────────────────────────
class LocalDB {
  collection(name) {
    if (!store[name]) {
      store[name] = {};        // auto-create unknown collections
      persist(store);
    }
    return new Collection(name);
  }

  /** Convenience: get entire raw store (for debug / admin) */
  raw() {
    return store;
  }
}

export const db = new LocalDB();
export const isFirebaseConnected = false;
