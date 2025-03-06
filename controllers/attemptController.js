const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

// Start quiz attempt
const startAttempt = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    if (!quiz.isPublic && quiz.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to attempt this quiz'
      });
    }
    
    const attempt = await Attempt.create({
      user: req.user.id,
      quiz: quiz._id,
      status: 'started',
      startTime: Date.now()
    });
    
    const attemptQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        text: q.text,
        choices: q.choices,
        points: q.points,
        difficulty: q.difficulty
      }))
    };
    
    if (quiz.shuffleQuestions) {
      attemptQuiz.questions = shuffleArray(attemptQuiz.questions);
    }
    
    res.status(201).json({
      success: true,
      attemptId: attempt._id,
      data: attemptQuiz
    });
  } catch (err) {
    console.error('Start attempt error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not start quiz attempt'
    });
  }
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Submit quiz attempt
const submitAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    if (attempt.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this attempt'
      });
    }
    
    if (attempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This attempt has already been submitted'
      });
    }
    
    const quiz = await Quiz.findById(attempt.quiz);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    const answers = req.body.answers || [];
    const processedAnswers = [];
    let totalScore = 0;
    
    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      
      if (!question) {
        continue;
      }
      
      const isCorrect = question.rightAnswer === answer.selectedChoice;
      
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;
      
      processedAnswers.push({
        questionId: answer.questionId,
        selectedChoice: answer.selectedChoice,
        isCorrect,
        pointsEarned,
        timeTaken: answer.timeTaken || 0
      });
    }
    
    const maxPossibleScore = quiz.questions.reduce((total, q) => total + q.points, 0);
    const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);
    
    attempt.answers = processedAnswers;
    attempt.totalScore = totalScore;
    attempt.percentageScore = percentageScore;
    attempt.passed = percentageScore >= quiz.passingScore;
    attempt.status = 'completed';
    attempt.finishTime = Date.now();
    attempt.totalTimeTaken = Math.round((Date.now() - attempt.startTime) / 1000);
    
    await attempt.save();
    
    await Quiz.findByIdAndUpdate(quiz._id, {
      $inc: { attempts: 1 },
      $set: { avgScore: (quiz.avgScore * quiz.attempts + percentageScore) / (quiz.attempts + 1) }
    });
    
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { quizzesTaken: 1 }
    });
    
    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        totalScore,
        percentageScore,
        passed: attempt.passed,
        totalQuestions: quiz.questions.length,
        answeredCorrectly: processedAnswers.filter(a => a.isCorrect).length,
        timeTaken: attempt.totalTimeTaken,
        feedback: generateFeedback(percentageScore, quiz.passingScore)
      }
    });
  } catch (err) {
    console.error('Submit attempt error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not submit quiz attempt'
    });
  }
};

function generateFeedback(score, passingScore) {
  if (score >= 90) {
    return 'Excellent! You aced this quiz.';
  } else if (score >= 80) {
    return 'Great job! You really know your stuff.';
  } else if (score >= passingScore) {
    return 'Good work! You passed the quiz.';
  } else if (score >= passingScore - 10) {
    return 'So close! Try again, you can do it.';
  } else {
    return 'Keep studying and try again soon.';
  }
}

// Get attempt details
const getAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate('quiz', 'title description category');
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }
    
    const quiz = await Quiz.findById(attempt.quiz);
    
    if (attempt.user.toString() !== req.user.id && 
        quiz.creator.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this attempt'
      });
    }
    
    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (err) {
    console.error('Get attempt error:', err);
    res.status(500).json({
      success: false,
      message: 'Could not get attempt'
    });
  }
};

module.exports = {
  startAttempt,
  submitAttempt,
  getAttempt
};