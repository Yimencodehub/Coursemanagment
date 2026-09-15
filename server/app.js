import express from 'express';
import cors from 'cors';
import authRoutes        from './routes/authRoutes.js';
import courseRoutes      from './routes/courseRoutes.js';
import lessonRoutes      from './routes/lessonRoutes.js';
import enrollmentRoutes  from './routes/enrollmentRoutes.js';
import quizRoutes        from './routes/quizRoutes.js';
import assignmentRoutes  from './routes/assignmentRoutes.js';
import subscriberRoutes  from './routes/subscriberRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { isFirebaseConnected } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/courses',      courseRoutes);
app.use('/api/lessons',      lessonRoutes);
app.use('/api/enrollments',  enrollmentRoutes);
app.use('/api/quizzes',      quizRoutes);
app.use('/api/assignments',  assignmentRoutes);
app.use('/api/subscribers',  subscriberRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Course Management API is running ✅' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    storage: isFirebaseConnected ? 'Firebase Firestore' : 'Local JSON (data/store.json)',
    firebaseConnected: isFirebaseConnected,
    tables: ['users', 'courses', 'lessons', 'assignments', 'quizzes', 'quizAttempts', 'passwordResets', 'subscribers', 'enrollments', 'progress'],
    message: isFirebaseConnected
      ? 'Firebase database is connected.'
      : 'Using local JSON store — all data is saved to server/data/store.json',
  });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 Storage: ${isFirebaseConnected ? 'Firebase Firestore' : 'Local JSON (data/store.json)'}\n`);
});
