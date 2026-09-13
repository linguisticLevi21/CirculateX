/**
 * config/db.js
 *
 * WHY THIS EXISTS:
 * Centralizes the MongoDB connection logic in one place.
 * The server calls connectDB() once on startup. If connection fails,
 * we log the error and exit — there's no point running an API server
 * with no database.
 *
 * WHY MONGOOSE OVER NATIVE MONGODB DRIVER:
 * Mongoose gives us:
 *   1. Schema validation at the application layer
 *   2. Model-based queries (User.findOne, Listing.find, etc.)
 *   3. populate() for joining referenced documents
 *   4. Middleware hooks (pre-save, post-save)
 *   5. Virtuals and instance methods
 *
 * At our scale the overhead is negligible. For raw performance at millions
 * of queries/sec, the native driver would be appropriate.
 *
 * WHAT HAPPENS IF DB IS UNAVAILABLE:
 * Mongoose has built-in reconnection logic. If Atlas goes down temporarily,
 * Mongoose will try to reconnect. During that window, queries will fail
 * and our error handler will return 500 responses. This is acceptable
 * for an MVP — production systems add health checks and circuit breakers.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    // Exit the process — no point running the server without a database
    process.exit(1);
  }
};

module.exports = connectDB;
