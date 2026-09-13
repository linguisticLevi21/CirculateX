/**
 * middleware/errorHandler.js
 *
 * WHY THIS EXISTS:
 * Express has a special 4-argument middleware signature (err, req, res, next)
 * that acts as a global error handler. When any middleware or route handler
 * calls next(err) or throws inside an asyncHandler, Express routes the error
 * here.
 *
 * WITHOUT THIS:
 * Each controller would need its own try/catch + custom error formatting.
 * Errors would look different across endpoints. Some might accidentally
 * expose stack traces in production.
 *
 * WITH THIS:
 * - All errors are caught in one place
 * - Consistent JSON response format
 * - Stack traces hidden in production
 * - Mongoose validation errors are parsed into readable messages
 * - Duplicate key errors (e.g., email already exists) give helpful messages
 *
 * HOW TO USE:
 * Register LAST in server.js, after all routes:
 *   app.use(errorHandler);
 *
 * INTERVIEW ANSWER:
 * "I use Express's 4-argument error middleware as a global catch-all.
 * Every async controller is wrapped in asyncHandler which forwards any
 * thrown error to this middleware. It normalizes Mongoose errors, JWT errors,
 * and custom errors into the same JSON envelope, and hides stack traces
 * in production."
 */

const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  // Log the full error in development, just the message in production
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  } else {
    console.error('❌ Error:', err.message);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  // ── Mongoose Validation Error ─────────────────────────────────────────────
  // Happens when data doesn't pass schema validation (e.g., required field missing)
  // err.name === 'ValidationError' is set by Mongoose
  if (err.name === 'ValidationError') {
    // Extract all validation messages into one readable string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  }

  // ── Mongoose Duplicate Key Error ──────────────────────────────────────────
  // Happens when unique index is violated (e.g., email already registered)
  // MongoDB error code 11000 = duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} is already in use`;
    statusCode = 409; // 409 Conflict
    errorCode = 'DUPLICATE_KEY';
  }

  // ── Mongoose Cast Error ───────────────────────────────────────────────────
  // Happens when an invalid ObjectId is passed (e.g., /listings/not-an-id)
  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
    errorCode = 'INVALID_ID';
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token has expired';
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
  }

  // Hide internal error details in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
  }

  return sendError(res, statusCode, message, errorCode);
};

module.exports = errorHandler;
