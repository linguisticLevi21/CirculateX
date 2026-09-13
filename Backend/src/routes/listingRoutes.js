/**
 * routes/listingRoutes.js
 *
 * IMPORTANT ROUTE ORDER:
 * Express matches routes in the order they are defined.
 * GET /my must come BEFORE GET /:id.
 * If /:id comes first, Express tries to cast 'my' as a MongoDB ObjectId → error.
 */

const express = require('express');
const { body } = require('express-validator');
const listingController = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Validation ────────────────────────────────────────────────────────────────

const createValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Electronics', 'Gaming', 'Cameras', 'Tools', 'Music', 'Books', 'Outdoor', 'Other'])
    .withMessage('Invalid category'),
  body('pricePerDay')
    .notEmpty().withMessage('Daily price is required')
    .isFloat({ min: 1 }).withMessage('Price must be at least ₹1'),
  body('deposit')
    .notEmpty().withMessage('Security deposit is required')
    .isFloat({ min: 0 }).withMessage('Deposit cannot be negative'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// Public routes
router.get('/',    listingController.getAll);

// CRITICAL: 'my' route BEFORE '/:id' route
router.get('/my',  protect, listingController.getMy);
router.get('/:id', listingController.getOne);

// Protected routes
router.post('/',       protect, createValidation, listingController.create);
router.patch('/:id',   protect, listingController.update);
router.delete('/:id',  protect, listingController.remove);

module.exports = router;
