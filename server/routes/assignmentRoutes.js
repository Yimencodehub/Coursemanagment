import express from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
} from '../controllers/assignmentController.js';

const router = express.Router();

router.get('/',               getAssignments);
router.get('/:id',            getAssignment);
router.post('/',              createAssignment);
router.put('/:id',            updateAssignment);
router.delete('/:id',         deleteAssignment);
router.post('/:id/submit',    submitAssignment);

export default router;
