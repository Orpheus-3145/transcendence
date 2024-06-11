import React from 'react';
import Bubble from './Bubble/Bubble';
import Menu from './Menu/Menu';
import Box from './Box/Box';
import './index.css';

export const Chat: React.FC<{ chatState: { on: boolean; select: string | null }; setChatState: React.Dispatch<React.SetStateAction<{ on: boolean; select: string | null }>> }> = ({ chatState, setChatState }) => {
  const handleBubbleClick = () => {
    setChatState({ on: true, select: null });
  };

  const handleMenuItemSelect = (item: string) => {
    setChatState({ on: false, select: item });
  };

  const handleClickOutside = () => {
    setChatState({ on: false, select: null });
  };

  if (chatState.select) {
    return <Box chatWith={chatState.select} onClose={handleClickOutside} />;
  }

  if (chatState.on) {
    return <Menu items={['User 1', 'User 2', 'User 3']} onItemSelect={handleMenuItemSelect} onClickOutside={handleClickOutside} />;
  }

  return <Bubble onClick={handleBubbleClick} />;
};

export default Chat;
