import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/index.db.js";
import Service from "../models/services.models.js";
import Booking from "../models/booking.models.js";

(async () => {
	try {
		await connectDB();
		const services = await Service.find(
			{},
			"serviceName category isPopular isPremium bookingCount"
		).lean();
		console.log("\nService Snapshot:");
		console.table(
			services.map((s) => ({
				name: s.serviceName,
				cat: s.category,
				popular: s.isPopular,
				premium: s.isPremium,
				bookings: s.bookingCount,
			}))
		);

		const bookingCounts = await Booking.aggregate([
			{ $group: { _id: "$serviceId", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 },
		]);

		console.log("\nTop Services by actual Booking docs:");
		for (const b of bookingCounts) {
			const svc = services.find((s) => String(s._id) === String(b._id));
			console.log(`${b.count}\t${svc?.serviceName || b._id}`);
		}

		await mongoose.connection.close();
	} catch (e) {
		console.error("QA DB Script Error:", e);
		process.exit(1);
	}
})();
