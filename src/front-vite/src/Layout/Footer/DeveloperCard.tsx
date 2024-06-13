import React from 'react';
import './DeveloperCard.css';

interface DeveloperCardProps {
  photo: string;
  name: string;
  role: string;
}

const DeveloperCard: React.FC<DeveloperCardProps> = ({ photo, name, role }) => {
  return (
    <div className="developer-card">
      <img src={photo} alt={`${name}'s photo`} className="developer-photo" />
      <div className="developer-info">
        <h3 className="developer-name">{name}</h3>
        <p className="developer-role">{role}</p>
      </div>
    </div>
  );
};

export default DeveloperCard;
