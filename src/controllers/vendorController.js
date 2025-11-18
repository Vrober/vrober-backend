import Vendor from "../models/vendor.models.js";

// Create vendor profile
export async function createVendor(req, res) {
	try {
		const {
			name,
			mobileNo,
			email,
			address,
			pinCode,
			dob,
			gender,
			liveLocation,
			toolsAvailable,
			experience,
			aadhar,
			paymentInfo,
			imageUri,
		} = req.body;

		// Check if vendor already exists
		const existingVendor = await Vendor.findOne({
			$or: [{ email }, { mobileNo }],
		});

		if (existingVendor) {
			return res.status(400).json({
				message: "Vendor with this email or mobile number already exists",
			});
		}

		const newVendor = new Vendor({
			name,
			mobileNo,
			email,
			address,
			pinCode,
			dob,
			gender,
			liveLocation,
			toolsAvailable,
			experience,
			aadhar,
			paymentInfo,
			imageUri,
			role: "vendor",
			isVerify: false,
		});

		await newVendor.save();

		res.status(201).json({
			message: "Vendor profile created successfully",
			vendor: newVendor,
		});
	} catch (error) {
		res.status(400).json({
			message: "Failed to create vendor profile",
			error: error.message,
		});
	}
}

// Update vendor details
export async function updateVendor(req, res) {
	try {
		const vendorId = req.user?._id; // From JWT middleware

		const updates = req.body;

		// Remove sensitive fields that shouldn't be updated directly
		delete updates.password;
		delete updates.role;
		delete updates.isVerify; // Only admin can change verification status

		const updatedVendor = await Vendor.findByIdAndUpdate(vendorId, updates, {
			new: true,
			runValidators: true,
		});

		if (!updatedVendor) {
			return res.status(404).json({ message: "Vendor not found" });
		}

		res.status(200).json({
			message: "Vendor details updated successfully",
			vendor: updatedVendor,
		});
	} catch (error) {
		res.status(500).json({
			message: "Server error",
			error: error.message,
		});
	}
}
