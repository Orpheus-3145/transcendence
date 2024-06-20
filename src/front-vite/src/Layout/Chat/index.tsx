import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import { ChatProps, ChatStatus } from './InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import ContentBubble from './ContentBubble';
import ContentDrawer from './ContentDrawer';
import ContentChat from './ContentChat';
import ContentSettings from './ContentSettings';

export const Chat: React.FC = () => {
  const [chatProps, setChatProps] = useState<ChatProps>({
    chatRooms: [
      {
        name: <Typography>ChatName1</Typography>,
        icon: <ChatIcon />,
        messages: [
          {
            message: <Typography>Hello</Typography>,
            user: <Typography>User1</Typography>,
            userPP: <Typography>User1PP</Typography>,
            timestamp: <Typography>10:00</Typography>,
          },
          {
            message: <Typography>Hi</Typography>,
            user: <Typography>User2</Typography>,
            userPP: <Typography>User2PP</Typography>,
            timestamp: <Typography>10:01</Typography>,
          },
        ],
        settings: {
          icon: <ChatIcon />,
          type: 'public',
          password: null,
          users: ['User1', 'User2'],
          owner: 'OwnerName',
        },
      },
      {
        name: <Typography>ChatName2</Typography>,
        icon: <ChatIcon />,
        messages: [
          {
            message: <Typography>Hey</Typography>,
            user: <Typography>User3</Typography>,
            userPP: <Typography>User3PP</Typography>,
            timestamp: <Typography>11:00</Typography>,
          },
          {
            message: <Typography>Hi there</Typography>,
            user: <Typography>User4</Typography>,
            userPP: <Typography>User4PP</Typography>,
            timestamp: <Typography>11:01</Typography>,
          },
        ],
        settings: {
          icon: <ChatIcon />,
          type: 'private',
          password: null,
          users: ['User3', 'User4'],
          owner: 'AnotherOwnerName',
        },
      },
    ],
    chatStatus: ChatStatus.Bubble,
    selected: null,
    searchPrompt: null,
  });

  const renderChatContent = () => {
    switch (chatProps.chatStatus) {
      case ChatStatus.Bubble:
        return <ContentBubble chatProps={chatProps} setChatProps={setChatProps} />;
      case ChatStatus.Drawer:
        return <ContentDrawer chatProps={chatProps} setChatProps={setChatProps} />;
      case ChatStatus.Chatbox:
        return <ContentChat chatProps={chatProps} setChatProps={setChatProps} />;
      case ChatStatus.Settings:
        return <ContentSettings chatProps={chatProps} setChatProps={setChatProps} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderChatContent()}
    </div>
  );
};

export default Chat;