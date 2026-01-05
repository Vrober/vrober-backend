import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		orderAmount: {
			type: Number,
			required: true,
		},
		orderCurrency: {
			type: String,
			default: "INR",
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		bookingIds: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Booking",
		}],
		status: {
			type: String,
			enum: ["CREATED", "ACTIVE", "PAID", "EXPIRED", "FAILED", "CANCELLED"],
			default: "CREATED",
		},
		paymentMethod: {
			type: String, // card, upi, netbanking, wallet, etc
		},
		paymentTime: {
			type: Date,
		},
		transactionId: {
			type: String,
			index: true,
		},
		cfOrderId: {
			type: String, // Cashfree order ID
		},
		cfPaymentId: {
			type: String, // Cashfree payment ID
		},
		bankReference: {
			type: String,
		},
		signature: {
			type: String,
		},
		customerDetails: {
			name: String,
			email: String,
			phone: String,
		},
		paymentGateway: {
			type: String,
			default: "cashfree",
		},
		rawWebhookData: {
			type: mongoose.Schema.Types.Mixed,
		},
		failureReason: {
			type: String,
		},
		refundStatus: {
			type: String,
			enum: ["none", "pending", "processed", "failed"],
			default: "none",
		},
		refundAmount: {
			type: Number,
			default: 0,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
		},
	},
	{ timestamps: true }
);

// Index for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
