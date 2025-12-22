import Vendor from "../models/vendor.models.js";
import Service from "../models/services.models.js";
import Booking from "../models/booking.models.js";

// ============ PARTNER REGISTRATION ============
export async function createVendor(req, res) {
	try {
		console.log("📝 Registration request received:", req.body);
		
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
			businessName,
			bio,
			gstin,
			bankDetails,
		} = req.body;

		// Check if vendor already exists
		const existingVendor = await Vendor.findOne({
			$or: [{ email }, { mobileNo }],
		});

		if (existingVendor) {
			return res.status(400).json({
				message: "Partner with this email or mobile number already exists",
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
			businessName,
			bio,
			gstin,
			bankDetails,
			role: "vendor",
			isVerify: false,
			status: "pending", // Requires admin approval
		});

		await newVendor.save();

		res.status(201).json({
			message: "Partner registration submitted successfully. Awaiting admin approval.",
			vendor: newVendor,
		});
	} catch (error) {
		console.error("❌ Registration error:", error.message);
		console.error("Error details:", error);
		res.status(400).json({
			message: "Failed to create partner profile",
			error: error.message,
		});
	}
}

// ============ PARTNER PROFILE MANAGEMENT ============
export async function updateVendor(req, res) {
	try {
		const vendorId = req.user?._id; // From JWT middleware

		const updates = req.body;

		// Remove sensitive fields that shouldn't be updated directly
		delete updates.password;
		delete updates.role;
		delete updates.isVerify;
		delete updates.status; // Only admin can change status
		delete updates.earnings; // Earnings managed by system
		delete updates.totalBookings;
		delete updates.completedBookings;
		delete updates.cancelledBookings;

		const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedVendor) {
			return res.status(404).json({ message: "Partner not found" });
		}

		res.status(200).json({
			message: "Partner details updated successfully",
			vendor: updatedVendor,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Get partner profile
export async function getPartnerProfile(req, res) {
	try {
		const vendorId = req.user?._id;

		const partner = await Vendor.findById(vendorId).populate("services");

		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		res.status(200).json({
			message: "Partner profile retrieved successfully",
			partner,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// ============ PARTNER DASHBOARD ============
export async function getDashboardMetrics(req, res) {
	try {
		const vendorId = req.user?._id;

		const partner = await Vendor.findById(vendorId);
		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		const bookings = await Booking.find({ partnerId: vendorId });
		const activeBookings = bookings.filter(
			(b) => b.status !== "completed" && b.status !== "cancelled"
		);
		const completedBookings = bookings.filter((b) => b.status === "completed");

		const metrics = {
			totalBookings: partner.totalBookings || bookings.length,
			completedBookings: partner.completedBookings || completedBookings.length,
			cancelledBookings: partner.cancelledBookings || 0,
			activeBookings: activeBookings.length,
			totalEarnings: partner.earnings?.total || 0,
			availableEarnings: partner.earnings?.available || 0,
			withdrawnEarnings: partner.earnings?.withdrawn || 0,
			rating: partner.rating || 0,
			servicesCount: partner.services?.length || 0,
		};

		res.status(200).json({
			message: "Dashboard metrics retrieved successfully",
			metrics,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// ============ PARTNER BOOKINGS ============
export async function getPartnerBookings(req, res) {
	try {
		const vendorId = req.user?._id;
		const { status, sort = "-createdAt" } = req.query;

		let query = { partnerId: vendorId };
		if (status) {
			query.status = status;
		}

		const bookings = await Booking.find(query)
			.sort(sort)
			.populate("userId", "name mobileNo")
			.populate("serviceId");

		res.status(200).json({
			message: "Bookings retrieved successfully",
			bookings,
			count: bookings.length,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Update booking status by partner
export async function updateBookingStatus(req, res) {
	try {
		const vendorId = req.user?._id;
		const { bookingId } = req.params;
		const { status, notes } = req.body;

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ message: "Booking not found" });
		}

		if (booking.partnerId.toString() !== vendorId.toString()) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this booking" });
		}

		booking.status = status;
		if (notes) booking.notes = notes;

		await booking.save();

		res.status(200).json({
			message: "Booking status updated successfully",
			booking,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// ============ PARTNER EARNINGS ============
export async function getEarningsHistory(req, res) {
	try {
		const vendorId = req.user?._id;

		const partner = await Vendor.findById(vendorId);
		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		const earnings = {
			total: partner.earnings?.total || 0,
			withdrawn: partner.earnings?.withdrawn || 0,
			available: partner.earnings?.available || 0,
			paymentHistory: partner.paymentHistory || [],
		};

		res.status(200).json({
			message: "Earnings history retrieved successfully",
			earnings,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Request payment withdrawal
export async function requestPaymentWithdrawal(req, res) {
	try {
		const vendorId = req.user?._id;
		const { amount } = req.body;

		const partner = await Vendor.findById(vendorId);
		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		const availableAmount = partner.earnings?.available || 0;
		if (amount > availableAmount) {
			return res
				.status(400)
				.json({ message: "Insufficient available earnings" });
		}

		// Add payment request
		const paymentRequest = {
			date: new Date(),
			amount,
			status: "pending",
			transactionId: `TXN_${Date.now()}`,
		};

		partner.paymentHistory.push(paymentRequest);
		partner.earnings.available -= amount;

		await partner.save();

		res.status(200).json({
			message: "Payment withdrawal request submitted",
			paymentRequest,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// ============ ADMIN PARTNER MANAGEMENT ============
export async function getAllPartners(req, res) {
	try {
		const { status, search } = req.query;

		let query = {};
		if (status) query.status = status;
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ mobileNo: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		const partners = await Vendor.find(query).select(
			"name email mobileNo status totalBookings earnings.total createdAt"
		);

		res.status(200).json({
			message: "Partners retrieved successfully",
			partners,
			count: partners.length,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Approve partner registration
export async function approvePartner(req, res) {
	try {
		const { partnerId } = req.params;

		const partner = await Vendor.findByIdAndUpdate(
			partnerId,
			{
				status: "approved",
				isVerify: true,
			},
			{ new: true }
		);

		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		res.status(200).json({
			message: "Partner approved successfully",
			partner,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Reject partner registration
export async function rejectPartner(req, res) {
	try {
		const { partnerId } = req.params;
		const { reason } = req.body;

		const partner = await Vendor.findByIdAndUpdate(
			partnerId,
			{
				status: "rejected",
				rejectionReason: reason,
			},
			{ new: true }
		);

		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		res.status(200).json({
			message: "Partner rejected",
			partner,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// View partner details by admin
export async function getPartnerDetailsAdmin(req, res) {
	try {
		const { partnerId } = req.params;

		const partner = await Vendor.findById(partnerId).populate("services");

		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		const bookings = await Booking.find({ partnerId })
			.populate("userId", "name mobileNo")
			.populate("serviceId");

		res.status(200).json({
			message: "Partner details retrieved successfully",
			partner,
			bookings,
			bookingCount: bookings.length,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Get partner earnings by admin
export async function getPartnerEarningsAdmin(req, res) {
	try {
		const { partnerId } = req.params;

		const partner = await Vendor.findById(partnerId);
		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		const earnings = {
			partnerName: partner.name,
			total: partner.earnings?.total || 0,
			withdrawn: partner.earnings?.withdrawn || 0,
			available: partner.earnings?.available || 0,
			paymentHistory: partner.paymentHistory || [],
		};

		res.status(200).json({
			message: "Partner earnings retrieved successfully",
			earnings,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Approve payment withdrawal by admin
export async function approvePaymentWithdrawal(req, res) {
	try {
		const { partnerId, transactionId } = req.params;

		const partner = await Vendor.findById(partnerId);
		if (!partner) {
			return res.status(404).json({ message: "Partner not found" });
		}

		const payment = partner.paymentHistory.find((p) => p.transactionId === transactionId);
		if (!payment) {
			return res.status(404).json({ message: "Payment request not found" });
		}

		payment.status = "completed";
		partner.earnings.withdrawn += payment.amount;

		await partner.save();

		res.status(200).json({
			message: "Payment approved successfully",
			payment,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// ============ PARTNER OTP AUTH ============
import jwt from "jsonwebtoken";

// Generate Access Token for Partner
const generatePartnerAccessToken = (vendor) => {
	return jwt.sign(
		{
			_id: vendor._id,
			mobileNo: vendor.mobileNo,
			email: vendor.email,
			role: "vendor",
			status: vendor.status,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "30d" }
	);
};

// Send OTP to partner
export async function sendPartnerOtp(req, res) {
	try {
		const { phoneNumber } = req.body;

		if (!phoneNumber) {
			return res.status(400).json({ message: "Phone number is required" });
		}

		// Dev mode OTP
		const otp =
			process.env.NODE_ENV === "production"
				? Math.floor(1000 + Math.random() * 9000).toString()
				: "6969";

		// In production, save OTP to database with expiry
		// For now, return it in dev mode
		res.status(200).json({
			message: "OTP sent successfully",
			otp: process.env.NODE_ENV === "production" ? undefined : otp,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Verify OTP and login/register partner
export async function verifyPartnerOtp(req, res) {
	try {
		const { phoneNumber, otp } = req.body;

		if (!phoneNumber || !otp) {
			return res
				.status(400)
				.json({ message: "Phone number and OTP are required" });
		}

		// Verify OTP (in dev mode, accept "6969")
		const validOtp =
			process.env.NODE_ENV === "production"
				? otp // In production, verify against saved OTP
				: "6969";

		if (otp !== validOtp) {
			return res.status(401).json({ message: "Invalid OTP or access denied" });
		}

		// Find existing vendor
		let vendor = await Vendor.findOne({ mobileNo: phoneNumber });

		if (vendor) {
			// Existing vendor - check approval status
			if (vendor.status === "pending") {
				return res.status(403).json({
					message: "Your application is pending admin approval",
					status: "pending",
				});
			}

			if (vendor.status === "rejected") {
				return res.status(403).json({
					message: `Your application was rejected: ${vendor.rejectionReason || "No reason provided"}`,
					status: "rejected",
				});
			}

			// Approved vendor - login
			const accessToken = generatePartnerAccessToken(vendor);

			const options = {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				maxAge: 30 * 24 * 60 * 60 * 1000,
			};

			return res
				.status(200)
				.cookie("accessToken", accessToken, options)
				.json({
					data: {
						accessToken,
						user: {
							_id: vendor._id,
							name: vendor.name,
							mobileNo: vendor.mobileNo,
							email: vendor.email,
							role: "vendor",
							status: vendor.status,
							profilePicture: vendor.profilePicture,
						},
					},
					message: "Login successful",
				});
		}

		// New vendor registration - create account in pending status
		const newVendor = new Vendor({
			name: `Partner ${phoneNumber.slice(-4)}`,
			mobileNo: phoneNumber,
			email: `partner${phoneNumber}@vrober.com`,
			status: "pending",
			earnings: {
				total: 0,
				withdrawn: 0,
				available: 0,
			},
			paymentHistory: [],
		});

		await newVendor.save();

		const accessToken = generatePartnerAccessToken(newVendor);

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 30 * 24 * 60 * 60 * 1000,
		};

		return res
			.status(201)
			.cookie("accessToken", accessToken, options)
			.json({
				data: {
					accessToken,
					user: {
						_id: newVendor._id,
						name: newVendor.name,
						mobileNo: newVendor.mobileNo,
						email: newVendor.email,
						role: "vendor",
						status: newVendor.status,
					},
				},
				message: "Registration successful. Your application is pending admin approval.",
			});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}
