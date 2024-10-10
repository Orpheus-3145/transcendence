import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import { ChatProps, ChatStatus } from './InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import ContentBubble from './ContentBubble';
import ContentDrawer from './ContentDrawer';
import ContentChat from './ContentChat';
import ContentSettings from './ContentSettings';

interface ChatRoom {
  id: number;
  name: string;
  avatar: string;
}

export const Chat: React.FC = () => {
  const [chatProps, setChatProps] = useState<ChatProps>({
    chatRooms: [
      {
        name: 'ChatName1',
        icon: <ChatIcon />,
        messages: [
          {
            message: <Typography>asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd</Typography>,
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
          users: [
            {
              name: 'User1',
              role: 'Guest',
              email: 'user1@example.com',
              password: 'password1',
              icon: <Typography>User1Icon</Typography>,
            },
            {
              name: 'User2',
              role: 'Owner',
              email: 'user2@example.com',
              password: 'password2',
              icon: <Typography>User2Icon</Typography>,
            },
            {
              name: 'User367890',
              role: 'Administrator',
              email: 'user3@example.com',
              password: 'password3',
              icon: <Typography>User3Icon</Typography>,
            },
            {
              name: 'User4',
              role: 'Guest',
              email: 'user4@example.com',
              password: 'password4',
              icon: <Typography>User4Icon</Typography>,
            },
            {
              name: 'User4',
              role: 'Guest',
              email: 'user4@example.com',
              password: 'password4',
              icon: <Typography>User4Icon</Typography>,
            },
            {
              name: 'User4',
              role: 'Guest',
              email: 'user4@example.com',
              password: 'password4',
              icon: <Typography>User4Icon</Typography>,
            },
            {
              name: 'User4',
              role: 'Guest',
              email: 'user4@example.com',
              password: 'password4',
              icon: <Typography>User4Icon</Typography>,
            },
          ],
          owner: 'OwnerName',
        },
      },
      {
        name: 'ChatName2',
        icon: <ChatIcon />,
        messages: [
        ],
        settings: {
          icon: <ChatIcon />,
          type: 'private',
          password: 'chat2password',
          users: [
          ],
          owner: 'OwnerName2',
        },
      },
      {
        name: 'ChatName3',
        icon: <ChatIcon />,
        messages: [
        ],
        settings: {
          icon: <ChatIcon />,
          type: 'password',
          password: 'chat3password',
          users: [
          ],
          owner: 'OwnerName3',
        },
      },
      {
        name: 'ChatName4',
        icon: <ChatIcon />,
        messages: [
        ],
        settings: {
          icon: <ChatIcon />,
          type: 'public',
          password: null,
          users: [
          ],
          owner: 'OwnerName4',
        },
      },
    ],
    chatStatus: ChatStatus.Bubble,
    selected: null,
    searchPrompt: null,
  });

  // parameters - will be added later
  function VerifyUser(): boolean {
    return (true);
  }

  function GetChatRooms(): ChatRoom[] {

  }

  const renderChatContent = () => {
    switch (chatProps.chatStatus) {
      case ChatStatus.Drawer:
        return <ContentDrawer chatProps={chatProps} setChatProps={setChatProps} />;
      case ChatStatus.Chatbox:
        return <ContentChat chatProps={chatProps} setChatProps={setChatProps} />;
      case ChatStatus.Settings:
        return <ContentSettings chatProps={chatProps} setChatProps={setChatProps} />;
      default:
        return <ContentBubble chatProps={chatProps} setChatProps={setChatProps} />;
    }
  };
  // return (
  //   {chatStatus === ChatStatus.Bubble && (<ChatBubble chatProps={chatProps} setChatProps={setChatProps} />)}
  //   {chatStatus === ChatStatus.Drawer && (<ChatDrawer chatProps={chatProps} setChatProps={setChatProps} />)}
  //   {chatStatus === ChatStatus.Chatbox && (<ChatBox chatProps={chatProps} setChatProps={setChatProps} />)}
  // );
  return (
    <div >
      {renderChatContent()}
    </div>
  );
};

export default Chat;