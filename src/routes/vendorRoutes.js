import express from "express";
import { createVendor, updateVendor } from "../controllers/vendorController.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create vendor profile (public route for registration)
router.post("/", createVendor);

// Update vendor details (protected route)
router.put("/", verifyJWT("vendor"), updateVendor);

export default router;
