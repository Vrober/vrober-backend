import HomeSection from "../models/homeSection.models.js";
import Service from "../models/services.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Get all home sections (public - for frontend)
export const getAllHomeSections = asyncHandler(async (req, res) => {
	const sections = await HomeSection.find({ isActive: true })
		.sort({ order: 1 })
		.lean();

	// Populate services for each section
	const populatedSections = await Promise.all(
		sections.map(async (section) => {
			let services = [];

			if (section.selectionMode === "manual") {
				// Get manually selected services
				services = await Service.find({ _id: { $in: section.services } })
					.populate("vendorId", "name email mobileNo")
					.limit(section.maxItems)
					.lean();
			} else {
				// Auto-filter services
				const filter = {};

				if (
					section.autoFilter?.field &&
					section.autoFilter?.value !== undefined
				) {
					filter[section.autoFilter.field] = section.autoFilter.value;
				}

				if (section.category) {
					filter.category = section.category;
				}

				// Sorting based on section type
				let sort = { createdAt: -1 };
				if (section.sectionType === "most-booked") {
					sort = { bookingCount: -1 };
				} else if (section.sectionType === "popular") {
					sort = { rating: -1, bookingCount: -1 };
				}

				services = await Service.find(filter)
					.populate("vendorId", "name email mobileNo")
					.sort(sort)
					.limit(section.maxItems)
					.lean();
			}

			return {
				...section,
				services,
			};
		})
	);

	res
		.status(200)
		.json(
			new ApiResponse(
				200,
				populatedSections,
				"Home sections fetched successfully"
			)
		);
});

// Get all sections (admin)
export const getHomeSectionsAdmin = asyncHandler(async (req, res) => {
	const sections = await HomeSection.find()
		.populate("services", "serviceName imageUrl price category")
		.sort({ order: 1 });

	res.status(200).json({
		success: true,
		count: sections.length,
		sections,
	});
});

// Get single section by ID
export const getHomeSectionById = asyncHandler(async (req, res) => {
	const section = await HomeSection.findById(req.params.id).populate(
		"services",
		"serviceName imageUrl price category"
	);

	if (!section) {
		throw new ApiError(404, "Home section not found");
	}

	res.status(200).json({
		success: true,
		section,
	});
});

// Create new home section (admin)
export const createHomeSection = asyncHandler(async (req, res) => {
	const {
		name,
		displayName,
		sectionType,
		displayStyle,
		order,
		isActive,
		selectionMode,
		autoFilter,
		services,
		maxItems,
		category,
		settings,
		description,
	} = req.body;

	// Check if section with same name exists
	const existingSection = await HomeSection.findOne({ name });
	if (existingSection) {
		throw new ApiError(400, "Section with this name already exists");
	}

	const section = await HomeSection.create({
		name,
		displayName,
		sectionType,
		displayStyle,
		order,
		isActive,
		selectionMode,
		autoFilter,
		services,
		maxItems,
		category,
		settings,
		description,
	});

	res.status(201).json({
		success: true,
		message: "Home section created successfully",
		section,
	});
});

// Update home section (admin)
export const updateHomeSection = asyncHandler(async (req, res) => {
	const section = await HomeSection.findById(req.params.id);

	if (!section) {
		throw new ApiError(404, "Home section not found");
	}

	// Update fields
	Object.keys(req.body).forEach((key) => {
		section[key] = req.body[key];
	});

	await section.save();

	res.status(200).json({
		success: true,
		message: "Home section updated successfully",
		section,
	});
});

// Delete home section (admin)
export const deleteHomeSection = asyncHandler(async (req, res) => {
	const section = await HomeSection.findById(req.params.id);

	if (!section) {
		throw new ApiError(404, "Home section not found");
	}

	await section.deleteOne();

	res.status(200).json({
		success: true,
		message: "Home section deleted successfully",
	});
});

// Toggle section active status (admin)
export const toggleSectionStatus = asyncHandler(async (req, res) => {
	const section = await HomeSection.findById(req.params.id);

	if (!section) {
		throw new ApiError(404, "Home section not found");
	}

	section.isActive = !section.isActive;
	await section.save();

	res.status(200).json({
		success: true,
		message: `Section ${section.isActive ? "activated" : "deactivated"} successfully`,
		section,
	});
});

// Reorder sections (admin)
export const reorderSections = asyncHandler(async (req, res) => {
	const { sectionIds } = req.body; // Array of section IDs in desired order

	if (!Array.isArray(sectionIds)) {
		throw new ApiError(400, "sectionIds must be an array");
	}

	// Update order for each section
	await Promise.all(
		sectionIds.map((id, index) =>
			HomeSection.findByIdAndUpdate(id, { order: index })
		)
	);

	res.status(200).json({
		success: true,
		message: "Sections reordered successfully",
	});
});

// Get services for a specific filter (helper for admin UI)
export const getServicesForFilter = asyncHandler(async (req, res) => {
	const { field, value, category, limit = 20 } = req.query;

	const filter = {};

	if (field && value !== undefined) {
		// Convert string booleans
		if (value === "true") filter[field] = true;
		else if (value === "false") filter[field] = false;
		else filter[field] = value;
	}

	if (category) {
		filter.category = category;
	}

	const services = await Service.find(filter)
		.select(
			"serviceName imageUrl price category isPopular isPremium isMostBooked bookingCount"
		)
		.limit(parseInt(limit))
		.lean();

	res.status(200).json({
		success: true,
		count: services.length,
		services,
	});
});
