import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css'; // Import the CSS file

export const Button: React.FC = () => {
  return (
    <div>
      <Link to="/login">
        <button className="login-button">Login</button>
      </Link>
    </div>
  );
};

export default Button;