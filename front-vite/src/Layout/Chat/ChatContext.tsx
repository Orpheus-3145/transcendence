import React, { createContext, useContext, useState, useEffect } from 'react'
import { ChatProps, ChatStatus } from './InterfaceChat';
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
		// console.log(user.nameIntra);

        const fetchAllChannels = () => {
            socket.emit('getChannels');
			// console.log(user.nameIntra);

            socket.on('channelsList', (channels) => {
				setChatProps((prevState) => ({
					...prevState,
                    chatRooms: channels.map((channel) => ({
						id: channel.channel_id,
                        name: channel.title,
                        icon: <GroupIcon />,
						messages: (channel.messages || [])
						.slice()
          				.reverse()
          				.map((message) => ({
          				  	id: message.msg_id,
          				  	message: message.content,
          				  	user: user.nameIntra,
          				  	userPP: <Avatar />,
          				  	timestamp: message.send_time,
          				})),
                        settings: {
							type: channel.ch_type,
                            password: channel.password,
                            users: channel.members.map(member =>({
								id: member.user_id,
								name: member.name,
								role: member.member_role,
								// email: '',
								icon: <Avatar />
								
							})) ,
                            owner: channel.ch_owner,
							banned: channel.banned,

                        },
						isDirectMessage: channel.isDirectMessage,
                    })),
                }));
				
				console.log('Channels from database:', channels);
				// console.log('Channels (frontend):', chatProps.chatRooms);
            });
			
			
            return () => {
				socket.off('channelsList');
            };
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
