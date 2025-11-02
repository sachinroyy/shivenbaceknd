// backend/src/routes/subscriptionRoutes.ts
import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import {
  getPlans,
  createSubscription,
  verifySubscription,
} from '../controllers/subscriptionController';

const router = express.Router();

// Public routes
router.get('/plans', getPlans);

// Protected routes
router.use(authMiddleware);
router.post('/subscribe', createSubscription);
router.post('/verify', verifySubscription);

export default router;