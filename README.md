# Quiz API

## Overview
The Quiz API is a backed system designed using **Node.js** and **Express.js**, with **MongoDB** as the database. The API allows users to create, manage, and attempt quizzes while handling authentication and authorization.

## Technologies Used
- **Node.js** (Runtime Environment)
- **Express.js** (Web Framework)
- **MongoDB** (Database via Mongoose)
- **JWT** (JSON Web Tokens) for Authentication
- **bcrypt.js** for Password Hashing
- **CORS** for Handling Cross-Origin Requests
- **Morgan** for Request Logging

## How to Run This Project

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **MongoDB** (Local or Cloud-based like MongoDB Atlas)

### Installation
Clone the repository and navigate into the project folder:
```sh
git clone <repo-url>
cd quiz-api
npm install
```

### Setup Environment Variables
Create a `.env` file in the root directory and add:
```
MONGOURI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
PORT=5000
```

### Running the Server
For development (hot reload enabled):
```sh
npm run dev
```
For production:
```sh
npm start
```

## API Endpoints

### User Routes (`/api/users`)
- **POST** `/register` - Register a new user
- **POST** `/login` - Login a user
- **GET** `/me` - Get current user details (Auth required)
- **PUT** `/me` - Update profile (Auth required)
- **GET** `/quizzes` - Get quizzes created by the user
- **GET** `/attempts` - Get user quiz attempts

### Quiz Routes (`/api/quizzes`)
- **GET** `/` - Fetch all quizzes
- **POST** `/` - Create a new quiz (Auth required)
- **PUT** `/:id` - Update a quiz (Quiz owner only)
- **DELETE** `/:id` - Delete a quiz (Quiz owner only)
- **POST** `/:id/questions` - Add a question
- **POST** `/:id/attempt` - Start an attempt

### Attempt Routes (`/api/attempts`)
- **POST** `/:id/submit` - Submit quiz attempt
- **GET** `/:id` - Get attempt details

## Dependencies
The project relies on the following Node.js packages:
```json
{
  "bcryptjs": "^3.0.2",
  "colors": "^1.4.0",
  "cors": "^2.8.5",
  "dotenv": "^16.4.7",
  "express": "^4.21.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.11.0",
  "morgan": "^1.10.0"
}
```

## Debugging & Fixes
During development, several issues were encountered and resolved. Here is one key debugging case:

### Issue: Users Couldn’t Login After Registering
#### **Problem**
Users registered successfully, but login failed due to password mismatch.

#### **Incorrect Fix**
The password was mistakenly hashed **twice** before storing it:
```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.password = await bcrypt.hash(this.password, 10); // Extra hashing
  next();
});
```
#### **Correct Fix**
Removed the extra hashing step:
```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

## Contribution
Feel free to contribute! Fork the repository, create a feature branch, and submit a pull request.

### Author
[Himavanth Kar](https://github.com/himavanthkar)

---


