import React from 'react';
import { ChatProps, ChatStatus, ChatRoom } from './InterfaceChat';
import { Box, Fab } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

interface ContentBubbleProps {
  chatProps: ChatProps;
  setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

export const ContentBubble: React.FC<ContentBubbleProps> = ({ chatProps, setChatProps }) => {
  const toggleChatStatus = (status: ChatStatus, selection: ChatRoom | null) => {
    setChatProps({ ...chatProps, chatStatus: status, selected: selection});
  };
  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
      <Fab
        color="secondary"
        aria-label="chat"
        onClick={() => { toggleChatStatus(ChatStatus.Drawer, null) }}>
        <ChatIcon />
      </Fab>
    </Box>
  );
};

export default ContentBubble;