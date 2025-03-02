import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import { ChatProps, ChatStatus } from './InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import ContentBubble from './ContentBubble';
import ContentDrawer from './ContentDrawer';
import ContentChat from './ContentChat';
import ContentSettings from './ContentSettings';
import { useChatContext } from './ChatContext';

// interface ChatRoosm {
//   id: number;
//   name: string;
//   avatar: string;
// }

export const Chat: React.FC = () => {
	const {chatProps, setChatProps} = useChatContext();

  // parameters - will be added later
 
  function VerifyUser(): boolean {
  return (true);
  }

	function GetChatRooms(): ChatRoom[] {}

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
	return <div>{renderChatContent()}</div>;
};

export default Chat;
