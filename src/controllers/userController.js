import User from "../models/user.models.js";
import Booking from "../models/booking.models.js";

// Create user profile
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
			role: "user",
		});

		await newUser.save();

		res.status(201).json({
			message: "User profile created successfully",
			user: newUser,
		});
	} catch (error) {
		res.status(400).json({
			message: "Failed to create user profile",
			error: error.message,
		});
	}
}

// Update user details
export async function updateUser(req, res) {
	try {
		const userId = req.user?._id; // From JWT middleware

		const updates = req.body;

		// Remove sensitive fields that shouldn't be updated directly
		delete updates.password;
		delete updates.role;

		const updatedUser = await User.findByIdAndUpdate(userId, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({
			message: "User details updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}

// Get current authenticated user's profile with basic stats
export async function getMe(req, res) {
	try {
		const userId = req.user?._id;
		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const user = await User.findById(userId).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Derived stats
		const [orders, ratingAgg, spendAgg] = await Promise.all([
			Booking.countDocuments({ userId }),
			Booking.aggregate([
				{ $match: { userId, rating: { $exists: true, $ne: null } } },
				{ $group: { _id: null, avgRating: { $avg: "$rating" } } },
			]),
			Booking.aggregate([
				{ $match: { userId, status: { $in: ["accepted", "completed"] } } },
				{ $group: { _id: null, total: { $sum: { $ifNull: ["$price", 0] } } } },
			]),
		]);

		const avgRating = ratingAgg?.[0]?.avgRating || 0;
		const totalSpend = spendAgg?.[0]?.total || 0;
		// Simple points heuristic: 1 point per ₹10 spent
		const points = Math.round(totalSpend / 10);

		res.status(200).json({
			user,
			stats: {
				orders,
				avgRating,
				points,
			},
		});
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch profile", error: error.message });
	}
}
