// Corrected model import paths to actual filenames
import Booking from "../models/booking.models.js";
import Service from "../models/services.models.js";
import User from "../models/user.models.js";
import Vendor from "../models/vendor.models.js";

// Create a new booking (User)
export async function createBooking(req, res) {
	try {
		const userId = req.user?._id; // From JWT middleware
		
		// Log the request for debugging
		console.log('Booking creation request:', {
			userId,
			body: req.body,
			user: req.user
		});
		
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
			paymentMethod,
		} = req.body;
		
		// Validate required fields (vendorId is optional as we can get it from service)
		if (!serviceId || !serviceDate || !serviceTime || !address) {
			return res.status(400).json({ 
				message: "Missing required fields",
				required: ['serviceId', 'serviceDate', 'serviceTime', 'address'],
				received: { serviceId, serviceDate, serviceTime, address }
			});
		}
		
		// Validate date format
		const parsedDate = new Date(serviceDate);
		if (isNaN(parsedDate.getTime())) {
			return res.status(400).json({ message: "Invalid serviceDate format" });
		}

		// Verify service exists
		const service = await Service.findById(serviceId);
		if (!service) {
			return res.status(404).json({ message: "Service not found" });
		}
		
		// vendorId is optional - will be assigned by admin later
		let finalVendorId = null;
		
		// If vendor ID is provided and valid, verify it exists
		if (vendorId) {
			const vendor = await Vendor.findById(vendorId);
			if (vendor) {
				finalVendorId = vendorId;
				console.log('Vendor assigned at booking:', finalVendorId);
			} else {
				console.warn('Provided vendor ID not found, booking will be unassigned');
			}
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const newBooking = new Booking({
			userId,
			vendorId: finalVendorId || undefined, // undefined if no vendor assigned
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
			status: finalVendorId ? "pending" : "unassigned", // unassigned if no vendor
		});

		await newBooking.save();

		// Increment bookingCount for the associated service to keep "Most Booked" section accurate
		// This is non-blocking for the booking creation response; failures are logged but do not prevent booking success
		try {
			await Service.findByIdAndUpdate(serviceId, { $inc: { bookingCount: 1 } });
		} catch (incErr) {
			console.error(
				"Failed to increment service bookingCount:",
				incErr?.message || incErr
			);
		}

		// Populate the response
		const populatedBooking = await Booking.findById(newBooking._id)
			.populate("userId", "name email mobileNo")
			.populate("vendorId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		res.status(201).json({
			success: true,
			message: "Booking created successfully",
			booking: populatedBooking,
		});
	} catch (error) {
		console.error('Booking creation error:', error);
		res.status(400).json({
			message: "Failed to create booking",
			error: error.message,
			details: error.stack
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
			.populate("vendorId", "name email mobileNo imageUri rating")
			.populate("serviceId", "serviceName serviceType imageUrl")
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });

		const total = await Booking.countDocuments(filter);

		res.status(200).json({
			bookings,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch user bookings",
			error: error.message,
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
			.populate("userId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType imageUrl")
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });

		const total = await Booking.countDocuments(filter);

		res.status(200).json({
			bookings,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch vendor bookings",
			error: error.message,
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
			return res.status(404).json({ message: "Booking not found" });
		}

		if (booking.vendorId.toString() !== vendorId) {
			return res
				.status(403)
				.json({ message: "Not authorized to accept this booking" });
		}

		// Can accept if status is 'assigned' or 'pending'
		if (!['assigned', 'pending'].includes(booking.status)) {
			return res
				.status(400)
				.json({ message: `Booking cannot be accepted. Current status: ${booking.status}` });
		}

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{
				status: "accepted",
				vendorNotes: vendorNotes || "",
			},
			{ new: true }
		)
			.populate("userId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		res.status(200).json({
			message: "Booking accepted successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to accept booking",
			error: error.message,
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
			return res.status(404).json({ message: "Booking not found" });
		}

		if (booking.vendorId.toString() !== vendorId) {
			return res
				.status(403)
				.json({ message: "Not authorized to reject this booking" });
		}

		// Can reject if status is 'assigned' or 'pending'
		if (!['assigned', 'pending'].includes(booking.status)) {
			return res
				.status(400)
				.json({ message: `Booking cannot be rejected. Current status: ${booking.status}` });
		}

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{
				status: "unassigned", // Set back to unassigned for admin to reassign
				vendorId: null, // Remove vendor assignment
				cancellationReason: cancellationReason || "Rejected by partner",
				cancelledBy: "vendor",
			},
			{ new: true }
		)
			.populate("userId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		res.status(200).json({
			success: true,
			message: "Booking rejected. It will be reassigned by admin.",
			booking: updatedBooking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to reject booking",
			error: error.message,
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
			return res.status(404).json({ message: "Booking not found" });
		}

		if (booking.vendorId.toString() !== vendorId) {
			return res
				.status(403)
				.json({ message: "Not authorized to complete this booking" });
		}

		// Can only complete if accepted or in-progress
		if (!['accepted', 'in-progress'].includes(booking.status)) {
			return res
				.status(400)
				.json({ message: `Booking cannot be completed. Current status: ${booking.status}` });
		}

		// Check if payment is done (for cash, we assume it's done on completion)
		const paymentStatus = booking.paymentMethod === 'cash' ? 'paid' : booking.paymentStatus;

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{
				status: "completed",
				paymentStatus: paymentStatus,
				completionDate: new Date(),
			},
			{ new: true }
		)
			.populate("userId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		res.status(200).json({
			message: "Booking completed successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to complete booking",
			error: error.message,
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
			return res.status(404).json({ message: "Booking not found" });
		}

		if (booking.userId.toString() !== userId) {
			return res
				.status(403)
				.json({ message: "Not authorized to cancel this booking" });
		}

		// Allow cancellation for specific statuses only
		if (!["unassigned", "pending", "assigned", "accepted"].includes(booking.status)) {
			return res
				.status(400)
				.json({ message: `Booking cannot be cancelled. Current status: ${booking.status}` });
		}

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{
				status: "cancelled",
				cancellationReason: cancellationReason || "No reason provided",
				cancelledBy: "user",
			},
			{ new: true }
		)
			.populate("vendorId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		res.status(200).json({
			message: "Booking cancelled successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to cancel booking",
			error: error.message,
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
			return res.status(404).json({ message: "Booking not found" });
		}

		if (booking.userId.toString() !== userId) {
			return res
				.status(403)
				.json({ message: "Not authorized to rate this booking" });
		}

		if (booking.status !== "completed") {
			return res
				.status(400)
				.json({ message: "Can only rate completed bookings" });
		}

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{ rating, review },
			{ new: true }
		)
			.populate("vendorId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		res.status(200).json({
			message: "Rating and review added successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to add rating and review",
			error: error.message,
		});
	}
}

// Admin: Manually assign vendor to booking
export async function assignVendorToBooking(req, res) {
	try {
		const { bookingId } = req.params;
		const { vendorId } = req.body;

		// Verify booking exists
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ 
				success: false,
				message: "Booking not found" 
			});
		}

		// Verify vendor exists
		const vendor = await Vendor.findById(vendorId);
		if (!vendor) {
			return res.status(404).json({ 
				success: false,
				message: "Vendor not found" 
			});
		}

		// Update booking with new vendor
		booking.vendorId = vendorId;
		booking.status = "assigned"; // Update status to assigned
		await booking.save();

		// Return populated booking
		const updatedBooking = await Booking.findById(bookingId)
			.populate("userId", "name email mobileNo")
			.populate("vendorId", "name mobileNo email isVerify")
			.populate("serviceId", "title description price");

		res.json({
			success: true,
			message: "Vendor assigned successfully",
			data: { booking: updatedBooking }
		});
	} catch (error) {
		console.error("Error assigning vendor:", error);
		res.status(500).json({ 
			success: false,
			message: "Server error during vendor assignment" 
		});
	}
}

// Admin: Update booking status
export async function updateBookingStatus(req, res) {
	try {
		const { bookingId } = req.params;
		const { status, adminNote } = req.body;

		// Verify booking exists
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ 
				success: false,
				message: "Booking not found" 
			});
		}

		// Valid status transitions
		const validStatuses = ["pending", "assigned", "confirmed", "in-progress", "completed", "cancelled", "rejected"];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ 
				success: false,
				message: "Invalid status",
				validStatuses 
			});
		}

		// Update booking
		booking.status = status;
		if (adminNote) {
			booking.adminNote = adminNote;
		}
		await booking.save();

		// Return populated booking
		const updatedBooking = await Booking.findById(bookingId)
			.populate("userId", "name email mobileNo")
			.populate("vendorId", "name mobileNo email isVerify")
			.populate("serviceId", "title description price");

		res.json({
			success: true,
			message: "Booking status updated successfully",
			data: { booking: updatedBooking }
		});
	} catch (error) {
		console.error("Error updating booking status:", error);
		res.status(500).json({ 
			success: false,
			message: "Server error during status update" 
		});
	}
}
