import express from "express";
import {
	createVendor,
	updateVendor,
	getPartnerProfile,
	getDashboardMetrics,
	getPartnerBookings,
	updateBookingStatus,
	getEarningsHistory,
	requestPaymentWithdrawal,
	getAllPartners,
	approvePartner,
	rejectPartner,
	getPartnerDetailsAdmin,
	getPartnerEarningsAdmin,
	approvePaymentWithdrawal,
	sendPartnerOtp,
	verifyPartnerOtp,
} from "../controllers/vendorController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ============ PARTNER AUTH ROUTES (PUBLIC) ============
// Partner OTP login/registration
router.post("/auth/send-otp", sendPartnerOtp);
router.post("/auth/verify-otp", verifyPartnerOtp);

// ============ PUBLIC ROUTES ============
// Create partner profile (registration)
router.post("/", createVendor);

// ============ PARTNER ROUTES (Protected) ============
// Partner profile
router.get("/profile", verifyJWT("vendor"), getPartnerProfile);
router.put("/profile", verifyJWT("vendor"), updateVendor);

// Partner dashboard
router.get("/dashboard/metrics", verifyJWT("vendor"), getDashboardMetrics);

// Partner bookings
router.get("/bookings", verifyJWT("vendor"), getPartnerBookings);
router.put("/bookings/:bookingId/status", verifyJWT("vendor"), updateBookingStatus);

// Partner earnings
router.get("/earnings/history", verifyJWT("vendor"), getEarningsHistory);
router.post("/earnings/withdraw", verifyJWT("vendor"), requestPaymentWithdrawal);

// ============ ADMIN ROUTES (Protected) ============
// Get all partners
router.get("/admin/partners", verifyJWT("admin"), getAllPartners);

// Partner approval/rejection
router.put("/admin/partners/:partnerId/approve", verifyJWT("admin"), approvePartner);
router.put("/admin/partners/:partnerId/reject", verifyJWT("admin"), rejectPartner);

// Partner details
router.get("/admin/partners/:partnerId", verifyJWT("admin"), getPartnerDetailsAdmin);

// Partner earnings
router.get(
	"/admin/partners/:partnerId/earnings",
	verifyJWT("admin"),
	getPartnerEarningsAdmin
);
router.put(
	"/admin/partners/:partnerId/earnings/:transactionId/approve",
	verifyJWT("admin"),
	approvePaymentWithdrawal
);

export default router;
