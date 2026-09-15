import express from 'express';
import {
  getEnrollments,
  enrollStudent,
  deleteEnrollment,
} from '../controllers/enrollmentController.js';

const router = express.Router();

router.get('/',       getEnrollments);
router.post('/',      enrollStudent);
router.delete('/:id', deleteEnrollment);

export default router;
