/**
 * routes/authRoutes.js
 *
 * WHY ROUTES ARE SEPARATE FROM CONTROLLERS:
 * Routes define the "contract": URL path + HTTP method + middleware chain.
 * Controllers define the "behavior": what happens for that contract.
 * Separating them means you can read this file and know every auth endpoint
 * without understanding the business logic.
 *
 * express-validator rules are defined inline here (as middleware arrays)
 * so the validation intent is visible at the route level.
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Validation Middleware ─────────────────────────────────────────────────────

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────

router.post('/register', registerValidation, authController.register);
router.post('/login',    loginValidation,    authController.login);
router.get('/me',        protect,            authController.getMe);
router.post('/refresh',                      authController.refresh);
router.post('/logout',   protect,            authController.logout);

module.exports = router;
