import express from 'express';
import { addVendor, deleteVendor, updateVendor } from '../controllers/admin.vendorController.js';
// import your admin authentication middleware if needed

const router = express.Router();

// Add a new vendor (Admin only)
router.post('/add', /* adminMiddleware, */ addVendor);

// Delete a vendor by ID (Admin only)
router.delete('/:id', /* adminMiddleware, */ deleteVendor);

// Update a vendor by ID (Admin only)
router.put('/:id', /* adminMiddleware, */ updateVendor);

export default router;

