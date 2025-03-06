const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// Helper function to create token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedToken();
  
  // Set cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 || 30 * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  
  // Set secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  
  // Send response with cookie
  res
    .status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        quizzesTaken: user.quizzesTaken,
        quizzesCreated: user.quizzesCreated
      }
    });
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, bio } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'That email is already registered' 
          : 'That username is already taken'
      });
    }
    
    // Generate random avatar - I'm using Robohash because it's fun
    const avatar = `https://robohash.org/${username}?set=set3`;
    
    // Create user
    const newUser = await User.create({
      username,
      email,
      password,
      bio: bio || undefined,
      avatar,
      lastLogin: Date.now()
    });
    
    // Send token response
    sendTokenResponse(newUser, 201, res);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({
      success: false,
      message: 'Could not register user',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.checkPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    
    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // Get user from DB (to get updated stats)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {
      username: req.body.username,
      email: req.body.email,
      bio: req.body.bio,
      avatar: req.body.avatar
    };
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    // Check if username already exists
    if (fieldsToUpdate.username) {
      const existingUser = await User.findOne({ 
        username: fieldsToUpdate.username,
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'That username is already taken'
        });
      }
    }
    
    // Check if email already exists
    if (fieldsToUpdate.email) {
      const existingUser = await User.findOne({ 
        email: fieldsToUpdate.email,
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'That email is already registered'
        });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(400).json({
      success: false,
      message: 'Could not update profile',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/changepassword
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    if (!(await user.checkPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Change password error:', err);
    res.status(400).json({
      success: false,
      message: 'Could not change password'
    });
  }
};

// @desc    Get user's quizzes
// @route   GET /api/users/quizzes
// @access  Private
const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user.id });
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve quizzes'
    });
  }
};

// @desc    Get user's attempts
// @route   GET /api/users/attempts
// @access  Private
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .populate('quiz', 'title category')
      .sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (err) {
    console.error('Get attempts error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not retrieve attempts'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  getMyQuizzes,
  getMyAttempts
};