import express from "express";
import { reverseGeocode, getUserLocationFromIP } from "../controllers/locationController.js";

const router = express.Router();

// Reverse geocode: Convert lat/lng to city/state
router.get("/reverse-geocode", reverseGeocode);

// Get user location from IP (fallback)
router.get("/from-ip", getUserLocationFromIP);

export default router;
