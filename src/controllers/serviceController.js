// Corrected model import paths (previously pointed to non-existing filenames)
import Service from "../models/services.models.js";
import Vendor from "../models/vendor.models.js";

// Get all services (Public)
export async function getAllServices(req, res) {
	try {
		const {
			page = 1,
			limit = 10,
			serviceType,
			vendorId,
			location,
			category,
			popular,
			premium,
			sortBy,
		} = req.query;

		const filter = {};

		if (serviceType) {
			filter.serviceType = serviceType;
		}
		if (category) {
			filter.category = category;
		}
		if (popular === "true") {
			filter.isPopular = true;
		}
		if (premium === "true") {
			filter.isPremium = true;
		}

		if (vendorId) {
			filter.vendorId = vendorId;
		}

		// If location is provided, you can add geospatial queries here
		// For now, we'll just return all services

		// Determine sort order
		let sortOrder = { rating: -1, createdAt: -1 };
		if (sortBy === 'bookingCount') {
			sortOrder = { bookingCount: -1, rating: -1 };
			filter.bookingCount = { $gt: 0 }; // Only show services with bookings
		}

		const services = await Service.find(filter)
			.populate(
				"vendorId",
				"name email mobileNo imageUri rating isVerify experience"
			)
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort(sortOrder);

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

// Get service by ID (Public)
export async function getServiceById(req, res) {
	try {
		const { id } = req.params;

		const service = await Service.findById(id)
			.populate(
				"vendorId",
				"name email mobileNo imageUri rating isVerify experience toolsAvailable"
			)
			.populate("reviews.userId", "name");

		if (!service) {
			return res.status(404).json({ message: "Service not found" });
		}

		res.status(200).json({ service });
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch service",
			error: error.message,
		});
	}
}

// Get services by vendor (Public)
export async function getServicesByVendor(req, res) {
	try {
		const { vendorId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		// Verify vendor exists
		const vendor = await Vendor.findById(vendorId);
		if (!vendor) {
			return res.status(404).json({ message: "Vendor not found" });
		}

		const services = await Service.find({ vendorId })
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ rating: -1, createdAt: -1 });

		const total = await Service.countDocuments({ vendorId });

		res.status(200).json({
			services,
			vendor: {
				name: vendor.name,
				rating: vendor.rating,
				isVerify: vendor.isVerify,
				experience: vendor.experience,
			},
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch vendor services",
			error: error.message,
		});
	}
}

// Search services (Public)
export async function searchServices(req, res) {
	try {
		const { q, serviceType, minRating, maxPrice, category, popular, premium } =
			req.query;
		const { page = 1, limit = 10 } = req.query;

		const filter = {};

		if (q) {
			filter.$or = [
				{ serviceName: { $regex: q, $options: "i" } },
				{ description: { $regex: q, $options: "i" } },
			];
		}

		if (serviceType) {
			filter.serviceType = serviceType;
		}
		if (category) {
			filter.category = category;
		}
		if (popular === "true") {
			filter.isPopular = true;
		}
		if (premium === "true") {
			filter.isPremium = true;
		}

		if (minRating) {
			filter.rating = { $gte: parseFloat(minRating) };
		}

		const services = await Service.find(filter)
			.populate(
				"vendorId",
				"name email mobileNo imageUri rating isVerify experience"
			)
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ rating: -1, createdAt: -1 });

		const total = await Service.countDocuments(filter);

		res.status(200).json({
			services,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			total,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to search services",
			error: error.message,
		});
	}
}

// Get distinct high-level categories (Public)
export async function getDistinctCategories(req, res) {
	try {
		// Return only non-empty category strings
		const categories = await Service.distinct("category", {
			category: { $exists: true, $ne: "" },
		});
		res.status(200).json({ categories });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch categories", error: error.message });
	}
}

// Lightweight search suggestions (names only)
export async function getSearchSuggestions(req, res) {
	try {
		const { q = "", limit = 5 } = req.query;
		if (!q || String(q).trim().length === 0) {
			return res.status(200).json({ suggestions: [] });
		}
		const regex = new RegExp(String(q).trim(), "i");
		const docs = await Service.find({ serviceName: { $regex: regex } })
			.select("serviceName _id price")
			.limit(parseInt(limit))
			.sort({ bookingCount: -1, rating: -1 });
		const suggestions = docs.map((d) => ({
			id: d._id,
			name: d.serviceName,
			price: d.price,
		}));
		res.status(200).json({ suggestions });
	} catch (error) {
		res
			.status(500)
			.json({ message: "Failed to fetch suggestions", error: error.message });
	}
}

// Home sections: popular, premium, most booked
export async function getHomeSections(req, res) {
	try {
		const { limit = 10 } = req.query;
		const lim = parseInt(limit) || 10;

		const [popular, premium, mostBooked] = await Promise.all([
			Service.find({ isPopular: true })
				.limit(lim)
				.sort({ rating: -1, createdAt: -1 }),
			Service.find({ isPremium: true })
				.limit(lim)
				.sort({ rating: -1, createdAt: -1 }),
			Service.find({ bookingCount: { $gt: 0 } })
				.limit(lim)
				.sort({ bookingCount: -1, rating: -1 }),
		]);

		res.status(200).json({ popular, premium, mostBooked });
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch home sections",
			error: error.message,
		});
	}
}
