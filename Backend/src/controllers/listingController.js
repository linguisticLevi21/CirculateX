/**
 * controllers/listingController.js
 *
 * Handles all CRUD operations for listings.
 *
 * KEY PATTERNS:
 *
 * 1. Authorization check (not just authentication):
 *    auth middleware ensures the user is logged in (authentication).
 *    The controller checks the user OWNS the listing (authorization).
 *    These are separate concerns. Auth middleware can't do the ownership
 *    check because it doesn't know which listing is being requested.
 *
 * 2. Pagination on getAll:
 *    We don't return all listings in one response — that would break for
 *    thousands of listings. We use page + limit to paginate results.
 *
 * 3. Partial update (PATCH vs PUT):
 *    PATCH: update only the provided fields
 *    PUT: replace the entire resource
 *    We use PATCH because lenders should be able to update just the
 *    price without re-sending the entire listing object.
 *
 * 4. Cannot delete active listings:
 *    If a listing has an APPROVED or ACTIVE borrow request, deleting it
 *    would create orphaned records. We prevent this.
 */

const Listing = require('../models/Listing');
const BorrowRequest = require('../models/BorrowRequest');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');
const { validationResult } = require('express-validator');

/**
 * GET /api/listings
 * Public — browse all listings with search, filter, sort, pagination.
 */
const getAll = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    available,
    sort = 'newest',
    page = 1,
    limit = 20,
  } = req.query;

  // Build MongoDB query object incrementally
  const query = {};

  // Text search: match in title or description (case-insensitive regex)
  // WHY REGEX: We don't have a full-text search index yet. Regex on title/description
  // works for MVP. At scale, switch to MongoDB Atlas Search or vector embeddings.
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  // available query param: 'true' → only available, 'false' → only on loan
  if (available !== undefined) {
    query.available = available === 'true';
  }

  // Sort mapping
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { pricePerDay: 1 },
    'price-desc': { pricePerDay: -1 },
    rating: { rating: -1 },
  };
  const sortOption = sortMap[sort] || sortMap.newest;

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10))); // max 50
  const skip = (pageNum - 1) * limitNum;

  // Run query + count in parallel (Promise.all avoids sequential DB round trips)
  const [listings, total] = await Promise.all([
    Listing.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      // Populate lender info: only select needed fields (avoid sending passwordHash etc.)
      .populate('lenderId', 'name location avatar'),
    Listing.countDocuments(query),
  ]);

  return sendSuccess(res, 200, {
    listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  });
});

/**
 * GET /api/listings/my
 * Protected — returns listings owned by the logged-in user.
 * IMPORTANT: This route must be registered BEFORE /api/listings/:id
 * in the router, otherwise Express will try to match 'my' as an ObjectId.
 */
const getMy = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ lenderId: req.user._id })
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, { listings });
});

/**
 * GET /api/listings/:id
 * Public — get a single listing with full lender details.
 */
const getOne = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('lenderId', 'name location avatar createdAt');

  if (!listing) {
    return sendError(res, 404, 'Listing not found', 'LISTING_NOT_FOUND');
  }

  return sendSuccess(res, 200, { listing });
});

/**
 * POST /api/listings
 * Protected — create a new listing.
 */
const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg, 'VALIDATION_ERROR');
  }

  const { title, description, category, pricePerDay, deposit, location } = req.body;

  const listing = await Listing.create({
    title,
    description,
    category,
    pricePerDay: Number(pricePerDay),
    deposit: Number(deposit),
    location: location || req.user.location || null,
    // lenderId is always the logged-in user — never trust the client for this
    lenderId: req.user._id,
  });

  return sendSuccess(res, 201, { listing }, 'Listing created successfully');
});

/**
 * PATCH /api/listings/:id
 * Protected — update own listing (partial update).
 *
 * AUTHORIZATION: Must be the listing owner.
 * WHY .toString(): MongoDB ObjectId comparison requires string conversion.
 * listing.lenderId is an ObjectId. req.user._id is also an ObjectId.
 * Direct === comparison between two objects always returns false.
 */
const update = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return sendError(res, 404, 'Listing not found', 'LISTING_NOT_FOUND');
  }

  // Authorization check — are you the owner?
  if (listing.lenderId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'You can only edit your own listings', 'FORBIDDEN');
  }

  // Only allow updating these fields — never let client change lenderId
  const allowedFields = ['title', 'description', 'category', 'pricePerDay', 'deposit', 'location'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const updatedListing = await Listing.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true } // new: true returns the updated doc
  );

  return sendSuccess(res, 200, { listing: updatedListing }, 'Listing updated');
});

/**
 * DELETE /api/listings/:id
 * Protected — delete own listing.
 *
 * BUSINESS RULE: Cannot delete if there's an active/approved borrow request.
 * Deleting an active listing would create orphaned BorrowRequest records
 * and confuse the borrower and lender.
 */
const remove = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return sendError(res, 404, 'Listing not found', 'LISTING_NOT_FOUND');
  }

  if (listing.lenderId.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'You can only delete your own listings', 'FORBIDDEN');
  }

  // Check for active/approved requests
  const activeRequest = await BorrowRequest.findOne({
    listingId: listing._id,
    status: { $in: ['APPROVED', 'ACTIVE'] },
  });

  if (activeRequest) {
    return sendError(
      res,
      409,
      'Cannot delete a listing with an active borrow request',
      'LISTING_HAS_ACTIVE_REQUEST'
    );
  }

  await listing.deleteOne();

  return sendSuccess(res, 200, null, 'Listing deleted successfully');
});

module.exports = { getAll, getMy, getOne, create, update, remove };
