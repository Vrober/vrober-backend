// Corrected model import paths to actual filenames
import Booking from '../models/booking.models.js';
import Service from '../models/services.models.js';
import User from '../models/user.models.js';
import Vendor from '../models/vendor.models.js';

// Create a new booking (User)
export async function createBooking(req, res) {
    try {
        const userId = req.user?._id; // From JWT middleware
        const { 
            vendorId, 
            serviceId, 
            serviceDate, 
            serviceTime, 
            address, 
            location, 
            price, 
            description, 
            specialInstructions,
            paymentMethod 
        } = req.body;

        // Verify service exists
        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Verify vendor exists
        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newBooking = new Booking({
            userId,
            vendorId,
            serviceId,
            bookingDate: new Date(),
            serviceDate,
            serviceTime,
            address,
            location,
            price,
            description,
            specialInstructions,
            paymentMethod,
            status: 'pending'
        });

        await newBooking.save();

        // Increment bookingCount for the associated service to keep "Most Booked" section accurate
        // This is non-blocking for the booking creation response; failures are logged but do not prevent booking success
        try {
            await Service.findByIdAndUpdate(serviceId, { $inc: { bookingCount: 1 } });
        } catch (incErr) {
            console.error('Failed to increment service bookingCount:', incErr?.message || incErr);
        }

        // Populate the response
        const populatedBooking = await Booking.findById(newBooking._id)
            .populate('userId', 'name email mobileNo')
            .populate('vendorId', 'name email mobileNo')
            .populate('serviceId', 'serviceName serviceType');

        res.status(201).json({ 
            message: 'Booking created successfully', 
            booking: populatedBooking 
        });
    } catch (error) {
        res.status(400).json({ 
            message: 'Failed to create booking', 
            error: error.message 
        });
    }
}

// Get user's bookings
export async function getUserBookings(req, res) {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, status } = req.query;

        const filter = { userId };
        if (status) {
            filter.status = status;
        }

        const bookings = await Booking.find(filter)
            .populate('vendorId', 'name email mobileNo imageUri rating')
            .populate('serviceId', 'serviceName serviceType imageUrl')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Booking.countDocuments(filter);

        res.status(200).json({
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch user bookings', 
            error: error.message 
        });
    }
}

// Get vendor's bookings/orders
export async function getVendorBookings(req, res) {
    try {
        const vendorId = req.user?._id;
        const { page = 1, limit = 10, status } = req.query;

        const filter = { vendorId };
        if (status) {
            filter.status = status;
        }

        const bookings = await Booking.find(filter)
            .populate('userId', 'name email mobileNo')
            .populate('serviceId', 'serviceName serviceType imageUrl')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Booking.countDocuments(filter);

        res.status(200).json({
            bookings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch vendor bookings', 
            error: error.message 
        });
    }
}

// Accept booking (Vendor)
export async function acceptBooking(req, res) {
    try {
        const vendorId = req.user?._id;
        const { id } = req.params;
        const { vendorNotes } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.vendorId.toString() !== vendorId) {
            return res.status(403).json({ message: 'Not authorized to accept this booking' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Booking is not in pending status' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { 
                status: 'accepted',
                vendorNotes: vendorNotes || ''
            },
            { new: true }
        ).populate('userId', 'name email mobileNo')
         .populate('serviceId', 'serviceName serviceType');

        res.status(200).json({ 
            message: 'Booking accepted successfully', 
            booking: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to accept booking', 
            error: error.message 
        });
    }
}

// Reject booking (Vendor)
export async function rejectBooking(req, res) {
    try {
        const vendorId = req.user?._id;
        const { id } = req.params;
        const { cancellationReason } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.vendorId.toString() !== vendorId) {
            return res.status(403).json({ message: 'Not authorized to reject this booking' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Booking is not in pending status' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { 
                status: 'rejected',
                cancellationReason: cancellationReason || 'No reason provided',
                cancelledBy: 'vendor'
            },
            { new: true }
        ).populate('userId', 'name email mobileNo')
         .populate('serviceId', 'serviceName serviceType');

        res.status(200).json({ 
            message: 'Booking rejected successfully', 
            booking: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to reject booking', 
            error: error.message 
        });
    }
}

// Complete booking (Vendor)
export async function completeBooking(req, res) {
    try {
        const vendorId = req.user?._id;
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.vendorId.toString() !== vendorId) {
            return res.status(403).json({ message: 'Not authorized to complete this booking' });
        }

        if (booking.status !== 'accepted') {
            return res.status(400).json({ message: 'Booking must be accepted before completion' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { 
                status: 'completed',
                completionDate: new Date()
            },
            { new: true }
        ).populate('userId', 'name email mobileNo')
         .populate('serviceId', 'serviceName serviceType');

        res.status(200).json({ 
            message: 'Booking completed successfully', 
            booking: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to complete booking', 
            error: error.message 
        });
    }
}

// Cancel booking (User)
export async function cancelBooking(req, res) {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const { cancellationReason } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (!['pending', 'accepted'].includes(booking.status)) {
            return res.status(400).json({ message: 'Booking cannot be cancelled in current status' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { 
                status: 'cancelled',
                cancellationReason: cancellationReason || 'No reason provided',
                cancelledBy: 'user'
            },
            { new: true }
        ).populate('vendorId', 'name email mobileNo')
         .populate('serviceId', 'serviceName serviceType');

        res.status(200).json({ 
            message: 'Booking cancelled successfully', 
            booking: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to cancel booking', 
            error: error.message 
        });
    }
}

// Add rating and review (User)
export async function addRatingReview(req, res) {
    try {
        const userId = req.user?._id;
        const { id } = req.params;
        const { rating, review } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to rate this booking' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Can only rate completed bookings' });
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            id,
            { rating, review },
            { new: true }
        ).populate('vendorId', 'name email mobileNo')
         .populate('serviceId', 'serviceName serviceType');

        res.status(200).json({ 
            message: 'Rating and review added successfully', 
            booking: updatedBooking 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to add rating and review', 
            error: error.message 
        });
    }
}
