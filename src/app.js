import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

const app = express();

import dotenv from "dotenv";
dotenv.config();

app.use(
	cors({
		origin: [
			process.env.FRONTEND_URL || "http://localhost:3001",
			process.env.ADMIN_URL || "http://localhost:3002",
			"http://localhost:3000", // Legacy support
			"https://www.vrober.com", // Production frontend
			"https://vrober.com", // Production frontend (without www)
			"https://api.vrober.com", // Production API
		],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import callbackRoutes from "./routes/callbackRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import homeSectionRoutes from "./routes/homeSectionRoutes.js";

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/callbacks", callbackRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/home-sections", homeSectionRoutes);

// Health check route
app.get("/api/v1/health", (req, res) => {
	res.status(200).json({ message: "Server is running!" });
});

// http://localhost:3000/api/v1/

export { app };
