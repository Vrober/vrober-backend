import express from 'express';
import { 
    getAllServices,
    getServiceById,
    getServicesByVendor,
    searchServices
} from '../controllers/serviceController.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/search', searchServices);
router.get('/:id', getServiceById);
router.get('/vendor/:vendorId', getServicesByVendor);

export default router;
