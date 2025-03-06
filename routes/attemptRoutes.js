const express = require('express');
const router = express.Router();
const { submitAttempt, getAttempt } = require('../controllers/attemptController');
const { protect } = require('../middleware/auth');

router.post('/:id/submit', protect, submitAttempt);
router.get('/:id', protect, getAttempt);

module.exports = router;