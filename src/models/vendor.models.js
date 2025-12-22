import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		mobileNo: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		password: {
			type: String,
			default: null, // Optional for OTP auth
			minlength: 6,
		},

		address: {
			type: String,
			required: true,
		},
		pinCode: {
			type: String,
		},
		dob: {
			type: Date,
		},
		gender: {
			type: String,
			enum: ["male", "female", "other"],
		},
		liveLocation: {
			lat: { type: Number },
			lng: { type: Number },
		},
		orders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Order",
			},
		],
		toolsAvailable: [
			{
				type: String,
			},
		],
		ref: {
			type: String,
		},
		experience: {
			type: Number, // years of experience
		},
		aadhar: {
			type: String,
			unique: true,
			sparse: true, // allows multiple nulls
		},
		isVerify: {
			type: Boolean,
			default: false,
		},
		role: {
			type: String,
			enum: ["vendor"],
			required: true,
			default: "vendor",
		},
		paymentInfo: {
			accountNo: String,
			ifsc: String,
			upiId: String,
		},
		imageUri: {
			type: String, // vendor profile image
		},
		services: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Service",
			},
		],
		wallet: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			min: 0,
			max: 5,
			default: 0,
		},
		// Partner-specific fields
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		rejectionReason: {
			type: String,
		},
		earnings: {
			total: {
				type: Number,
				default: 0,
			},
			withdrawn: {
				type: Number,
				default: 0,
			},
			available: {
				type: Number,
				default: 0,
			},
		},
		totalBookings: {
			type: Number,
			default: 0,
		},
		completedBookings: {
			type: Number,
			default: 0,
		},
		cancelledBookings: {
			type: Number,
			default: 0,
		},
		paymentHistory: [
			{
				date: Date,
				amount: Number,
				status: {
					type: String,
					enum: ["pending", "completed", "failed"],
				},
				transactionId: String,
			},
		],
		bio: {
			type: String,
		},
		businessName: {
			type: String,
			required: true,
			trim: true,
		},
		gstin: {
			type: String,
		},
		verificationDocuments: [
			{
				type: String, // URLs to documents
			},
		],
		bankDetails: {
			beneficiaryName: String,
			bankName: String,
			accountNo: String,
			ifsc: String,
			upiId: String,
			verificationStatus: {
				type: String,
				enum: ["pending", "verified", "rejected"],
				default: "pending",
			},
		},
	},
	{ timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
