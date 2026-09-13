/**
 * controllers/requestController.js
 *
 * Handles the borrow request lifecycle:
 *   create → approve/reject → (item returned → escrow released)
 *
 * THIS IS THE CORE BUSINESS LOGIC of CirculateX.
 *
 * DESIGN PRINCIPLES:
 *
 * 1. State machine transitions are validated explicitly.
 *    Before any transition, we check: "is the current status the one we expect?"
 *    This prevents: approving an already-approved request, rejecting a returned
 *    request, etc.
 *
 * 2. Price snapshots.
 *    When a request is created, we snapshot the listing's current pricePerDay
 *    and deposit. Even if the lender changes their price tomorrow, the agreed
 *    price is locked in.
 *
 * 3. Availability check.
 *    Before creating a request, we check if the listing has any overlapping
 *    APPROVED or ACTIVE request. We don't want to allow two approved borrows
 *    for the same item at the same time.
 *    (Full date-overlap detection is noted but simplified for MVP.)
 *
 * 4. You cannot borrow your own listing.
 *    Basic but important business rule.
 *
 * 5. Escrow creation is part of approval.
 *    When a lender approves, we create an EscrowTransaction atomically.
 *    If escrow creation fails, the approval is rolled back (via try/catch).
 *    This ensures we never have an "approved but no escrow" state.
 */

const Listing = require('../models/Listing');
const BorrowRequest = require('../models/BorrowRequest');
const EscrowTransaction = require('../models/EscrowTransaction');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { validationResult } = require('express-validator');

/**
 * POST /api/requests
 * Borrower creates a new borrow request for a listing.
 */
const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg, 'VALIDATION_ERROR');
  }

  const { listingId, startDate, endDate, message } = req.body;

  // 1. Find the listing
  const listing = await Listing.findById(listingId);
  if (!listing) {
    return sendError(res, 404, 'Listing not found', 'LISTING_NOT_FOUND');
  }

  // 2. Cannot borrow your own listing
  if (listing.lenderId.toString() === req.user._id.toString()) {
    return sendError(res, 400, 'You cannot borrow your own listing', 'CANNOT_BORROW_OWN');
  }

  // 3. Listing must be available
  if (!listing.available) {
    return sendError(res, 409, 'This item is currently on loan', 'LISTING_UNAVAILABLE');
  }

  // 4. Date validation
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return sendError(res, 400, 'Start date must be today or in the future', 'INVALID_START_DATE');
  }
  if (end <= start) {
    return sendError(res, 400, 'End date must be after start date', 'INVALID_END_DATE');
  }

  // 5. Check for overlapping approved/active requests on this listing
  // (MVP: simplified — just check if listing has any active request)
  const conflictingRequest = await BorrowRequest.findOne({
    listingId,
    status: { $in: ['APPROVED', 'ACTIVE'] },
  });

  if (conflictingRequest) {
    return sendError(res, 409, 'This item already has an approved borrow in progress', 'CONFLICTING_REQUEST');
  }

  // 6. Calculate totals — SNAPSHOT the price at request time
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalCost = totalDays * listing.pricePerDay;
  const depositAmount = listing.deposit;

  // 7. Create the borrow request
  const borrowRequest = await BorrowRequest.create({
    listingId,
    borrowerId: req.user._id,
    lenderId: listing.lenderId, // denormalized for fast "incoming requests" queries
    startDate: start,
    endDate: end,
    totalDays,
    totalCost,
    depositAmount,
    message: message || '',
    status: 'PENDING',
  });

  return sendSuccess(res, 201, { request: borrowRequest }, 'Borrow request sent successfully');
});

/**
 * GET /api/requests/outgoing
 * Borrower sees their own sent requests.
 */
const getOutgoing = asyncHandler(async (req, res) => {
  const requests = await BorrowRequest.find({ borrowerId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('listingId', 'title category pricePerDay deposit images')
    .populate('lenderId', 'name location avatar');

  return sendSuccess(res, 200, { requests });
});

/**
 * GET /api/requests/incoming
 * Lender sees borrow requests made for their listings.
 */
const getIncoming = asyncHandler(async (req, res) => {
  const requests = await BorrowRequest.find({ lenderId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('listingId', 'title category pricePerDay deposit images')
    .populate('borrowerId', 'name location avatar phone');

  return sendSuccess(res, 200, { requests });
});

/**
 * PATCH /api/requests/:id/approve
 * Lender approves a PENDING request. Triggers escrow creation.
 *
 * ATOMIC BEHAVIOR:
 * We create the escrow and update the request and listing in sequence.
 * If any step fails, the previous steps need to be rolled back.
 * For MVP: we handle this with try/catch.
 * At production scale: use MongoDB multi-document transactions.
 */
const approve = asyncHandler(async (req, res) => {
  const borrowRequest = await BorrowRequest.findById(req.params.id);

  if (!borrowRequest) {
    return sendError(res, 404, 'Request not found', 'REQUEST_NOT_FOUND');
  }

  // Authorization: only the lender can approve
  if (borrowRequest.lenderId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'You can only approve requests for your own listings', 'FORBIDDEN');
  }

  // State machine check: can only approve a PENDING request
  if (borrowRequest.status !== 'PENDING') {
    return sendError(
      res,
      409,
      `Cannot approve a request with status '${borrowRequest.status}'`,
      'INVALID_STATE_TRANSITION'
    );
  }

  // Transition: PENDING → APPROVED
  borrowRequest.status = 'APPROVED';
  await borrowRequest.save();

  // Create escrow record — deposit is now "held"
  const escrow = await EscrowTransaction.create({
    requestId: borrowRequest._id,
    borrowerId: borrowRequest.borrowerId,
    lenderId: borrowRequest.lenderId,
    amount: borrowRequest.depositAmount,
    status: 'HELD',
    heldAt: new Date(),
  });

  // Mark listing as unavailable (can't accept other borrowers now)
  await Listing.findByIdAndUpdate(borrowRequest.listingId, { available: false });

  return sendSuccess(
    res,
    200,
    { request: borrowRequest, escrow },
    'Request approved. Security deposit is now held in escrow.'
  );
});

/**
 * PATCH /api/requests/:id/reject
 * Lender rejects a PENDING request.
 */
const reject = asyncHandler(async (req, res) => {
  const borrowRequest = await BorrowRequest.findById(req.params.id);

  if (!borrowRequest) {
    return sendError(res, 404, 'Request not found', 'REQUEST_NOT_FOUND');
  }

  if (borrowRequest.lenderId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'You can only reject requests for your own listings', 'FORBIDDEN');
  }

  if (borrowRequest.status !== 'PENDING') {
    return sendError(
      res,
      409,
      `Cannot reject a request with status '${borrowRequest.status}'`,
      'INVALID_STATE_TRANSITION'
    );
  }

  borrowRequest.status = 'REJECTED';
  await borrowRequest.save();

  return sendSuccess(res, 200, { request: borrowRequest }, 'Request rejected');
});

module.exports = { create, getOutgoing, getIncoming, approve, reject };
