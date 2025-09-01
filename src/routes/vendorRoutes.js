import express from 'express';
import { requireAuth } from '@clerk/express';
import { createVendor, updateVendor } from '../controllers/vendorController.js';

const router = express.Router();

// Create vendor profile (public route for registration)
router.post('/', createVendor);

// Update vendor details (protected route)
router.put('/', requireAuth(), updateVendor);

export default router;

