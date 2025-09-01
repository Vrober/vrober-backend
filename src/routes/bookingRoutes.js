import express from 'express';
import { requireAuth } from '@clerk/express';
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
router.post('/', requireAuth(), createBooking);
router.get('/user', requireAuth(), getUserBookings);
router.put('/:id/cancel', requireAuth(), cancelBooking);
router.put('/:id/rate', requireAuth(), addRatingReview);

// Vendor routes
router.get('/vendor', requireAuth(), getVendorBookings);
router.put('/:id/accept', requireAuth(), acceptBooking);
router.put('/:id/reject', requireAuth(), rejectBooking);
router.put('/:id/complete', requireAuth(), completeBooking);

export default router;
