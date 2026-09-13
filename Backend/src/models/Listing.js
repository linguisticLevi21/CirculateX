/**
 * models/Listing.js
 *
 * WHY THIS SCHEMA:
 * A Listing is an item a user is willing to lend. It has a price per day,
 * a security deposit, and belongs to a lender (User reference).
 *
 * KEY DESIGN DECISIONS:
 *
 * 1. lenderId as ObjectId reference (not embedded):
 *    We store lenderId as a reference to User, not the full user object.
 *    WHY: If we embedded lender data, we'd have to update every listing
 *    when the lender changes their name or location. With a reference,
 *    one update to User is enough. We use populate() to join when needed.
 *
 * 2. Denormalized rating/totalLends:
 *    Instead of counting reviews on every listing load, we cache the
 *    rating and lend count directly on the listing document. We update
 *    these when a review is submitted.
 *    WHY: The marketplace loads many listings at once. Computing rating
 *    from a joins on every load would be slow. This is a deliberate
 *    denormalization for read performance.
 *    TRADE-OFF: Rating data could become slightly stale if an update fails.
 *    Acceptable for MVP.
 *
 * 3. images as array of strings (URLs):
 *    We store image URLs, not the images themselves. Images live in a
 *    CDN (Cloudinary, later). For now this array is empty — the frontend
 *    uses emoji placeholders.
 *
 * 4. available boolean:
 *    Set to false when a borrow request is APPROVED. Set back to true
 *    when the item is RETURNED. Simple but effective for MVP.
 *    LIMITATION: Doesn't handle overlapping date-based availability.
 *    That's a V2 problem.
 *
 * INDEXES (explained):
 * - lenderId: for "GET /api/listings/my" — filter by owner
 * - category + available + createdAt: compound index for marketplace
 *   The most common query: "show available Electronics, newest first"
 *   A compound index on these three fields makes this one fast DB scan.
 */

const mongoose = require('mongoose');

const CATEGORIES = ['Electronics', 'Gaming', 'Cameras', 'Tools', 'Music', 'Books', 'Outdoor', 'Other'];

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: `Category must be one of: ${CATEGORIES.join(', ')}`,
      },
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Daily price is required'],
      min: [1, 'Daily price must be at least ₹1'],
    },
    deposit: {
      type: Number,
      required: [true, 'Security deposit amount is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    // Reference to the User who owns this listing.
    // WHY ref: 'User' — enables .populate('lenderId') to join user data
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lender is required'],
    },
    // Array of image URLs (empty for MVP — frontend uses emoji)
    images: {
      type: [String],
      default: [],
    },
    // Is this listing currently available to borrow?
    // Set to false on request approval, true on item return.
    available: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    // Denormalized for fast marketplace rendering (avoids Review joins)
    totalLends: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // toJSON transform: when Mongoose converts to JSON, run this function.
    // This makes populate() results include virtual _id as string.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── INDEXES ───────────────────────────────────────────────────────────────────

// Index for "my listings" queries
listingSchema.index({ lenderId: 1 });

// Compound index for marketplace: filter by category + available, sort by date
// MongoDB uses this one index for: GET /listings?category=Cameras&available=true
listingSchema.index({ category: 1, available: 1, createdAt: -1 });

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

listingSchema.statics.CATEGORIES = CATEGORIES;

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
