import express from 'express';
// Removed Clerk dependency; using JWT middleware
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { 
    deleteUser, 
    deleteVendor, 
    createUser, 
    createVendor, 
    getAllUsers, 
    getAllVendors, 
    getAllServices,
    createService,
    updateService,
    deleteService,
    getAllBookings,
    updateBookingStatus,
    deleteBooking,
    getDashboardStats,
    uploadServiceImage,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/adminController.js';

const router = express.Router();

// Simple admin role check leveraging verifyJWT attached req.user
const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};

// User management routes
router.delete('/users/:id', verifyJWT('admin'), requireAdmin, deleteUser);
router.post('/users', verifyJWT('admin'), requireAdmin, createUser);
router.get('/users', verifyJWT('admin'), requireAdmin, getAllUsers);

// Vendor management routes
router.delete('/vendors/:id', verifyJWT('admin'), requireAdmin, deleteVendor);
router.post('/vendors', verifyJWT('admin'), requireAdmin, createVendor);
router.get('/vendors', verifyJWT('admin'), requireAdmin, getAllVendors);

// Service management routes
router.get('/services', verifyJWT('admin'), requireAdmin, getAllServices);
router.post('/services', verifyJWT('admin'), requireAdmin, createService);
router.put('/services/:id', verifyJWT('admin'), requireAdmin, updateService);
router.delete('/services/:id', verifyJWT('admin'), requireAdmin, deleteService);

// Booking management routes
router.get('/bookings', verifyJWT('admin'), requireAdmin, getAllBookings);
router.put('/bookings/:id/status', verifyJWT('admin'), requireAdmin, updateBookingStatus);
router.delete('/bookings/:id', verifyJWT('admin'), requireAdmin, deleteBooking);

// Dashboard routes
router.get('/dashboard', verifyJWT('admin'), requireAdmin, getDashboardStats);

// Image upload route
router.post('/upload-image', verifyJWT('admin'), requireAdmin, upload.single('image'), uploadServiceImage);

// Category management routes
router.post('/categories', verifyJWT('admin'), requireAdmin, createCategory);
router.put('/categories/:name', verifyJWT('admin'), requireAdmin, updateCategory);
router.delete('/categories/:name', verifyJWT('admin'), requireAdmin, deleteCategory);

export default router;
