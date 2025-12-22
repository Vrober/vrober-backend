import express from "express";
import {
	getAllServices,
	getServiceById,
	getServicesByVendor,
	searchServices,
	getDistinctCategories,
	getSearchSuggestions,
	getHomeSections,
} from "../controllers/serviceController.js";

const router = express.Router();

// Public routes
router.get("/categories", getDistinctCategories); // list categories first
router.get("/suggestions", getSearchSuggestions); // search suggestions
router.get("/home-sections", getHomeSections); // homepage sections
router.get("/", getAllServices);
router.get("/search", searchServices);
// Place vendor before id to avoid path conflict
router.get("/vendor/:vendorId", getServicesByVendor);
router.get("/:id", getServiceById);

export default router;
