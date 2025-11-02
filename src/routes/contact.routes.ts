import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/', contactController.createContact);

// Protected routes (require authentication)
router.get('/', authMiddleware, contactController.getContacts);
router.patch('/:id/status', authMiddleware, contactController.updateContactStatus);
router.delete('/:id', authMiddleware, contactController.deleteContact);

export default router;
