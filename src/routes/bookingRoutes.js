import express from 'express';
// Switched from Clerk to custom JWT middleware
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { 
    createBooking,
    getUserBookings,
    getVendorBookings,
    acceptBooking,
    rejectBooking,
    completeBooking,
    cancelBooking,
    addRatingReview
} from '../controllers/bookingController.js';

const router = express.Router();

// User routes
router.post('/', verifyJWT('user'), createBooking);
router.get('/user', verifyJWT('user'), getUserBookings);
router.put('/:id/cancel', verifyJWT('user'), cancelBooking);
router.put('/:id/rate', verifyJWT('user'), addRatingReview);

// Vendor routes
router.get('/vendor', verifyJWT('vendor'), getVendorBookings);
router.put('/:id/accept', verifyJWT('vendor'), acceptBooking);
router.put('/:id/reject', verifyJWT('vendor'), rejectBooking);
router.put('/:id/complete', verifyJWT('vendor'), completeBooking);

export default router;
