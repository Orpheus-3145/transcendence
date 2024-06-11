import React from 'react';
import DeveloperCard from './DeveloperCard';
import './Bar.css';

const developers = [
  { photo: '/path/to/photo1.jpg', name: 'Developer 1', role: 'Frontend' },
  { photo: '/path/to/photo2.jpg', name: 'Developer 2', role: 'Backend' },
  { photo: '/path/to/photo3.jpg', name: 'Developer 3', role: 'Game Design' },
  // Add more developers as needed
];

export const Bar: React.FC = () => {
  return (
    <footer className="footer">
      <div className="developer-cards">
        {developers.map((dev, index) => (
          <DeveloperCard key={index} photo={dev.photo} name={dev.name} role={dev.role} />
        ))}
      </div>
      <div className="footer-logo">
        <img src="/path/to/logo.png" alt="Logo" className="logo-image" />
      </div>
    </footer>
  );
};

export default Bar;
