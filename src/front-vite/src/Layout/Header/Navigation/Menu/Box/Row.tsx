import React from 'react';
import { Link } from 'react-router-dom';

interface RowProps {
  text: string;
  path: string;
  onClick: () => void;
}

const Row: React.FC<RowProps> = ({ text, path, onClick }) => {
  return (
    <Link to={path} className="menu-row-link" onClick={onClick}>
      <div className="menu-row">
        {text}
      </div>
    </Link>
  );
};

export default Row;
