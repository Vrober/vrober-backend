import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
	getAllHomeSections,
	getHomeSectionsAdmin,
	getHomeSectionById,
	createHomeSection,
	updateHomeSection,
	deleteHomeSection,
	toggleSectionStatus,
	reorderSections,
	getServicesForFilter,
} from "../controllers/homeSectionController.js";

const router = express.Router();

// Public routes (for frontend)
router.get("/public", getAllHomeSections);

// Admin routes
router.get("/", verifyJWT("admin"), getHomeSectionsAdmin);
router.get("/preview-services", verifyJWT("admin"), getServicesForFilter);
router.get("/:id", verifyJWT("admin"), getHomeSectionById);
router.post("/", verifyJWT("admin"), createHomeSection);
router.put("/:id", verifyJWT("admin"), updateHomeSection);
router.put("/:id/toggle", verifyJWT("admin"), toggleSectionStatus);
router.post("/reorder", verifyJWT("admin"), reorderSections);
router.delete("/:id", verifyJWT("admin"), deleteHomeSection);

export default router;
