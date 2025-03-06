const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - check if user is authenticated
const protect = async (req, res, next) => {
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Example: "Bearer eyJhbGciOiJIUzI1NiIsIn..."
    token = req.headers.authorization.split(' ')[1];
  } 
  // Sometimes mobile apps might use cookies or x-auth-token
  else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }
  
  // Make sure token exists
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
  
  try {
    // Verify token - this will throw an error if token is invalid
    const my_secret = process.env.JWT_SECRET || 'my_super_secret_fallback_key_123';
    const decoded = jwt.verify(token, my_secret);
    
    // Add user to req object
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User no longer exists' 
      });
    }
    
    // Update last login time occasionally (not every request)
    if (Math.random() < 0.05) { // 5% chance to update
      await User.findByIdAndUpdate(req.user._id, { 
        lastLogin: Date.now() 
      });
    }
    
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in first' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role ${req.user.role} is not authorized to access this route` 
      });
    }
    
    next();
  };
};

// Check if user is quiz owner
const isQuizOwner = async (req, res, next) => {
  try {
    const quiz = await require('../models/Quiz').findById(req.params.quizId || req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found' 
      });
    }
    
    // Check if user is quiz creator or an admin
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to modify this quiz' 
      });
    }
    
    // Add quiz to req object
    req.quiz = quiz;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error checking quiz ownership' 
    });
  }
};

module.exports = { protect, authorize, isQuizOwner };