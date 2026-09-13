/**
 * server.js — The Express application entry point.
 *
 * THIS FILE DOES THREE THINGS:
 * 1. Loads environment variables (must be FIRST — before any other import uses them)
 * 2. Configures the Express app (middleware stack + routes)
 * 3. Connects to MongoDB and starts listening on a port
 *
 * MIDDLEWARE ORDER MATTERS:
 * Express middleware runs in the order it's registered. The order here is:
 *
 *   1. helmet       — security headers (first, so every response gets them)
 *   2. cors         — allow frontend origin (before any route)
 *   3. morgan       — request logging (logs every incoming request)
 *   4. express.json — parse JSON bodies (before routes read req.body)
 *   5. cookieParser — parse cookies (before auth reads req.cookies)
 *   6. Routes       — business logic
 *   7. 404 handler  — catch unmatched routes
 *   8. errorHandler — catch all errors (MUST be last)
 *
 * WHY DOTENV IS LOADED FIRST:
 * If any module import at the top of this file uses process.env, those
 * env vars need to be loaded. dotenv.config() must run before any imports
 * that use environment variables.
 * Actually, in Node.js, all require() calls are synchronous, so we load
 * dotenv before using any env vars.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess, sendError } = require('./utils/response');

// Route modules
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const requestRoutes = require('./routes/requestRoutes');
const escrowRoutes = require('./routes/escrowRoutes');

// ── App Setup ─────────────────────────────────────────────────────────────────

const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────

/**
 * helmet — Sets various HTTP security headers automatically.
 * Protects against: clickjacking, MIME sniffing, XSS, information leakage.
 * Default helmet() enables:
 *   X-Frame-Options: SAMEORIGIN
 *   X-Content-Type-Options: nosniff
 *   Referrer-Policy: no-referrer
 *   X-XSS-Protection: 0 (modern browsers ignore this; CSP is better)
 *   Content-Security-Policy (basic)
 *   And removes X-Powered-By: Express (hides server info)
 */
app.use(helmet());

/**
 * cors — Allows only our frontend to make cross-origin requests.
 * credentials: true — required for cookies (refresh token) to work cross-origin.
 * WITHOUT cors: the browser would block all frontend → backend requests.
 *
 * WHY NOT origin: '*':
 * Wildcard CORS + credentials is not allowed by browsers anyway.
 * More importantly: it would allow any website to make authenticated
 * requests to our API on behalf of a logged-in user.
 */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // allow httpOnly cookies to be sent
}));

/**
 * morgan — HTTP request logger.
 * In development ('dev' format): logs method, URL, status, response time.
 * Example: GET /api/listings 200 45ms
 *
 * WHY LOGGING:
 * Without request logs, debugging API issues is like flying blind.
 * "Why did the frontend fail?" — check if the request even hit the server,
 * what URL it hit, and what status was returned.
 */
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

/**
 * express.json — Parses incoming JSON request bodies.
 * Without this, req.body is undefined.
 * limit: '10kb' — prevents excessively large payloads (basic DoS protection)
 */
app.use(express.json({ limit: '10kb' }));

/**
 * cookieParser — Parses cookies from the Cookie header into req.cookies.
 * Without this, req.cookies is undefined, so refresh token reading fails.
 */
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────

/**
 * Health check — quick way to verify server + DB are running.
 * Used by: manual testing, future monitoring tools, deployment health checks.
 */
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return sendSuccess(res, 200, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV,
  });
});

// Mount route modules under their base paths
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/escrow',   escrowRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────

/**
 * Catches any request to a route that doesn't exist.
 * Must come AFTER all valid routes, BEFORE the error handler.
 */
app.use((req, res) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND');
});

// ── Global Error Handler ──────────────────────────────────────────────────────

/**
 * MUST be the LAST middleware registered.
 * Express identifies error handlers by their 4-argument signature (err, req, res, next).
 * Any error passed via next(err) or thrown inside asyncHandler lands here.
 */
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB first — no point starting the HTTP server if DB is down
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 CirculateX API running on http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
