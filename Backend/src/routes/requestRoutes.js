const express = require('express');
const { body } = require('express-validator');
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All request routes require authentication
router.use(protect);

// ── Validation ────────────────────────────────────────────────────────────────

const createValidation = [
  body('listingId').notEmpty().withMessage('Listing ID is required').isMongoId().withMessage('Invalid listing ID'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date format'),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('Invalid end date format'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

// IMPORTANT: specific named routes before parameterized routes
router.get('/outgoing',        requestController.getOutgoing);
router.get('/incoming',        requestController.getIncoming);
router.post('/',   createValidation, requestController.create);
router.patch('/:id/approve',   requestController.approve);
router.patch('/:id/reject',    requestController.reject);

module.exports = router;
