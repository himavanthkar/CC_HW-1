import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QuizContext } from '../context/QuizContext';
import Spinner from '../components/layout/Spinner';
import { FaHatWizard, FaFootballBall, FaBaseballBall, FaStar, FaBrain } from 'react-icons/fa';

const Home = () => {
  const { featuredQuizzes, loading, getFeaturedQuizzes } = useContext(QuizContext);

  useEffect(() => {
    getFeaturedQuizzes();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="jumbotron text-center bg-dark text-white py-5">
        <div className="container">
          <h1 className="display-4 d-flex align-items-center justify-content-center">
            <div className="d-flex me-3">
              <FaHatWizard className="me-2" />
              <FaFootballBall className="me-2" />
              <FaBaseballBall className="me-2" />
            </div>
            Welcome to Quiz Master
          </h1>
          <p className="lead">
            Test your knowledge on various topics with our engaging quizzes
          </p>
          <hr className="my-4" />
          <p>
            From Harry Potter to Cricket, from Football to general knowledge,
            we've got quizzes for everyone!
          </p>
          <Link to="/quizzes" className="btn btn-primary btn-lg me-3">
            Browse Quizzes
          </Link>
          <Link to="/register" className="btn btn-outline-light btn-lg">
            Join Now
          </Link>
        </div>
      </div>

      {/* Featured Quizzes */}
      <div className="container my-5">
        <h2 className="text-center mb-4">
          <FaStar className="text-warning me-2" />
          Featured Quizzes
        </h2>
        
        {loading ? (
          <Spinner />
        ) : featuredQuizzes.length === 0 ? (
          <div className="alert alert-info text-center">
            No featured quizzes available at the moment. Check back soon!
          </div>
        ) : (
          <div className="row">
            {featuredQuizzes.map(quiz => (
              <div className="col-md-4 mb-4" key={quiz._id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="card-title mb-0">{quiz.title}</h5>
                  </div>
                  <img 
                    src={quiz.quizImage || `https://picsum.photos/seed/${quiz._id}/300/150`} 
                    alt={quiz.title} 
                    className="card-img-top"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <p className="card-text">{quiz.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {quiz.questions.length} questions
                      </small>
                      <span className="badge bg-info rounded-pill">
                        {quiz.category}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer bg-white">
                    <Link to={`/quizzes/${quiz._id}`} className="btn btn-primary w-100">
                      View Quiz
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Categories */}
      <div className="container-fluid py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Popular Categories</h2>
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="card text-white bg-warning h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">Harry Potter</h3>
                  <FaHatWizard className="fa-4x my-3" />
                  <p className="card-text">
                    Test your knowledge of the wizarding world with our magical quizzes!
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card text-white bg-success h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">Cricket</h3>
                  <FaBaseballBall className="fa-4x my-3" />
                  <p className="card-text">
                    From IPL to World Cup, challenge yourself with cricket trivia!
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card text-white bg-danger h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">Football</h3>
                  <FaFootballBall className="fa-4x my-3" />
                  <p className="card-text">
                    Premier League, La Liga, World Cup - prove your football knowledge!
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="card text-white bg-primary h-100">
                <div className="card-body text-center">
                  <h3 className="card-title">General Knowledge</h3>
                  <FaBrain className="fa-4x my-3" />
                  <p className="card-text">
                    History, science, geography and more - test your general knowledge!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container my-5 text-center">
        <h2>Ready to test your knowledge?</h2>
        <p className="lead">
          Create an account to take quizzes, track your progress, and create your own challenging quizzes!
        </p>
        <div className="mt-4">
          <Link to="/register" className="btn btn-primary btn-lg me-3">
            Sign Up Now
          </Link>
          <Link to="/quizzes/create" className="btn btn-success btn-lg">
            Create a Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 