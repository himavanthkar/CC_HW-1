const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors'); // added for some colored console logs
const morgan = require('morgan'); // logging requests

// Load env vars
dotenv.config();

// Import route files
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const attemptRoutes = require('./routes/attemptRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);

// Quick home route to check if API is running
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Quiz API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quizmaster');
    console.log(`Database connected successfully`.cyan.underline.bold);
  } catch (err) {
    console.error(`Error connecting to database: ${err.message}`.red);
    process.exit(1);
  }
};

// Connect to the database before starting the server
connectDB();

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`.yellow.bold);
  console.log(`Go to http://localhost:${PORT}`.blue);
});