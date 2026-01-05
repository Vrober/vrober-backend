import crypto from "crypto";
import axios from "axios";
import cashfreeConfig from "../config/cashfree.config.js";
import Payment from "../models/payment.models.js";
import Booking from "../models/booking.models.js";
import User from "../models/user.models.js";

// Cashfree API Base URLs
const CASHFREE_API_BASE = cashfreeConfig.environment === "production"
	? "https://api.cashfree.com/pg"
	: "https://sandbox.cashfree.com/pg";

/**
 * Create Cashfree Payment Order
 * @route POST /api/v1/payments/create-order
 */
export const createPaymentOrder = async (req, res) => {
	try {
		console.log('=== PAYMENT ORDER CREATE REQUEST ===');
		console.log('User ID:', req.user?._id);
		console.log('Request body:', req.body);
		
		const userId = req.user._id;
		const { bookingIds } = req.body;

		// Validate bookingIds
		if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Please provide valid booking IDs",
			});
		}

		// Fetch bookings and validate
		const bookings = await Booking.find({
			_id: { $in: bookingIds },
			userId: userId,
		});

		if (bookings.length !== bookingIds.length) {
			return res.status(400).json({
				success: false,
				message: "Some bookings not found or unauthorized",
			});
		}

		// Check if bookings already have payment
		const paidBookings = bookings.filter(b => b.paymentStatus === "paid");
		if (paidBookings.length > 0) {
			return res.status(400).json({
				success: false,
				message: "Some bookings are already paid",
			});
		}

		// Calculate total amount (server-side validation)
		const totalAmount = bookings.reduce((sum, booking) => sum + booking.price, 0);

		if (totalAmount <= 0) {
			return res.status(400).json({
				success: false,
				message: "Invalid order amount",
			});
		}

		// Fetch user details
		const user = await User.findById(userId);

		// Generate unique order ID
		const orderId = `ORDER_${Date.now()}_${userId.toString().slice(-6)}`;

		// Build return URL with order_id - always use FRONTEND_URL for consistency
		const baseReturnUrl = `${process.env.FRONTEND_URL}/payment/callback`;
		const returnUrlWithOrderId = `${baseReturnUrl}?order_id=${orderId}`;

		// Format phone number for Cashfree (must be 10 digits)
		let customerPhone = user.mobileNo || user.phone || "9999999999";
		// Remove any non-digit characters and take last 10 digits
		customerPhone = customerPhone.replace(/\D/g, '').slice(-10);
		if (customerPhone.length !== 10) {
			customerPhone = "9999999999"; // Fallback to dummy number
		}

		// Prepare Cashfree order request
		const orderRequest = {
			order_id: orderId,
			order_amount: totalAmount,
			order_currency: "INR",
			customer_details: {
				customer_id: userId.toString(),
				customer_name: (user.name || "Customer").substring(0, 100),
				customer_email: user.email || `user${userId.toString().slice(-6)}@vrober.com`,
				customer_phone: customerPhone,
			},
			order_meta: {
				return_url: returnUrlWithOrderId,
				notify_url: `${process.env.BACKEND_URL}/api/v1/payments/webhook`,
			},
			order_note: `Vrober Service Booking - ${bookings.length} service(s)`,
		};

		console.log('Creating Cashfree order:', {
			orderId,
			amount: totalAmount,
			returnUrl: returnUrlWithOrderId,
			notifyUrl: orderRequest.order_meta.notify_url,
			customerPhone: customerPhone,
		});

		// Create order in Cashfree via API
		const response = await axios.post(
			`${CASHFREE_API_BASE}/orders`,
			orderRequest,
			{
				headers: {
					"Content-Type": "application/json",
					"x-client-id": cashfreeConfig.clientId,
					"x-client-secret": cashfreeConfig.clientSecret,
					"x-api-version": "2023-08-01",
				},
			}
		);

		// Save payment record in database
		const payment = new Payment({
			orderId: orderId,
			orderAmount: totalAmount,
			orderCurrency: "INR",
			userId: userId,
			bookingIds: bookingIds,
			status: "CREATED",
			cfOrderId: response.data.cf_order_id || orderId,
			customerDetails: {
				name: user.name || "Customer",
				email: user.email || "",
				phone: user.mobileNo || user.phone || "",
			},
			metadata: {
				bookingCount: bookings.length,
			},
		});

		await payment.save();

		// Update bookings with payment method
		await Booking.updateMany(
			{ _id: { $in: bookingIds } },
			{ 
				$set: { 
					paymentMethod: "online",
					paymentStatus: "pending",
				} 
			}
		);

		res.status(200).json({
			success: true,
			message: "Payment order created successfully",
			data: {
				orderId: orderId,
				orderAmount: totalAmount,
				orderToken: response.data.order_token,
				paymentSessionId: response.data.payment_session_id,
				cfOrderId: response.data.cf_order_id,
			},
		});

	} catch (error) {
		console.error("Create payment order error:", error.response?.data || error.message || error);
		
		// Get detailed error from Cashfree response
		const cashfreeError = error.response?.data;
		const statusCode = error.response?.status || 500;
		const errorMessage = cashfreeError?.message || error.message || "Failed to create payment order";
		
		res.status(statusCode).json({
			success: false,
			message: errorMessage,
			error: cashfreeError || error.message,
			details: cashfreeError?.details || null,
		});
	}
};

/**
 * Verify Payment Signature
 */
const verifySignature = (orderId, orderAmount, signature) => {
	try {
		const signatureData = `${orderId}${orderAmount}`;
		const generatedSignature = crypto
			.createHmac("sha256", cashfreeConfig.clientSecret)
			.update(signatureData)
			.digest("base64");

		return generatedSignature === signature;
	} catch (error) {
		console.error("Signature verification error:", error);
		return false;
	}
};

/**
 * Handle Cashfree Webhook
 * @route POST /api/v1/payments/webhook
 */
export const handleWebhook = async (req, res) => {
	try {
		const webhookData = req.body;
		const signature = req.headers["x-webhook-signature"];

		console.log("Webhook received:", JSON.stringify(webhookData, null, 2));

		// Extract order details
		const orderId = webhookData.data?.order?.order_id;
		const orderAmount = webhookData.data?.order?.order_amount;
		const paymentStatus = webhookData.data?.payment?.payment_status;
		const cfOrderId = webhookData.data?.order?.cf_order_id;
		const cfPaymentId = webhookData.data?.payment?.cf_payment_id;
		const paymentMethod = webhookData.data?.payment?.payment_group;
		const paymentTime = webhookData.data?.payment?.payment_time;
		const bankReference = webhookData.data?.payment?.bank_reference;

		if (!orderId) {
			console.error("Invalid webhook: No order ID");
			return res.status(400).json({ success: false, message: "Invalid webhook data" });
		}

		// Find payment record
		const payment = await Payment.findOne({ orderId });

		if (!payment) {
			console.error(`Payment not found for order: ${orderId}`);
			return res.status(404).json({ success: false, message: "Payment not found" });
		}

		// Idempotency check - if already processed, return success
		if (payment.status === "PAID" && paymentStatus === "SUCCESS") {
			return res.status(200).json({ success: true, message: "Already processed" });
		}

		// Update payment record
		const updateData = {
			rawWebhookData: webhookData,
			cfOrderId: cfOrderId || payment.cfOrderId,
			cfPaymentId: cfPaymentId,
			bankReference: bankReference,
			paymentMethod: paymentMethod,
			signature: signature,
		};

		if (paymentStatus === "SUCCESS") {
			updateData.status = "PAID";
			updateData.paymentTime = new Date(paymentTime);
			updateData.transactionId = cfPaymentId;

			// Update associated bookings
			await Booking.updateMany(
				{ _id: { $in: payment.bookingIds } },
				{ 
					$set: { 
						paymentStatus: "paid",
						status: "pending", // Move from unassigned to pending
						transactionId: cfPaymentId,
					} 
				}
			);

		} else if (paymentStatus === "FAILED") {
			updateData.status = "FAILED";
			updateData.failureReason = webhookData.data?.payment?.payment_message || "Payment failed";

			// Update bookings to failed payment status
			await Booking.updateMany(
				{ _id: { $in: payment.bookingIds } },
				{ $set: { paymentStatus: "failed" } }
			);

		} else if (paymentStatus === "CANCELLED" || paymentStatus === "USER_DROPPED") {
			updateData.status = "CANCELLED";

			// Reset bookings payment status
			await Booking.updateMany(
				{ _id: { $in: payment.bookingIds } },
				{ $set: { paymentStatus: "pending" } }
			);
		}

		await Payment.findByIdAndUpdate(payment._id, updateData);

		console.log(`Payment ${orderId} updated to status: ${updateData.status}`);

		res.status(200).json({ success: true, message: "Webhook processed" });

	} catch (error) {
		console.error("Webhook processing error:", error);
		res.status(500).json({ success: false, message: "Webhook processing failed" });
	}
};

/**
 * Get Payment Status
 * @route GET /api/v1/payments/:orderId
 */
export const getPaymentStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const userId = req.user._id;

		const payment = await Payment.findOne({ orderId, userId })
			.populate("bookingIds", "serviceId serviceDate serviceTime price status");

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: "Payment not found",
			});
		}

		res.status(200).json({
			success: true,
			data: payment,
		});

	} catch (error) {
		console.error("Get payment status error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch payment status",
		});
	}
};

/**
 * Verify Payment (called from frontend after redirect)
 * @route POST /api/v1/payments/verify
 */
export const verifyPayment = async (req, res) => {
	try {
		const { orderId } = req.body;
		const userId = req.user._id;

		const payment = await Payment.findOne({ orderId, userId });

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: "Payment not found",
			});
		}

		// Fetch latest status from Cashfree
		try {
			const response = await axios.get(
				`${CASHFREE_API_BASE}/orders/${orderId}/payments`,
				{
					headers: {
						"x-client-id": cashfreeConfig.clientId,
						"x-client-secret": cashfreeConfig.clientSecret,
						"x-api-version": "2023-08-01",
					},
				}
			);

			const payments = response.data;

			if (payments && payments.length > 0) {
				const latestPayment = payments[0];
				
				if (latestPayment.payment_status === "SUCCESS") {
					payment.status = "PAID";
					payment.paymentTime = new Date(latestPayment.payment_time);
					payment.transactionId = latestPayment.cf_payment_id;
					payment.cfPaymentId = latestPayment.cf_payment_id;
					payment.paymentMethod = latestPayment.payment_group;
					
					await payment.save();

					// Update bookings
					await Booking.updateMany(
						{ _id: { $in: payment.bookingIds } },
						{ 
							$set: { 
								paymentStatus: "paid", 
								status: "pending",
								transactionId: latestPayment.cf_payment_id,
							} 
						}
					);
				}
			}
		} catch (cfError) {
			console.error("Cashfree fetch error:", cfError.response?.data || cfError);
		}

		res.status(200).json({
			success: true,
			data: {
				orderId: payment.orderId,
				status: payment.status,
				amount: payment.orderAmount,
				paymentTime: payment.paymentTime,
			},
		});

	} catch (error) {
		console.error("Verify payment error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to verify payment",
		});
	}
};

/**
 * Get all payments for a user
 * @route GET /api/v1/payments
 */
export const getUserPayments = async (req, res) => {
	try {
		const userId = req.user._id;
		const { status, limit = 50 } = req.query;

		const query = { userId };
		if (status) {
			query.status = status;
		}

		const payments = await Payment.find(query)
			.populate("bookingIds", "serviceId serviceDate serviceTime price status")
			.sort({ createdAt: -1 })
			.limit(parseInt(limit));

		res.status(200).json({
			success: true,
			data: payments,
			count: payments.length,
		});

	} catch (error) {
		console.error("Get user payments error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch payments",
		});
	}
};
