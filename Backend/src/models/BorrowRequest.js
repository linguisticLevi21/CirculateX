/**
 * models/BorrowRequest.js
 *
 * WHY THIS MODEL EXISTS:
 * A BorrowRequest is the transactional record between a borrower and lender.
 * It captures: what item, who wants it, for when, for how much, and the
 * current lifecycle status.
 *
 * THE STATE MACHINE:
 * This is the most important design concept in the backend.
 * A request can only ever be in ONE of these states:
 *
 *   PENDING   → Initial state when borrower submits request
 *   APPROVED  → Lender accepted; escrow deposit is now HELD
 *   REJECTED  → Lender declined; no further action
 *   ACTIVE    → Borrow period has started (item physically handed over)
 *   RETURNED  → Item returned safely; deposit released
 *   DISPUTED  → Either party raised a dispute; platform mediates
 *
 * State transition rules (enforced in controller logic):
 *   PENDING  → APPROVED (lender action)
 *   PENDING  → REJECTED (lender action)
 *   APPROVED → ACTIVE   (automatic or manual on start date)
 *   ACTIVE   → RETURNED (lender confirms)
 *   ACTIVE   → DISPUTED (either party)
 *
 * WHY A STATE MACHINE:
 * Without explicit state validation, bugs like "double approve" or
 * "release escrow before approval" are possible. The state machine
 * forces us to check: "is this transition valid from the current state?"
 *
 * DENORMALIZED lenderId:
 * We store lenderId directly (it's also on the Listing).
 * WHY: "GET /api/requests/incoming" should be a direct query:
 *   BorrowRequest.find({ lenderId: req.user._id })
 * Without denormalization, we'd need to join through Listing first.
 *
 * PRICE SNAPSHOTS (totalCost, depositAmount):
 * These are recorded AT THE TIME OF THE REQUEST.
 * WHY: If the lender raises their price next week, it should not affect
 * an already-agreed transaction. This is a snapshot of the contract.
 */

const mongoose = require('mongoose');

const REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'RETURNED', 'DISPUTED'];

const borrowRequestSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing reference is required'],
    },
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower reference is required'],
    },
    // Denormalized from Listing — avoids a join for "incoming requests" queries
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lender reference is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    // Computed at request creation time (not re-computed later)
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Must borrow for at least 1 day'],
    },
    // SNAPSHOT: price agreed at time of request
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    // SNAPSHOT: deposit agreed at time of request
    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    // THE STATE MACHINE FIELD
    status: {
      type: String,
      enum: {
        values: REQUEST_STATUSES,
        message: `Status must be one of: ${REQUEST_STATUSES.join(', ')}`,
      },
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// ── INDEXES ───────────────────────────────────────────────────────────────────

// "My outgoing requests" — borrower's view
borrowRequestSchema.index({ borrowerId: 1, createdAt: -1 });

// "My incoming requests" — lender's view
borrowRequestSchema.index({ lenderId: 1, createdAt: -1 });

// Check if listing has active/approved requests (availability check)
borrowRequestSchema.index({ listingId: 1, status: 1 });

// ── STATICS ───────────────────────────────────────────────────────────────────

borrowRequestSchema.statics.STATUSES = REQUEST_STATUSES;

const BorrowRequest = mongoose.model('BorrowRequest', borrowRequestSchema);

module.exports = BorrowRequest;
