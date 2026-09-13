/**
 * models/EscrowTransaction.js
 *
 * WHY A SEPARATE MODEL:
 * The escrow deposit is a financial record with its own lifecycle, separate
 * from the borrow request itself. Keeping it separate:
 *   1. Clean audit trail — we can query all financial transactions independently
 *   2. Prepares for real payment gateway integration (Razorpay, etc.)
 *   3. Single responsibility — each model owns one concern
 *
 * RELATIONSHIP:
 *   One BorrowRequest → at most one EscrowTransaction
 *   requestId is unique — you can't have two escrows for one request
 *
 * STATE MACHINE:
 *   HELD      → Deposit locked when request is APPROVED
 *   RELEASED  → Deposit returned when item safely returned
 *   DISPUTED  → Either party raised a dispute
 *   REFUNDED  → Dispute resolved in borrower's favor (deposit returned)
 *   FORFEITED → Dispute resolved in lender's favor (deposit kept by lender)
 *
 * WHY MVP ESCROW IS SIMULATED:
 * Real escrow requires a payment gateway (Razorpay, Stripe) to actually
 * hold funds. For MVP, we track the escrow STATE in our database but don't
 * move real money. This lets us build and test the entire flow without
 * payment gateway complexity.
 */

const mongoose = require('mongoose');

const ESCROW_STATUSES = ['HELD', 'RELEASED', 'DISPUTED', 'REFUNDED', 'FORFEITED'];

const escrowTransactionSchema = new mongoose.Schema(
  {
    // Unique: one escrow per borrow request
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: [true, 'Borrow request reference is required'],
      unique: true,
    },
    // Who put down the deposit
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Who receives deposit if item is damaged
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The deposit amount in INR (snapshot from the request)
    amount: {
      type: Number,
      required: [true, 'Escrow amount is required'],
      min: [0, 'Escrow amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ESCROW_STATUSES,
        message: `Status must be one of: ${ESCROW_STATUSES.join(', ')}`,
      },
      default: 'HELD',
    },
    // Timestamps for the individual state transitions
    heldAt: {
      type: Date,
      default: Date.now,
    },
    releasedAt: {
      type: Date,
      default: null,
    },
    // Optional dispute notes for admin review
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ── INDEXES ───────────────────────────────────────────────────────────────────

// requestId is unique (already creates a unique index via unique: true)

// Filter all HELD escrows (admin view, financial reporting)
escrowTransactionSchema.index({ status: 1 });

// User's escrow history
escrowTransactionSchema.index({ borrowerId: 1 });

escrowTransactionSchema.statics.STATUSES = ESCROW_STATUSES;

const EscrowTransaction = mongoose.model('EscrowTransaction', escrowTransactionSchema);

module.exports = EscrowTransaction;
