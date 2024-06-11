import React from 'react';
import { Link } from 'react-router-dom';
import './index.css';

export const ErrorPage: React.FC = () => {
  return (
    <div className="error-page">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <Link to="/" className="home-link">Go back to Home</Link>
    </div>
  );
};

export default ErrorPage;
