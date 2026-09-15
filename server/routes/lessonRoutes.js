import express from 'express';
import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js';

const router = express.Router();

router.get('/',      getLessons);
router.get('/:id',   getLesson);
router.post('/',     createLesson);
router.put('/:id',   updateLesson);
router.delete('/:id', deleteLesson);

export default router;
