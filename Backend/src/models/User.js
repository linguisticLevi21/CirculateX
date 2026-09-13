/**
 * models/User.js
 *
 * WHY THIS SCHEMA:
 * The User is the central entity — every listing has an owner, every borrow
 * request has a borrower and a lender. The schema is deliberately minimal
 * for MVP: name, email, password hash, optional contact info.
 *
 * SECURITY DECISIONS:
 * - passwordHash: never store plain passwords. bcrypt hash only. This field
 *   is excluded from query results by default (select: false).
 * - refreshToken: we store a hash of the current refresh token so we can
 *   invalidate it on logout. If the user logs out, we clear this field,
 *   so the old refresh token is no longer valid even if stolen.
 *
 * SCHEMA FIELDS:
 * - email: unique index enforced at DB level — login identifier
 * - location: string (e.g., "Koramangala, Bangalore") for distance display
 *   We're NOT using GeoJSON coordinates yet — a string is sufficient for MVP
 * - isVerified: placeholder for future email verification (defaults false)
 *
 * INDEXES:
 * - email: unique (enforced by mongoose unique:true → creates a unique index)
 *   Query: every login hits this index: User.findOne({ email })
 *
 * TIMESTAMPS:
 * Mongoose { timestamps: true } adds createdAt and updatedAt automatically.
 * We always want these — they're essential for debugging and auditing.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,        // creates a unique index in MongoDB
      lowercase: true,     // always store email in lowercase
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Please provide a valid email address',
      ],
    },
    // select: false means this field is NOT returned by default in queries.
    // You must explicitly opt-in: User.findOne({...}).select('+passwordHash')
    // This prevents accidental password hash exposure in API responses.
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Stores current refresh token (hashed) to allow logout invalidation.
    // select: false — should never appear in API responses.
    refreshToken: {
      type: String,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ── INSTANCE METHODS ─────────────────────────────────────────────────────────

/**
 * comparePassword(candidatePassword)
 *
 * WHY AN INSTANCE METHOD:
 * The password comparison logic belongs to the User model — it's a behavior
 * of the User entity. Putting it here means controllers stay clean and the
 * logic is reusable anywhere we have a user document.
 *
 * HOW bcrypt.compare works:
 * It extracts the salt from the stored hash, re-hashes the candidate password
 * with that salt, and compares the result. Returns true if they match.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // 'this.passwordHash' — 'this' is the user document instance.
  // We need to select passwordHash explicitly when querying if we want to use this.
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * toSafeObject()
 *
 * Returns a plain object without sensitive fields.
 * Used when building API responses — we never want to accidentally send
 * passwordHash or refreshToken to the client.
 */
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    location: this.location,
    avatar: this.avatar,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
