import React from 'react';
import './Box.css';

interface BoxProps {
  chatWith: string;
  onClose: () => void;
}

export const Box: React.FC<BoxProps> = ({ chatWith, onClose }) => {
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={boxRef} className="chat-box">
      <div className="chat-box-header">
        <span>Chat with {chatWith}</span>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="chat-box-content">
        {/* Chat content will go here */}
      </div>
    </div>
  );
};

export default Box;
