import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  assignInstructor,
} from '../controllers/courseController.js';

const router = express.Router();

router.get('/',                        getCourses);
router.get('/:id',                     getCourse);
router.post('/',                        createCourse);
router.put('/:id',                     updateCourse);
router.delete('/:id',                  deleteCourse);
router.patch('/:id/assign-instructor', assignInstructor);

export default router;
