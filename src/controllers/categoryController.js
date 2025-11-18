import Category from "../models/category.models.js";
import Service from "../models/services.models.js";
import { uplodOnCloudinary } from "../utils/cloudinary.js";

// Get all categories (Public)
export async function getAllCategories(req, res) {
	try {
		const { isActive } = req.query;
		const filter = {};

		if (isActive !== undefined) {
			filter.isActive = isActive === "true";
		}

		const categories = await Category.find(filter).sort({
			order: 1,
			displayName: 1,
		});

		res.status(200).json({
			success: true,
			count: categories.length,
			categories,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch categories",
			error: error.message,
		});
	}
}

// Get category by ID or name (Public)
export async function getCategoryById(req, res) {
	try {
		const { id } = req.params;

		// Try to find by ID first, then by name
		let category = await Category.findById(id);
		if (!category) {
			category = await Category.findOne({ name: id });
		}

		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		// Get services in this category
		const services = await Service.find({ category: category.name })
			.populate("vendorId", "name email mobileNo rating isVerify")
			.sort({ rating: -1, bookingCount: -1 });

		res.status(200).json({
			success: true,
			category,
			services,
			serviceCount: services.length,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to fetch category",
			error: error.message,
		});
	}
}

// Create category (Admin only)
export async function createCategory(req, res) {
	try {
		const { name, displayName, description, icon, order } = req.body;

		if (!name || !displayName) {
			return res.status(400).json({
				success: false,
				message: "Name and display name are required",
			});
		}

		// Check if category already exists
		const existingCategory = await Category.findOne({ name });
		if (existingCategory) {
			return res.status(400).json({
				success: false,
				message: "Category with this name already exists",
			});
		}

		// Handle image upload
		let imageUrl = "";
		if (req.file) {
			const uploadResult = await uplodOnCloudinary(req.file.path);
			if (uploadResult) {
				imageUrl = uploadResult.secure_url;
			}
		}

		if (!imageUrl) {
			return res.status(400).json({
				success: false,
				message: "Category image is required",
			});
		}

		const category = await Category.create({
			name,
			displayName,
			description,
			imageUrl,
			icon,
			order: order || 0,
			isActive: true,
			serviceCount: 0,
		});

		res.status(201).json({
			success: true,
			message: "Category created successfully",
			category,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to create category",
			error: error.message,
		});
	}
}

// Update category (Admin only)
export async function updateCategory(req, res) {
	try {
		const { id } = req.params;
		const { name, displayName, description, icon, order, isActive } = req.body;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		// Handle image upload if new image provided
		if (req.file) {
			const uploadResult = await uplodOnCloudinary(req.file.path);
			if (uploadResult) {
				category.imageUrl = uploadResult.secure_url;
			}
		}

		// Update fields
		if (name) category.name = name;
		if (displayName) category.displayName = displayName;
		if (description !== undefined) category.description = description;
		if (icon !== undefined) category.icon = icon;
		if (order !== undefined) category.order = order;
		if (isActive !== undefined) category.isActive = isActive;

		await category.save();

		// Update service count
		const serviceCount = await Service.countDocuments({
			category: category.name,
		});
		category.serviceCount = serviceCount;
		await category.save();

		res.status(200).json({
			success: true,
			message: "Category updated successfully",
			category,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to update category",
			error: error.message,
		});
	}
}

// Delete category (Admin only)
export async function deleteCategory(req, res) {
	try {
		const { id } = req.params;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		// Check if category has services
		const serviceCount = await Service.countDocuments({
			category: category.name,
		});
		if (serviceCount > 0) {
			return res.status(400).json({
				success: false,
				message: `Cannot delete category with ${serviceCount} services. Please remove or reassign services first.`,
			});
		}

		await Category.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Category deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to delete category",
			error: error.message,
		});
	}
}

// Toggle category active status (Admin only)
export async function toggleCategoryStatus(req, res) {
	try {
		const { id } = req.params;

		const category = await Category.findById(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}

		category.isActive = !category.isActive;
		await category.save();

		res.status(200).json({
			success: true,
			message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
			category,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Failed to toggle category status",
			error: error.message,
		});
	}
}
