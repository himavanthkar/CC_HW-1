const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Create new quiz
const createQuiz = async (req, res, next) => {
  try {
    req.body.creator = req.user.id;
    
    const quiz = await Quiz.create(req.body);
    
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    console.error('Create quiz error:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Could not create quiz'
    });
  }
};

// Get all quizzes
const getQuizzes = async (req, res, next) => {
  try {
    let query;
    
    const reqQuery = { ...req.query };
    
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    
    removeFields.forEach(param => delete reqQuery[param]);
    
    if (!req.user) {
      reqQuery.isPublic = true;
    }
    
    if (req.query.search) {
      reqQuery.title = { $regex: req.query.search, $options: 'i' };
    }
    
    let queryStr = JSON.stringify(reqQuery);
    
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = Quiz.find(JSON.parse(queryStr));
    
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Quiz.countDocuments(JSON.parse(queryStr));
    
    query = query.skip(startIndex).limit(limit);
    
    query = query.populate('creator', 'username avatar');
    
    const quizzes = await query;
    
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      pagination,
      data: quizzes
    });
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not get quizzes'
    });
  }
};

// Get single quiz
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('creator', 'username avatar bio');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: `Quiz not found with id ${req.params.id}`
      });
    }
    
    if (!quiz.isPublic && (!req.user || quiz.creator._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'This quiz is private'
      });
    }
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    console.error('Get quiz error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid quiz ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Could not get quiz'
    });
  }
};

// Update quiz
const updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }
    
    delete req.body.creator;
    
    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    console.error('Update quiz error:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Could not update quiz'
    });
  }
};

// Delete quiz
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }
    
    await quiz.remove();
    
    await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { quizzesCreated: -1 } }
    );
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not delete quiz'
    });
  }
};

// Add question to quiz
const addQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this quiz'
      });
    }
    
    const question = {
      text: req.body.text || req.body.questionText,
      choices: req.body.choices || req.body.options,
      rightAnswer: req.body.rightAnswer || req.body.correctAnswer,
      explanation: req.body.explanation,
      points: req.body.points || 10,
      difficulty: req.body.difficulty || 'medium'
    };
    
    quiz.questions.push(question);
    
    await quiz.save();
    
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    console.error('Add question error:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Could not add question'
    });
  }
};

// Update question
const updateQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this quiz'
      });
    }
    
    const question = quiz.questions.id(req.params.questionId);
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    if (req.body.text || req.body.questionText) {
      question.text = req.body.text || req.body.questionText;
    }
    
    if (req.body.choices || req.body.options) {
      question.choices = req.body.choices || req.body.options;
    }
    
    if (req.body.rightAnswer !== undefined || req.body.correctAnswer !== undefined) {
      question.rightAnswer = req.body.rightAnswer !== undefined 
        ? req.body.rightAnswer 
        : req.body.correctAnswer;
    }
    
    if (req.body.explanation !== undefined) {
      question.explanation = req.body.explanation;
    }
    
    if (req.body.points !== undefined) {
      question.points = req.body.points;
    }
    
    if (req.body.difficulty) {
      question.difficulty = req.body.difficulty;
    }
    
    await quiz.save();
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    console.error('Update question error:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Could not update question'
    });
  }
};

// Delete question
const deleteQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (quiz.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this quiz'
      });
    }
    
    if (!quiz.questions.id(req.params.questionId)) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }
    
    quiz.questions.pull(req.params.questionId);
    
    await quiz.save();
    
    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not delete question'
    });
  }
};

// Get featured quizzes
const getFeaturedQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ 
      isPublic: true,
      featuredStatus: true 
    })
    .sort('-createdAt')
    .limit(5)
    .populate('creator', 'username avatar');
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (err) {
    console.error('Get featured quizzes error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not get featured quizzes'
    });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getFeaturedQuizzes
};