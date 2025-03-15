import React from 'react';
import { Link } from 'react-router-dom';
import { FaHatWizard, FaFootballBall, FaBaseballBall } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Quiz Master</h5>
            <p>
              Test your knowledge on various topics with our engaging quizzes.
              From Harry Potter to Cricket, from Football to general knowledge,
              we've got quizzes for everyone!
            </p>
          </div>
          <div className="col-md-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-white">Home</Link></li>
              <li><Link to="/quizzes" className="text-white">Quizzes</Link></li>
              <li><Link to="/register" className="text-white">Register</Link></li>
              <li><Link to="/login" className="text-white">Login</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>Popular Themes</h5>
            <ul className="list-unstyled">
              <li><FaHatWizard className="me-2" /><span className="text-warning">Harry Potter</span></li>
              <li><FaBaseballBall className="me-2" /><span className="text-success">Cricket</span></li>
              <li><FaFootballBall className="me-2" /><span className="text-danger">Football</span></li>
              <li><span className="text-primary">General Knowledge</span></li>
            </ul>
          </div>
        </div>
        <hr />
        <div className="text-center">
          <p>
            &copy; {new Date().getFullYear()} Quiz Master. All rights reserved.
            <br />
            <small>
              "Knowledge is Power!"
            </small>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 