import { Router } from 'express';
import { getCurrentUser } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', authMiddleware, getCurrentUser);

export default router;
