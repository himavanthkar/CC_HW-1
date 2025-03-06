const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  getMyQuizzes,
  getMyAttempts
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/changepassword', protect, changePassword);
router.get('/quizzes', protect, getMyQuizzes);
router.get('/attempts', protect, getMyAttempts);

module.exports = router;