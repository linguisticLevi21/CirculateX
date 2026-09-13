const express = require('express');
const escrowController = require('../controllers/escrowController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/release', escrowController.release);
router.get('/my',       escrowController.getMy);

module.exports = router;
