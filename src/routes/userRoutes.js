import express from "express";
import {
	createUser,
	updateUser,
	getMe,
} from "../controllers/userController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create user profile (public route for registration)
router.post("/", createUser);

// Update user details (protected route)
router.put("/", verifyJWT("user"), updateUser);

// Get current user (protected)
router.get("/me", verifyJWT("user"), getMe);

export default router;
