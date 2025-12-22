import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import connectDb from "./db/index.db.js";

dotenv.config();

const app = express();

// Initialize database connection for Vercel
let dbConnected = false;
const initializeDatabase = async () => {
	if (!dbConnected) {
		try {
			await connectDb();
			dbConnected = true;
			console.log("✅ Database initialized for Vercel");
		} catch (error) {
			console.error("❌ Database connection failed:", error);
		}
	}
};

// Middleware to ensure DB connection on each request (for serverless)
app.use(async (req, res, next) => {
	await initializeDatabase();
	next();
});

app.use(
	cors({
		origin: function(origin, callback) {
			const allowedOrigins = [
				// Environment variables (production)
				process.env.FRONTEND_URL || "http://localhost:3000",
				process.env.ADMIN_URL || "http://localhost:3001",
				process.env.PARTNER_URL || "http://localhost:3003",
				
				// Local development
				"http://localhost:3000",
				"http://localhost:3001",
				"http://localhost:3002",
				"http://localhost:3003",
				"http://localhost:8000",
				
				// Production domains
				"https://vrober.com",
				"https://www.vrober.com",
				"https://admin.vrober.com",
				"https://www.admin.vrober.com",
				"https://partner.vrober.com",
				"https://www.partner.vrober.com",
				
				// Vercel deployment
				"https://apivrober.vercel.app",
			];
			
			// Check if origin matches exactly or use regex for subdomains
			const isAllowed = !origin || 
				allowedOrigins.includes(origin) ||
				/^https:\/\/[a-z0-9-]+\.vrober\.com$/.test(origin); // Matches any subdomain of vrober.com
			
			if (isAllowed) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
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

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/services", serviceRoutes);
app.use("/api/v1/callbacks", callbackRoutes);
app.use("/api/v1/categories", categoryRoutes);

// Health check route
app.get("/api/v1/health", (req, res) => {
	res.status(200).json({ message: "Server is running!" });
});

// http://localhost:3000/api/v1/

export { app };
