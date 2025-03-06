
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const colors = require('colors'); // added for some colored console logs
const morgan = require('morgan'); // logging requests

// Import routes
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const attemptRoutes = require('./routes/attemptRoutes');

// Initialize app
const app = express();

// My middleware setup
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Let's log all requests

// MongoDB connection - using my personal connection string format
const db_uri = process.env.MONGO_URI || 'mongodb://localhost:27017/quiz-maker-db';
console.log(`Attempting to connect to database at ${db_uri}`.yellow);

mongoose.connect(db_uri)
  .then(() => console.log('Database connected successfully'.green.bold))
  .catch(err => {
    console.error('DB Connection failed:'.red, err.message);
    process.exit(1); // Exit if DB connection fails - critical error
  });

// My routes
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);

// Quick home route to check if API is running
app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to QuizMaster API 🎮", 
    version: "1.0.0",
    author: "Your Name"
  });
});

// Global error handler - nothing fancy
app.use((err, req, res, next) => {
  console.error(' Error:'.red.bold, err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went very wrong!',
    // Only show stack trace in development - never in production
    stackTrace: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 5000; // I prefer port 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`.cyan.bold);
  console.log(`Go to http://localhost:${PORT}`);
});