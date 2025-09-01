import express from 'express';
import { requireAuth } from '@clerk/express';
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
    getDashboardStats
} from '../controllers/adminController.js';

const router = express.Router();

// Admin middleware - you can add role-based access control here
const requireAdmin = (req, res, next) => {
    // Add your admin role check logic here
    // For now, we'll just require authentication
    next();
};

// User management routes
router.delete('/users/:id', requireAuth(), requireAdmin, deleteUser);
router.post('/users', requireAuth(), requireAdmin, createUser);
router.get('/users', requireAuth(), requireAdmin, getAllUsers);

// Vendor management routes
router.delete('/vendors/:id', requireAuth(), requireAdmin, deleteVendor);
router.post('/vendors', requireAuth(), requireAdmin, createVendor);
router.get('/vendors', requireAuth(), requireAdmin, getAllVendors);

// Service management routes
router.get('/services', requireAuth(), requireAdmin, getAllServices);
router.post('/services', requireAuth(), requireAdmin, createService);
router.put('/services/:id', requireAuth(), requireAdmin, updateService);
router.delete('/services/:id', requireAuth(), requireAdmin, deleteService);

// Booking management routes
router.get('/bookings', requireAuth(), requireAdmin, getAllBookings);
router.put('/bookings/:id/status', requireAuth(), requireAdmin, updateBookingStatus);
router.delete('/bookings/:id', requireAuth(), requireAdmin, deleteBooking);

// Dashboard routes
router.get('/dashboard', requireAuth(), requireAdmin, getDashboardStats);

export default router;
