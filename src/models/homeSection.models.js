import mongoose from "mongoose";

const homeSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    sectionType: {
      type: String,
      enum: [
        'popular',
        'most-booked',
        'premium',
        'cleaning',
        'category-based',
        'custom'
      ],
      required: true,
    },
    displayStyle: {
      type: String,
      enum: [
        'carousel',      // Horizontal scrolling carousel
        'grid-2',        // 2 column grid
        'grid-3',        // 3 column grid
        'grid-4',        // 4 column grid
        'list',          // Vertical list
        'compact-cards', // Small compact cards
        'large-cards'    // Large featured cards
      ],
      default: 'carousel',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Auto-filter or manual selection
    selectionMode: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'auto',
    },
    // For auto mode - filter criteria
    autoFilter: {
      field: {
        type: String,
        enum: ['isPopular', 'isPremium', 'isMostBooked', 'category', 'bookingCount'],
      },
      value: mongoose.Schema.Types.Mixed,
    },
    // For manual mode - selected services
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],
    maxItems: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    // Optional category filter
    category: {
      type: String,
      trim: true,
    },
    // Display settings
    settings: {
      showPrice: { type: Boolean, default: true },
      showRating: { type: Boolean, default: true },
      showDescription: { type: Boolean, default: true },
      showBookButton: { type: Boolean, default: true },
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for sorting sections
homeSectionSchema.index({ order: 1, isActive: 1 });

const HomeSection = mongoose.model("HomeSection", homeSectionSchema);

export default HomeSection;
