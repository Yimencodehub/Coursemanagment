import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

// Auth
router.post('/register',        registerUser);
router.post('/login',           loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

// User management (Admin)
router.get('/users',                  getAllUsers);
router.patch('/users/:email/role',    updateUserRole);
router.patch('/users/:email/toggle',  toggleUserActive);
router.delete('/users/:email',        deleteUser);

export default router;
