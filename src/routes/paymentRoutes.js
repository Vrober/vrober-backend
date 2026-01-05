import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
	createPaymentOrder,
	handleWebhook,
	getPaymentStatus,
	verifyPayment,
	getUserPayments,
} from "../controllers/paymentController.js";

const router = express.Router();

// Protected routes (require authentication)
router.post("/create-order", verifyJWT, createPaymentOrder);
router.post("/verify", verifyJWT, verifyPayment);
router.get("/:orderId", verifyJWT, getPaymentStatus);
router.get("/", verifyJWT, getUserPayments);

// Public webhook route (Cashfree will call this)
router.post("/webhook", handleWebhook);

export default router;
