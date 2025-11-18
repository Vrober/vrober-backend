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

		// Verify service exists and get vendor info
		const service = await Service.findById(serviceId).populate('vendorId');
		if (!service) {
			return res.status(404).json({ message: "Service not found" });
		}
		
		// Use vendorId from request or from service, or create a default vendor
		let finalVendorId = vendorId || service.vendorId?._id || service.vendorId;
		
		// If no vendor ID found, try to find any vendor or create a default booking vendor
		if (!finalVendorId) {
			console.log('No vendor ID provided, looking for available vendors...');
			
			// Try to find any existing verified vendor
			let availableVendor = await Vendor.findOne({ isVerify: true });
			
			if (!availableVendor) {
				// If no verified vendor, find any vendor
				availableVendor = await Vendor.findOne();
			}
			
			if (!availableVendor) {
				// Create a default vendor for bookings if none exists
				try {
					availableVendor = new Vendor({
						name: "Vrober Service Provider",
						mobileNo: "9999999999",
						email: "vendor@vrober.com",
						address: "Service Center",
						pinCode: "000000",
						isVerify: true,
						services: [],
						role: "vendor"
					});
					await availableVendor.save();
					console.log('Created default vendor for booking system:', availableVendor._id);
				} catch (vendorError) {
					console.error('Failed to create default vendor:', vendorError);
					return res.status(500).json({ 
						message: "Unable to assign vendor for booking",
						error: vendorError.message 
					});
				}
			}
			
			finalVendorId = availableVendor._id;
			console.log('Assigned vendor:', finalVendorId);
		}

		// Verify vendor exists (should exist now due to fallback)
		const vendor = await Vendor.findById(finalVendorId);
		if (!vendor) {
			console.error('Vendor verification failed for ID:', finalVendorId);
			return res.status(404).json({ 
				message: "Vendor not found after fallback creation",
				vendorId: finalVendorId 
			});
		}

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const newBooking = new Booking({
			userId,
			vendorId: finalVendorId,
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
			status: "pending",
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

		if (booking.status !== "pending") {
			return res
				.status(400)
				.json({ message: "Booking is not in pending status" });
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

		if (booking.status !== "pending") {
			return res
				.status(400)
				.json({ message: "Booking is not in pending status" });
		}

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{
				status: "rejected",
				cancellationReason: cancellationReason || "No reason provided",
				cancelledBy: "vendor",
			},
			{ new: true }
		)
			.populate("userId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		res.status(200).json({
			message: "Booking rejected successfully",
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

		if (booking.status !== "accepted") {
			return res
				.status(400)
				.json({ message: "Booking must be accepted before completion" });
		}

		const updatedBooking = await Booking.findByIdAndUpdate(
			id,
			{
				status: "completed",
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

		if (!["pending", "accepted"].includes(booking.status)) {
			return res
				.status(400)
				.json({ message: "Booking cannot be cancelled in current status" });
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
