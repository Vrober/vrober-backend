import express from 'express';
import { requireAuth } from '@clerk/express';
import { createUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

// Create user profile (public route for registration)
router.post('/', createUser);

// Update user details (protected route)
router.put('/', requireAuth(), updateUser);

export default router;