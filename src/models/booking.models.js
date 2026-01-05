import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		vendorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Vendor",
			required: false, // Optional - assigned by admin later
		},
		serviceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Service",
			required: true,
		},
		bookingDate: {
			type: Date,
			required: true,
		},
		serviceDate: {
			type: Date,
			required: true,
		},
		serviceTime: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		location: {
			lat: { type: Number },
			lng: { type: Number },
		},
		status: {
			type: String,
			enum: ["unassigned", "pending", "assigned", "confirmed", "accepted", "in-progress", "completed", "rejected", "cancelled"],
			default: "unassigned",
		},
		price: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
		},
		specialInstructions: {
			type: String,
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "refunded", "failed"],
			default: "pending",
		},
		paymentMethod: {
			type: String,
			enum: ["cash", "online", "wallet"],
			default: "cash",
		},
		paymentId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Payment",
		},
		transactionId: {
			type: String,
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
		},
		review: {
			type: String,
		},
		vendorNotes: {
			type: String,
		},
		adminNote: {
			type: String,
		},
		completionDate: {
			type: Date,
		},
		cancellationReason: {
			type: String,
		},
		cancelledBy: {
			type: String,
			enum: ["user", "vendor", "admin"],
		},
	},
	{ timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
