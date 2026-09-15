import express from 'express';
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttempts,
} from '../controllers/quizController.js';

const router = express.Router();

router.get('/',                      getQuizzes);
router.get('/attempts',              getQuizAttempts);
router.get('/:id',                   getQuiz);
router.post('/',                     createQuiz);
router.put('/:id',                   updateQuiz);
router.delete('/:id',                deleteQuiz);
router.post('/:quizId/submit',       submitQuizAttempt);

export default router;
