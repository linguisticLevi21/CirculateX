/**
 * utils/asyncHandler.js
 *
 * WHY THIS EXISTS:
 * Every async route handler can throw errors (DB failures, validation errors, etc.).
 * Without this wrapper, we'd need try/catch in EVERY controller function:
 *
 *   async (req, res) => {
 *     try { ... } catch(err) { next(err); }  // repeated everywhere
 *   }
 *
 * asyncHandler wraps any async function and forwards any thrown error to
 * Express's global error middleware via next(err). This keeps controllers clean.
 *
 * USAGE:
 *   router.get('/listings', asyncHandler(listingController.getAll));
 *
 * If listingController.getAll throws, asyncHandler catches it and calls next(err),
 * which routes to our errorHandler middleware.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
