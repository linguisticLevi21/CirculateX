/**
 * middleware/auth.js
 *
 * PURPOSE: Verify JWT access token and attach the decoded user to req.user.
 *
 * HOW IT WORKS:
 * 1. Read the Authorization header: "Bearer <token>"
 * 2. Extract the token part
 * 3. Verify the token signature with jwt.verify() using our secret
 * 4. If valid: find the user in DB, attach to req.user, call next()
 * 5. If invalid/expired: return 401 Unauthorized
 *
 * WHY WE FETCH FROM DB (not just use JWT payload):
 * The JWT payload contains userId, name, email at the time of login.
 * If the user changes their email or is deactivated after login, the JWT
 * payload would be stale. Fetching from DB ensures we always have current data.
 * TRADE-OFF: One extra DB query per protected request.
 * At our scale this is fine. At massive scale, we'd accept the stale-data
 * risk and trust the payload directly.
 *
 * WHY 'protect' (not 'authenticate'):
 * The function name 'protect' reads naturally in route definitions:
 *   router.post('/listings', protect, listingController.create)
 * "This route is protected."
 *
 * INTERVIEW ANSWER:
 * "My auth middleware extracts the Bearer token from the Authorization header,
 * verifies its signature with jwt.verify(), then queries the DB for the user
 * to ensure the account still exists. It attaches the user to req.user so
 * subsequent middleware and controllers can use it without another DB call.
 * If the token is missing, malformed, or expired, it returns 401."
 */

const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { sendError } = require('../utils/response');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for Authorization header with Bearer scheme
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token found
  if (!token) {
    return sendError(res, 401, 'You must be logged in to access this resource', 'NOT_AUTHENTICATED');
  }

  // Verify token — throws JsonWebTokenError or TokenExpiredError if invalid
  // Both are caught by errorHandler middleware
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  // Fetch the user from DB to ensure they still exist
  // We do NOT select passwordHash or refreshToken (excluded by default)
  const user = await User.findById(decoded.userId);

  if (!user) {
    return sendError(res, 401, 'User account no longer exists', 'USER_NOT_FOUND');
  }

  // Attach user to request — available in all subsequent middleware + controllers
  req.user = user;
  next();
});

module.exports = { protect };
