import express from "express";
import {
	createCallback,
	listCallbacks,
	getCallbackById,
	updateCallbackStatus,
	updateCallback,
	deleteCallback,
} from "../controllers/callbackController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public create endpoint
router.post("/", createCallback);

// Admin routes (protected)
router.get("/", verifyJWT("admin"), listCallbacks);
router.get("/:id", verifyJWT("admin"), getCallbackById);
router.put("/:id/status", verifyJWT("admin"), updateCallbackStatus);
router.put("/:id", verifyJWT("admin"), updateCallback);
router.delete("/:id", verifyJWT("admin"), deleteCallback);

export default router;
