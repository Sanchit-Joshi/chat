// authRoutes.ts
import express from 'express';
import { login, signup, verifyToken, logout, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticateToken, logout);
router.get('/verify', authenticateToken, verifyToken);
router.get('/current-user', authenticateToken, getCurrentUser);

export default router;