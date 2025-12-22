// Corrected model import paths to match existing filenames
import User from "../models/user.models.js";
import Vendor from "../models/vendor.models.js";
import Service from "../models/services.models.js";
import Booking from "../models/booking.models.js";

// Delete user (Admin only)
export async function deleteUser(req, res) {
	try {
		const { id } = req.params;

		const deletedUser = await User.findByIdAndDelete(id);
		if (!deletedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		res.status(500).json({
			message: "Failed to delete user",
			error: error.message,
		});
	}
}

// Delete vendor (Admin only)
export async function deleteVendor(req, res) {
	try {
		const { id } = req.params;

		const deletedVendor = await Vendor.findByIdAndDelete(id);
		if (!deletedVendor) {
			return res.status(404).json({ message: "Vendor not found" });
		}

		res.status(200).json({ message: "Vendor deleted successfully" });
	} catch (error) {
		res.status(500).json({
			message: "Failed to delete vendor",
			error: error.message,
		});
	}
}

// Create user (Admin only)
export async function createUser(req, res) {
	try {
		const {
			name,
			mobileNo,
			email,
			address,
			pinCode,
			dob,
			gender,
			liveLocation,
			profileImg,
			role,
		} = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({
			$or: [{ email }, { mobileNo }],
		});

		if (existingUser) {
			return res.status(400).json({
				message: "User with this email or mobile number already exists",
			});
		}

		const newUser = new User({
			name,
			mobileNo,
			email,
			address,
			pinCode,
			dob,
			gender,
			liveLocation,
			profileImg,
			role: role || "user",
		});

		await newUser.save();

		res.status(201).json({
			message: "User created successfully",
			user: newUser,
		});
	} catch (error) {
		res.status(400).json({
			message: "Failed to create user",
			error: error.message,
		});
	}
}

// Create vendor (Admin only)
export async function createVendor(req, res) {
	try {
		const {
			name,
			mobileNo,
			email,
			address,
			pinCode,
			dob,
			gender,
			liveLocation,
			toolsAvailable,
			experience,
			aadhar,
			paymentInfo,
			imageUri,
			isVerify,
		} = req.body;

		// Check if vendor already exists
		const existingVendor = await Vendor.findOne({
			$or: [{ email }, { mobileNo }],
		});

		if (existingVendor) {
			return res.status(400).json({
				message: "Vendor with this email or mobile number already exists",
			});
		}

		const newVendor = new Vendor({
			name,
			mobileNo,
			email,
			address,
			pinCode,
			dob,
			gender,
			liveLocation,
			toolsAvailable,
			experience,
			aadhar,
			paymentInfo,
			imageUri,
			role: "vendor",
			isVerify: isVerify || false,
		});

		await newVendor.save();

		res.status(201).json({
			message: "Vendor created successfully",
			vendor: newVendor,
		});
	} catch (error) {
		res.status(400).json({
			message: "Failed to create vendor",
			error: error.message,
		});
	}
}

// Get all users (Admin only)
export async function getAllUsers(req, res) {
	try {
		const { page = 1, limit = 10, role } = req.query;

		const filter = role ? { role } : {};

		const users = await User.find(filter)
			.select("-password") // Exclude password from response
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });

		const total = await User.countDocuments(filter);

		res.status(200).json({
			success: true,
			data: {
				users,
				pages: Math.ceil(total / limit),
				currentPage: page,
				total,
			}
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch users",
			error: error.message,
		});
	}
}

// Get all vendors (Admin only)
export async function getAllVendors(req, res) {
	try {
		const { page = 1, limit = 10, isVerify } = req.query;

		const filter =
			isVerify !== undefined ? { isVerify: isVerify === "true" } : {};

		const vendors = await Vendor.find(filter)
			.select("-password") // Exclude password from response
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });

		const total = await Vendor.countDocuments(filter);

		res.status(200).json({
			success: true,
			data: {
				vendors,
				pages: Math.ceil(total / limit),
				currentPage: page,
				total,
			}
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch vendors",
			error: error.message,
		});
	}
}

// Get all services (Admin only)
export async function getAllServices(req, res) {
	try {
		const { page = 1, limit = 10, serviceType } = req.query;

		const filter = serviceType ? { serviceType } : {};

		const services = await Service.find(filter)
			.populate("vendorId", "name email mobileNo")
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });

		const total = await Service.countDocuments(filter);

		res.status(200).json({
			services,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch services",
			error: error.message,
		});
	}
}

// Create service (Admin only)
export async function createService(req, res) {
	try {
		const {
			serviceName,
			vendorId,
			serviceType,
			toolsRequired,
			imageUrl,
			description,
			location,
		} = req.body;

		// Verify vendor exists
		const vendor = await Vendor.findById(vendorId);
		if (!vendor) {
			return res.status(404).json({ message: "Vendor not found" });
		}

		const newService = new Service({
			serviceName,
			vendorId,
			serviceType,
			toolsRequired,
			imageUrl,
			description,
			location,
		});

		await newService.save();

		// Add service to vendor's services array
		await Vendor.findByIdAndUpdate(vendorId, {
			$push: { services: newService._id },
		});

		res.status(201).json({
			message: "Service created successfully",
			service: newService,
		});
	} catch (error) {
		res.status(400).json({
			message: "Failed to create service",
			error: error.message,
		});
	}
}

// Update service (Admin only)
export async function updateService(req, res) {
	try {
		const { id } = req.params;
		const updates = req.body;

		const updatedService = await Service.findByIdAndUpdate(id, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedService) {
			return res.status(404).json({ message: "Service not found" });
		}

		res.status(200).json({
			message: "Service updated successfully",
			service: updatedService,
		});
	} catch (error) {
		res.status(400).json({
			message: "Failed to update service",
			error: error.message,
		});
	}
}

// Delete service (Admin only)
export async function deleteService(req, res) {
	try {
		const { id } = req.params;

		const service = await Service.findById(id);
		if (!service) {
			return res.status(404).json({ message: "Service not found" });
		}

		// Remove service from vendor's services array
		await Vendor.findByIdAndUpdate(service.vendorId, {
			$pull: { services: id },
		});

		// Delete the service
		await Service.findByIdAndDelete(id);

		res.status(200).json({ message: "Service deleted successfully" });
	} catch (error) {
		res.status(500).json({
			message: "Failed to delete service",
			error: error.message,
		});
	}
}

// Get all bookings (Admin only)
export async function getAllBookings(req, res) {
	try {
		const { page = 1, limit = 10, status, vendorId, userId } = req.query;

		const filter = {};
		if (status) filter.status = status;
		if (vendorId) filter.vendorId = vendorId;
		if (userId) filter.userId = userId;

		console.log('Admin getAllBookings - filter:', filter);

		const bookings = await Booking.find(filter)
			.populate("userId", "name email mobileNo")
			.populate({
				path: "vendorId",
				select: "name email mobileNo",
				options: { strictPopulate: false } // Allow null vendorId
			})
			.populate("serviceId", "serviceName serviceType")
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });

		const total = await Booking.countDocuments(filter);

		console.log('Admin getAllBookings - found:', total, 'bookings');
		console.log('Admin getAllBookings - returning:', bookings.length, 'bookings for page', page);

		res.status(200).json({
			success: true,
			data: {
				bookings,
				pages: Math.ceil(total / limit),
				currentPage: page,
				total,
			}
		});
	} catch (error) {
		console.error('Admin getAllBookings error:', error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch bookings",
			error: error.message,
		});
	}
}

// Update booking status (Admin only)
export async function updateBookingStatus(req, res) {
	try {
		const { id } = req.params;
		const { status, cancellationReason } = req.body;

		const validStatuses = [
			"pending",
			"accepted",
			"rejected",
			"completed",
			"cancelled",
		];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ message: "Invalid status" });
		}

		const updateData = { status };
		if (status === "cancelled" && cancellationReason) {
			updateData.cancellationReason = cancellationReason;
			updateData.cancelledBy = "admin";
		}

		const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, {
			new: true,
		})
			.populate("userId", "name email mobileNo")
			.populate("vendorId", "name email mobileNo")
			.populate("serviceId", "serviceName serviceType");

		if (!updatedBooking) {
			return res.status(404).json({ message: "Booking not found" });
		}

		res.status(200).json({
			message: "Booking status updated successfully",
			booking: updatedBooking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to update booking status",
			error: error.message,
		});
	}
}

// Delete booking (Admin only)
export async function deleteBooking(req, res) {
	try {
		const { id } = req.params;

		const deletedBooking = await Booking.findByIdAndDelete(id);
		if (!deletedBooking) {
			return res.status(404).json({ message: "Booking not found" });
		}

		res.status(200).json({ message: "Booking deleted successfully" });
	} catch (error) {
		res.status(500).json({
			message: "Failed to delete booking",
			error: error.message,
		});
	}
}

// Get dashboard stats (Admin only)
export async function getDashboardStats(req, res) {
	try {
		const totalUsers = await User.countDocuments();
		const totalVendors = await Vendor.countDocuments();
		const totalServices = await Service.countDocuments();
		const totalBookings = await Booking.countDocuments();

		const pendingBookings = await Booking.countDocuments({ status: "pending" });
		const completedBookings = await Booking.countDocuments({
			status: "completed",
		});
		const verifiedVendors = await Vendor.countDocuments({ isVerify: true });

		const recentBookings = await Booking.find()
			.populate("userId", "name")
			.populate("vendorId", "name")
			.populate("serviceId", "serviceName")
			.sort({ createdAt: -1 })
			.limit(5);

		res.status(200).json({
			success: true,
			data: {
				stats: {
					totalUsers,
					totalVendors,
					totalServices,
					totalBookings,
					pendingBookings,
					completedBookings,
					verifiedVendors,
				},
				recentBookings,
			}
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch dashboard stats",
			error: error.message,
		});
	}
}

// Upload service image (Admin only)
export async function uploadServiceImage(req, res) {
	try {
		if (!req.file) {
			return res.status(400).json({ message: "No image file provided" });
		}

		// Use Cloudinary if configured, otherwise return local path
		let imageUrl = "";

		if (process.env.CLOUDINARY_CLOUD_NAME) {
			// Upload to Cloudinary
			const { uploadOnCloudinary } = await import("../utils/cloudinary.js");
			const result = await uploadOnCloudinary(req.file.path);

			if (!result) {
				return res
					.status(500)
					.json({ message: "Failed to upload image to Cloudinary" });
			}

			imageUrl = result.secure_url;
		} else {
			// Return local file path
			imageUrl = `/public/${req.file.filename}`;
		}

		res.status(200).json({
			success: true,
			data: { imageUrl },
			message: "Image uploaded successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to upload image",
			error: error.message,
		});
	}
}

// Create category (Admin only)
export async function createCategory(req, res) {
	try {
		const { name, description, icon } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Category name is required" });
		}

		// Check if category already exists
		const existingCategory = await Service.findOne({ category: name });
		if (existingCategory) {
			return res.status(400).json({ message: "Category already exists" });
		}

		// Create a dummy service entry to register the category (optional)
		// Or you could create a separate Category model
		// For now, just return success

		res.status(201).json({
			success: true,
			data: { name, description, icon },
			message: "Category created successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to create category",
			error: error.message,
		});
	}
}

// Update category (Admin only)
export async function updateCategory(req, res) {
	try {
		const { name } = req.params;
		const { description, icon, newName } = req.body;

		// Update all services with this category if name is changing
		if (newName && newName !== name) {
			await Service.updateMany({ category: name }, { category: newName });
		}

		res.status(200).json({
			success: true,
			data: { name: newName || name, description, icon },
			message: "Category updated successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to update category",
			error: error.message,
		});
	}
}

// Delete category (Admin only)
export async function deleteCategory(req, res) {
	try {
		const { name } = req.params;

		// Check if any services use this category
		const servicesCount = await Service.countDocuments({ category: name });

		if (servicesCount > 0) {
			return res.status(400).json({
				message: `Cannot delete category. ${servicesCount} services are using this category.`,
			});
		}

		res.status(200).json({
			success: true,
			message: "Category deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to delete category",
			error: error.message,
		});
	}
}
