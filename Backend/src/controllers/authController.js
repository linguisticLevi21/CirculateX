/**
 * controllers/authController.js
 *
 * Handles: register, login, getMe, refresh, logout
 *
 * WHY CONTROLLERS EXIST:
 * The controller's job is to:
 *   1. Read from req (body, params, user)
 *   2. Execute business logic (validate, hash, create, query)
 *   3. Write to res (send the response)
 *
 * Controllers do NOT touch the router. They do NOT import express.
 * They do NOT define URL paths. That's the routes/ layer's job.
 * This separation means you can test controller logic without an HTTP server.
 *
 * TOKEN STRATEGY (access + refresh):
 *   - Access token: 15min TTL, sent in JSON body
 *     Client stores in memory (not localStorage — XSS risk)
 *     Sent as "Authorization: Bearer <token>" on every API call
 *   - Refresh token: 7d TTL, sent as httpOnly cookie
 *     Client CANNOT read it (XSS protection)
 *     Sent automatically by browser on /api/auth/refresh
 *     Used ONLY to get a new access token
 *
 * TIMING ATTACK PREVENTION (login):
 * We run bcrypt.compare even when the user doesn't exist.
 * WHY: bcrypt.compare takes ~300ms. If we returned immediately for
 * "user not found", an attacker could distinguish "user doesn't exist"
 * (fast response) from "wrong password" (slow response) by measuring
 * response time. Running compare with a dummy hash prevents this.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

// ── HELPERS ───────────────────────────────────────────────────────────────────

/**
 * generateAccessToken(userId)
 * Signs a short-lived JWT with the user's ID as the payload.
 * The payload is minimal — we don't put the whole user in the token.
 * WHY: Tokens can be decoded (not decrypted) by anyone. Put minimal data.
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

/**
 * generateRefreshToken(userId)
 * Signs a long-lived JWT used only to issue new access tokens.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * setRefreshCookie(res, token)
 * Sets the refresh token as an httpOnly cookie.
 * httpOnly: true → JavaScript cannot read this cookie (XSS protection)
 * secure: true in production → cookie only sent over HTTPS
 * sameSite: 'strict' → cookie not sent on cross-site requests (CSRF protection)
 */
const setRefreshCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax', // 'lax' allows localhost dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

// ── CONTROLLERS ───────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new user account and returns tokens.
 */
const register = asyncHandler(async (req, res) => {
  // Check express-validator results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg, 'VALIDATION_ERROR');
  }

  const { name, email, password, phone, location } = req.body;

  // Hash the password BEFORE saving to DB.
  // Cost factor 12 = 4096 iterations. ~300ms on modern hardware.
  // This is intentionally slow — makes brute force attacks expensive.
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user document — Mongoose validates against schema before saving
  // If email is duplicate, MongoDB throws error code 11000
  // which our errorHandler converts to a readable "Email is already in use" message
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone: phone || null,
    location: location || null,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token hash in DB for logout invalidation
  // We hash it so if the DB is compromised, the refresh token itself isn't exposed
  user.refreshToken = await bcrypt.hash(refreshToken, 8); // lower cost — not a password
  await user.save();

  // Set refresh token as httpOnly cookie
  setRefreshCookie(res, refreshToken);

  return sendSuccess(
    res,
    201,
    { accessToken, user: user.toSafeObject() },
    'Account created successfully'
  );
});

/**
 * POST /api/auth/login
 * Verifies credentials and returns tokens.
 *
 * SECURITY NOTE: We return the same error message whether the email
 * doesn't exist OR the password is wrong. This prevents user enumeration
 * — an attacker can't tell which accounts exist by testing emails.
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, errors.array()[0].msg, 'VALIDATION_ERROR');
  }

  const { email, password } = req.body;

  // Find user by email. We need passwordHash for comparison,
  // so we explicitly select it (it's excluded by default via select:false)
  const user = await User.findOne({ email }).select('+passwordHash +refreshToken');

  // TIMING ATTACK PREVENTION:
  // Even if user doesn't exist, we run bcrypt.compare with a dummy hash.
  // This ensures the response time is consistent (~300ms) whether the
  // email exists or not. Without this, an attacker could enumerate users
  // by measuring response time (fast = no user, slow = wrong password).
  const DUMMY_HASH = '$2b$12$dummy.hash.to.prevent.timing.attack.on.user.enumeration';
  const isMatch = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH);

  if (!user || !isMatch) {
    // Same message regardless of which check failed — no enumeration
    return sendError(res, 401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update stored refresh token hash
  user.refreshToken = await bcrypt.hash(refreshToken, 8);
  await user.save();

  setRefreshCookie(res, refreshToken);

  return sendSuccess(
    res,
    200,
    { accessToken, user: user.toSafeObject() },
    'Logged in successfully'
  );
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * req.user is already set by the protect middleware.
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, req.user.toSafeObject());
});

/**
 * POST /api/auth/refresh
 * Uses the refresh token cookie to issue a new access token.
 * This is called silently by the frontend when the access token expires.
 */
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return sendError(res, 401, 'Refresh token not provided', 'NO_REFRESH_TOKEN');
  }

  // Verify the refresh token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return sendError(res, 401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  // Find the user and check their stored refresh token hash
  const user = await User.findById(decoded.userId).select('+refreshToken');

  if (!user || !user.refreshToken) {
    return sendError(res, 401, 'Session expired, please log in again', 'SESSION_EXPIRED');
  }

  // Verify that the cookie token matches the stored hash
  // This check ensures logout invalidates old refresh tokens
  const isValidRefresh = await bcrypt.compare(token, user.refreshToken);
  if (!isValidRefresh) {
    return sendError(res, 401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }

  // Issue a new access token
  const newAccessToken = generateAccessToken(user._id);

  return sendSuccess(res, 200, { accessToken: newAccessToken });
});

/**
 * POST /api/auth/logout
 * Clears the refresh token cookie and invalidates the stored token.
 * After this, the refresh token is useless even if it was stolen.
 */
const logout = asyncHandler(async (req, res) => {
  // Clear the refresh token from DB
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

  // Clear the cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  return sendSuccess(res, 200, null, 'Logged out successfully');
});

module.exports = { register, login, getMe, refresh, logout };
