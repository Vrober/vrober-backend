import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    // High-level category used by category pages (e.g., 'Cleaning', 'Repair')
    category: {
      type: String,
      index: true,
      trim: true,
    },
    // Base price for the service (supports booking pricing)
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Human readable duration (e.g. '45 mins', '2 hrs')
    duration: {
      type: String,
    },
    toolsRequired: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: String,
        rating: { type: Number, min: 0, max: 5 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    imageUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    // Home page curation and ranking
    isPopular: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: false, index: true },
    isMostBooked: { type: Boolean, default: false, index: true },
    bookingCount: { type: Number, default: 0, min: 0, index: true },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
