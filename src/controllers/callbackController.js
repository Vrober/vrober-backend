import CallbackRequest from "../models/callback.models.js";

export async function createCallback(req, res) {
	try {
		const { name, phone, preferredTime, note } = req.body;
		if (!name || !phone) {
			return res.status(400).json({ message: "Name and phone are required" });
		}
		const doc = await CallbackRequest.create({
			name,
			phone,
			preferredTime,
			note,
		});
		res
			.status(201)
			.json({ message: "Callback request submitted", request: doc });
	} catch (err) {
		res
			.status(500)
			.json({
				message: "Failed to submit callback request",
				error: err.message,
			});
	}
}

export async function listCallbacks(req, res) {
	try {
		const { page = 1, limit = 20, status } = req.query;
		const filter = {};
		if (status) filter.status = status;
		const items = await CallbackRequest.find(filter)
			.limit(limit * 1)
			.skip((page - 1) * limit)
			.sort({ createdAt: -1 });
		const total = await CallbackRequest.countDocuments(filter);
		res
			.status(200)
			.json({
				requests: items,
				totalPages: Math.ceil(total / limit),
				total,
				currentPage: page,
			});
	} catch (err) {
		res
			.status(500)
			.json({
				message: "Failed to list callback requests",
				error: err.message,
			});
	}
}

export async function updateCallbackStatus(req, res) {
	try {
		const { id } = req.params;
		const { status } = req.body;
		if (!["new", "contacted", "closed"].includes(status)) {
			return res.status(400).json({ message: "Invalid status" });
		}
		const updated = await CallbackRequest.findByIdAndUpdate(
			id,
			{ status },
			{ new: true }
		);
		if (!updated)
			return res.status(404).json({ message: "Callback request not found" });
		res.status(200).json({ message: "Status updated", request: updated });
	} catch (err) {
		res
			.status(500)
			.json({ message: "Failed to update status", error: err.message });
	}
}
