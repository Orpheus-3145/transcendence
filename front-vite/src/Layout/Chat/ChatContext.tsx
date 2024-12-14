import React, { createContext, useContext, useState } from 'react'
import { ChatProps, ChatStatus } from './InterfaceChat';
import { children } from 'cheerio/dist/commonjs/api/traversing';
import { Group as GroupIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { PersonAdd as PersonAddIcon} from '@mui/icons-material';


interface ChatContextType {
	chatProps: ChatProps;
	setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
	// newMessage: string;
	// setNewMessage: React.Dispatch<React.SetStateAction<string>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = (): ChatContextType => {
	const context = useContext(ChatContext);
	if (!context) {
		throw new Error('useChatContext must be used within a ChatProvider!');
	}
	return context;
};

export const ChatProvider: React.FC = ({ children }) => {
	const [newMessage, setNewMessage] = useState('');
	const [chatProps, setChatProps] = useState<ChatProps>({
		chatRooms: [
		  {
			name: 'test channel',
			icon: <GroupIcon />,
			messages: [
			  {
				message: <Typography>Whazuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuup!</Typography>,
				user: <Typography>User1</Typography>,
				userPP: <Typography>img</Typography>,
				timestamp: <Typography>20:00</Typography>,
			  },
			  {
				message: <Typography>Whazuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuup!</Typography>,
				user: <Typography>User2</Typography>,
				userPP: <Typography>img</Typography>,
				timestamp: <Typography>20:03</Typography>,
			  },
			],
			settings: {
			  icon: <PersonAddIcon />,
			  type: 'public',
			  password: null,
			  users: [
				  {
					  name: 'Groot',
					  role: 'Guest',
					  email: 'iamgroot@avengers.com',
					  password: '',
					  icon: React.ReactElement ,
  
				  },
				  {
					  name: 'Cap',
					  role: 'Guest',
					  email: 'cap@avengers.com',
					  password: '',
					  icon: React.ReactElement ,
  
				  },
				  {
					  name: 'Hulk',
					  role: 'Guest',
					  email: 'hulk@avengers.com',
					  password: '',
					  icon: React.ReactElement ,
  
				  },
			  ],
			  owner: 'MYSELF',
			},
		  },
		],
		chatStatus: ChatStatus.ChannelsPage,
		selected: null,
		searchPrompt: null,
	  });

	return (
		// <ChatContext.Provider value={{ chatProps, setChatProps, newMessage, setNewMessage }} >
		<ChatContext.Provider value={{ chatProps, setChatProps, }} >
			{children}
		</ChatContext.Provider>
	)
}


