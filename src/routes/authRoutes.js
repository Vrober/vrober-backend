import express from "express";
import {
	sendOtp,
	logoutUser,
	authUser,
	getCurrentUser,
	updateUserProfile,
} from "../controllers/authController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/authenticate", authUser);
router.post("/logout", logoutUser);
router.get("/me", verifyJWT(), getCurrentUser);
router.put("/update-profile", verifyJWT(), updateUserProfile);

export default router;
