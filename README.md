# Quiz Master Application

A full-featured quiz application that allows users to create, share, and take quizzes on various topics.

## Features

- User authentication (register, login, profile management)
- Create and manage quizzes with multiple-choice questions
- Take quizzes and receive immediate feedback on answers
- View quiz results and statistics
- Browse public quizzes by category
- Dashboard to track quiz attempts and created quizzes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```
git clone <repository-url>
cd quiz-master
```

2. Install dependencies
```
npm install
cd frontend
npm install
cd ..
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/quizmaster
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
```

4. Run the application
```
npm run dev
```

This will start both the backend server (port 5001) and the frontend development server (port 3000).

## How to Use the Application

### Creating a Quiz

1. **Register/Login**: Create an account or log in to an existing account.
2. **Access Dashboard**: Navigate to the Dashboard and click on "Create Quiz".
3. **Basic Information**: Fill in the quiz title, description, category, and other settings.
4. **Add Questions**: For each question:
   - Enter the question text
   - Add multiple choice options (2-6 choices)
   - Select which option is the correct answer (this is stored as the index of the correct option)
   - Optionally add an explanation that will be shown after answering
   - Set the point value and difficulty level
5. **Save Quiz**: Click "Save Quiz" to publish your quiz.

### Taking a Quiz

1. **Browse Quizzes**: Go to the "Quizzes" page to see available quizzes.
2. **Start Quiz**: Click on a quiz card and then "Take Quiz" to begin.
3. **Answer Questions**: For each question:
   - Select your answer from the multiple-choice options
   - Click "Next Question" to proceed
   - You'll receive immediate feedback on whether your answer was correct
   - The explanation will be shown if provided by the quiz creator
4. **View Results**: After completing all questions, you'll see your final score and a breakdown of your answers.
5. **Review**: You can review all questions, your answers, and the correct answers on the results page.

### How Correct Answers Work

- When creating a quiz, the creator selects which option is correct for each question.
- This is stored in the database as the `rightAnswer` field, which is the index of the correct option.
- When a user takes a quiz, their selected answer index is compared to the stored `rightAnswer` index.
- If they match, the answer is marked as correct and points are awarded.
- All answers and results are saved in the database for later review.

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user profile

### Quizzes
- `GET /api/quizzes` - Get all public quizzes
- `GET /api/quizzes/:id` - Get a specific quiz
- `POST /api/quizzes` - Create a new quiz
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Delete a quiz

### Questions
- `POST /api/quizzes/:id/questions` - Add a question to a quiz
- `PUT /api/quizzes/:id/questions/:questionId` - Update a question
- `DELETE /api/quizzes/:id/questions/:questionId` - Delete a question

### Attempts
- `POST /api/quizzes/:id/attempt` - Start a new quiz attempt
- `POST /api/attempts/:id/answer` - Submit an answer for a question
- `PUT /api/attempts/:id/complete` - Complete a quiz attempt
- `GET /api/attempts/:id` - Get a specific attempt
- `GET /api/attempts` - Get all attempts for the current user

## Technologies Used

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, React Router, Context API
- **Authentication**: JWT, bcrypt
- **Styling**: Bootstrap, CSS

## Quiz Application - Postman API Testing Documentation ( The formatting for the pictures is a bit jumbled, this documentation is again neatly organised in hw-2 too in a document along with the website screenshots in hw-2
## 📘 Quiz Application – Postman API Testing Documentation

📝 *Note: The formatting for the pictures is a bit jumbled in markdown view. This documentation is also neatly organized in the HW-2 document.*

---

### 🔐 User Login Test  
**Endpoint:** `POST /api/users/login`  
Tests login API with email and password. Returns JWT token and user data.

---

### 1. Get User Profile  
**GET** `/api/users/me`  
Fetches logged-in user’s profile details with Bearer token.  
<img width="432" alt="Get User Profile" src="https://github.com/user-attachments/assets/532d8826-e8be-44a4-b6cd-1a9d21b649e7" />

---

### 2. Start Quiz Attempt  
**POST** `/api/quizzes/:id/attempt`  
Starts the quiz attempt and returns the quiz and questions.  
<img width="432" alt="Start Quiz Attempt" src="https://github.com/user-attachments/assets/29e2b96f-44c5-4569-9bb5-65dcc0cf0db7" />

---

### 3. Get Specific Quiz  
**GET** `/api/quizzes/:id`  
Fetches quiz details including questions.  
<img width="427" alt="Get Specific Quiz" src="https://github.com/user-attachments/assets/cc28b60e-e788-4279-b6ea-183fd378d75e" />

---

### 4. Create Quiz  
**POST** `/api/quizzes`  
Creates a new quiz with questions, correct answers, and metadata.  
<img width="421" alt="Create Quiz" src="https://github.com/user-attachments/assets/4e80de00-9df3-4a38-9685-4118664304ff" />

---

### 5. Fetch Featured Quizzes  
**GET** `/api/quizzes/featured`  
Fetches all featured quizzes. Shows empty array if none are featured.  
<img width="432" alt="Featured Quizzes" src="https://github.com/user-attachments/assets/e87e41a4-e628-4129-96c9-918b5732f352" />

---

### 6. Get All Quizzes  
**GET** `/api/quizzes`  
Fetches all available quizzes.  
<img width="424" alt="All Quizzes" src="https://github.com/user-attachments/assets/b1b7696b-b865-49e2-83f8-bcc0167f98fb" />

---

### 7. User Registration Error  
**POST** `/api/users/register`  
Error test for duplicate email during registration.  
<img width="423" alt="User Registration Error" src="https://github.com/user-attachments/assets/44806968-4813-45b5-a3ca-39bab61fd671" />

---

### 8. Submit Answer  
**POST** `/api/attempts/:id/answer`  
Submits the answer for a question, returns correctness and points.  
<img width="432" alt="Submit Answer" src="https://github.com/user-attachments/assets/ccb2ab29-17af-4512-8190-f396eb21f352" />

---



