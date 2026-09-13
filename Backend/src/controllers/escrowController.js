/**
 * controllers/escrowController.js
 *
 * Handles escrow deposit release when item is safely returned.
 *
 * MVP ESCROW:
 * We simulate escrow state in the database. Real money movement requires
 * a payment gateway (Razorpay, Stripe). For now, we track the state and
 * the flow is correct — it just doesn't move real money yet.
 *
 * RELEASE FLOW:
 * 1. Lender confirms item is returned safely
 * 2. BorrowRequest → RETURNED
 * 3. EscrowTransaction → RELEASED (deposit goes back to borrower)
 * 4. Listing → available: true (can be lent again)
 * 5. Listing totalLends counter incremented
 *
 * ONLY THE LENDER CAN RELEASE:
 * The lender is the one who received the item back. They confirm its safe
 * return. The borrower cannot self-release the escrow.
 */

const BorrowRequest = require('../models/BorrowRequest');
const EscrowTransaction = require('../models/EscrowTransaction');
const Listing = require('../models/Listing');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * POST /api/escrow/release
 * Lender confirms item returned. Releases deposit back to borrower.
 */
const release = asyncHandler(async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return sendError(res, 400, 'Request ID is required', 'MISSING_REQUEST_ID');
  }

  // Find the borrow request
  const borrowRequest = await BorrowRequest.findById(requestId);
  if (!borrowRequest) {
    return sendError(res, 404, 'Borrow request not found', 'REQUEST_NOT_FOUND');
  }

  // Only the lender can confirm return
  if (borrowRequest.lenderId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Only the lender can confirm item return', 'FORBIDDEN');
  }

  // State check: request must be APPROVED or ACTIVE to be returned
  if (!['APPROVED', 'ACTIVE'].includes(borrowRequest.status)) {
    return sendError(
      res,
      409,
      `Cannot release escrow for a request with status '${borrowRequest.status}'`,
      'INVALID_STATE_TRANSITION'
    );
  }

  // Find the escrow transaction
  const escrow = await EscrowTransaction.findOne({ requestId });
  if (!escrow) {
    return sendError(res, 404, 'Escrow record not found', 'ESCROW_NOT_FOUND');
  }

  if (escrow.status !== 'HELD') {
    return sendError(
      res,
      409,
      `Cannot release escrow with status '${escrow.status}'`,
      'INVALID_ESCROW_STATE'
    );
  }

  // Perform all updates
  borrowRequest.status = 'RETURNED';
  await borrowRequest.save();

  escrow.status = 'RELEASED';
  escrow.releasedAt = new Date();
  await escrow.save();

  // Make listing available again + increment lend count
  await Listing.findByIdAndUpdate(borrowRequest.listingId, {
    available: true,
    $inc: { totalLends: 1 }, // $inc atomically increments the counter
  });

  return sendSuccess(
    res,
    200,
    { request: borrowRequest, escrow },
    `Deposit of ₹${escrow.amount.toLocaleString()} has been released back to the borrower.`
  );
});

/**
 * GET /api/escrow/my
 * Returns the logged-in user's escrow transactions (as borrower or lender).
 */
const getMy = asyncHandler(async (req, res) => {
  const escrows = await EscrowTransaction.find({
    $or: [{ borrowerId: req.user._id }, { lenderId: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .populate('requestId', 'startDate endDate totalDays totalCost status')
    .populate('borrowerId', 'name')
    .populate('lenderId', 'name');

  return sendSuccess(res, 200, { escrows });
});

module.exports = { release, getMy };
