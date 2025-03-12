import React, { createContext, useContext, useState, useEffect } from 'react'
import { ChatProps, ChatRoom, ChatStatus } from './InterfaceChat';
import { children } from 'cheerio/dist/commonjs/api/traversing';
import { Group as GroupIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { PersonAdd as PersonAddIcon} from '@mui/icons-material';
import { io } from 'socket.io-client';
import Avatar from '@mui/material/Avatar'
import { useUser } from '../../Providers/UserContext/User';
import { Socket } from 'socket.io';

// export const socket = io('https://localhost:3000/chat', {
// 	withCredentials: true,
// });

export interface ConnectedUser {
	clientSocket: Socket,
	intraId: number,
	nameIntra: string,
}

const connectedUsers: ConnectedUser[] = []; 

export const socket = io(`${import.meta.env.URL_WEBSOCKET}${import.meta.env.WS_NS_CHAT}`, {
    withCredentials: true,
    transports: ['websocket'],
});

socket.on('connect', () => {
	// const newConnectedUser = {
	// 	clientSocket: socket,
	// 	intraId: ,
	// 	nameIntra: string,
	// };
	console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
	console.error('Connection failed:', error);
});

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
	const { user } = useUser();
	// console.log(user.nameIntra);
    const [chatProps, setChatProps] = useState<ChatProps>({
        chatRooms: [],
        chatStatus: ChatStatus.ChannelsPage,
        selected: null,
        searchPrompt: null,
    });

    useEffect(() => {
			if (!user || !user.nameIntra) {
				return ;
			}
			const fetchAllChannels = () => {
				socket.emit('getChannels');
				socket.on('channelsList', (channels: ChatRoom[]) => {
					setChatProps((prevState) => ({
						...prevState,
						chatRooms: channels,
					}))
				});

			return (() => socket.off('channelsList'));
			};
		
			fetchAllChannels();
    }, [user]);

	// useEffect(() => {
	// 	if (!user) {
	// 		return;
	// 	}
	// 	fetchAllChannels

	// }, [user]);
	
	useEffect(() => {
		console.log('Channels (frontend):', chatProps.chatRooms);
	}, [chatProps.chatRooms]);
	
    return (
        <ChatContext.Provider value={{ chatProps, setChatProps }}>
            {children}
        </ChatContext.Provider>
    );
};
