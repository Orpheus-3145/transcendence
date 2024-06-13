import React from 'react';

interface BubbleProps {
  onClick: () => void;
}

export const Bubble: React.FC<BubbleProps> = ({ onClick }) => {
  return (
    <div className="chat-bubble" onClick={onClick}>
      <span>Chat</span>
    </div>
  );
};

export default Bubble;
