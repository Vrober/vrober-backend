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
			required: true,
			minlength: 6, // enforce strong password policy if you want
		},

		address: {
			type: String,
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
	},
	{ timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
