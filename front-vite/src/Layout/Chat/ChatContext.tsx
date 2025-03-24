import React, { createContext, useContext, useState, useEffect, useTheme, useNavigate, useLocation } from 'react'
import { ChatProps, ChatRoom, ChatStatus, UserProps, UserRoles } from './InterfaceChat';
import { children } from 'cheerio/dist/commonjs/api/traversing';
import { Group as GroupIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { PersonAdd as PersonAddIcon} from '@mui/icons-material';
import { io } from 'socket.io-client';
import Avatar from '@mui/material/Avatar'
import { useUser } from '../../Providers/UserContext/User';
import { Socket } from 'socket.io';
import { userInChannel } from '../../Pages/Channels';
import { joinedRooms } from '../../Pages/Channels';
import { PowerUpSelected } from '../../Types/Game/Enum';
import { User } from '../../Types/User/Interfaces';
import { ChatMessage } from './InterfaceChat';

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
	console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
	console.error('Connection failed:', error);
});

interface ChatContextType {
	chatProps: ChatProps;
	setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
	channelName: string;
    setChannelName: React.Dispatch<React.SetStateAction<string>>;
    isAddingChannel: boolean;
    setIsAddingChannel: React.Dispatch<React.SetStateAction<boolean>>;
    isSettingsView: boolean;
    setIsSettingsView: React.Dispatch<React.SetStateAction<boolean>>;
    isPasswordModal: boolean;
    setIsPasswordModal: React.Dispatch<React.SetStateAction<boolean>>;
    enteredChannelPass: string;
    setEnteredChannelPass: React.Dispatch<React.SetStateAction<string>>;
    users: UserProps[];
    setUsers: React.Dispatch<React.SetStateAction<UserProps[]>>;
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    availableChannels: ChatRoom[];
    setAvailableChannels: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
    directMessages: ChatRoom[];
    setDirectMessages: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
    joinedChannels: ChatRoom[];
    setJoinedChannels: React.Dispatch<React.SetStateAction<ChatRoom[]>>;
    selectedChannel: ChatRoom | null;
    setSelectedChannel: React.Dispatch<React.SetStateAction<ChatRoom | null>>;
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    userMessage: Map<string, User>;
    setUserMessage: React.Dispatch<React.SetStateAction<Map<string, User>>>;
    waiting: boolean;
    setWaiting: React.Dispatch<React.SetStateAction<boolean>>;
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
	const [channelName, setChannelName] = useState('');
	const [isAddingChannel, setIsAddingChannel] = useState(false);
	// const [isSettingsView, setIsSettingsView] = useState(false);
	const [isPasswordModal, setIsPasswordModal] = useState(false);
	const [enteredChannelPass, setEnteredChannelPass] = useState('');
	// const [users, setUsers] = useState<UserProps>([]);
	const [newMessage, setNewMessage] = useState('');
	// const [availableChannels, setAvailableChannels] = useState<ChatRoom[]>([]);
	// const [directMessages, setDirectMessages] = useState<ChatRoom[]>([]);
	// const [joinedChannels, setJoinedChannels] = useState<ChatRoom[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<ChatRoom | null>(null);
	// const [modalOpen, setModalOpen] = useState<Boolean>(false);
	// const [userMessage, setUserMessage] = useState<Map<string, User>>(new Map());
	// const [waiting, setWaiting] = useState<Boolean>(false);


	// console.log(user.nameIntra);
    const [chatProps, setChatProps] = useState<ChatProps>({
        chatRooms: [],
        chatStatus: ChatStatus.ChannelsPage,
        selected: null,
        searchPrompt: null,
    });

	const joinRooms = () => {
		chatProps.chatRooms.forEach((room) => {
			if (!joinedRooms.includes(room.id) && userInChannel(user.id, room)) {
			  socket.emit('joinRoom', room.id);
			  joinedRooms.push(room.id);
			  console.log(`Client socket joined room: ${room.id}`);
			}
		})
	};

    useEffect(() => {
			if (!user || !user.nameNick) {
				return ;
			}
			const fetchAllChannels = () => {
				socket.emit('getChannels');
				socket.on('channelsList', (channels: ChatRoom[]) => {
					setChatProps((prevState) => {
						// console.log("Inside useEffect:", JSON.stringify(channels));
						return {
							...prevState,
						chatRooms: channels.map(channel => ({
							...channel,
							messages: [ ...(channel.messages || []) ].reverse(),
						})),
					}
					})
				});

			return (() => socket.off('channelsList'));
			};
		
			fetchAllChannels();
    }, [user]);

	//-------------------------EVENT LISTENERS-------------------------//

	useEffect(() => {
		const handleChannelCreated = (newChannel: ChatRoom) => {
			// Update the state with the new channel data received from the server
			setChatProps((prevState) => ({
				...prevState,
				chatRooms: [...prevState.chatRooms, newChannel],
			}));
			setChannelName('');
			setIsAddingChannel(false);
		};
		socket.on('channelCreated', handleChannelCreated);
		return () => {
			socket.off('channelCreated', handleChannelCreated);
		};
	}, []);


useEffect(() => {
		const handleUserKickedChannel = (data) => {
			setChatProps((prevState: ChatProps) => 
			{
				let channel = prevState.chatRooms.find((item: ChatRoom) => item.id === data.id);
				if (!channel)
					return (prevState);
	
				const updatedUsers = channel.settings.users.filter((item: UserProps) => item.id !== data.userId);
				if (user.id === data.userId && selectedChannel != null && selectedChannel.id === channel.id)
				{
					setSelectedChannel(null);
				}
				return {
					...prevState,
					chatRooms: prevState.chatRooms.map((room) =>
						room.id === channel.id ? { ...room, settings: { ...room.settings, users: updatedUsers } } : room
					),
				};
			});
			
		};
	
		socket.on("userKicked", handleUserKickedChannel);
		return () => {
			socket.off("userKicked", handleUserKickedChannel);
		};
	}, [chatProps, user]);
	

	useEffect(() => 
	{
		const handleUserBannedChannel = (data) => 
		{
			setChatProps((prevState: ChatProps) => {
				let channel = prevState.chatRooms.find((item: ChatRoom) => item.id === data.id);
				if (!channel)
					return (prevState);
				
				const updatedUsers: UserProps[] = channel.settings.users.filter((item: UserProps) => item.id !== data.userId);
				const updatedBanned: string[] = channel.settings.banned;
				updatedBanned.push(data.userId);
				if (user.id == data.userId && selectedChannel != null && selectedChannel.id === channel.id)
				{
					setSelectedChannel(null);
				}
				return {
					...prevState,
					chatRooms: prevState.chatRooms.map((room) =>
						room.id === channel.id ? { ...room, settings: { ...room.settings, users: updatedUsers, banned: updatedBanned }} : room
					),
				};
			});
		};
		
		const handleUserUnbannedChannel = (data) => 
		{
			setChatProps((prevState: ChatProps) => {
				let channel = prevState.chatRooms.find((item: ChatRoom) => item.id === data.id);
				if (!channel)
					return (prevState);
				
				const updatedBanned = channel.settings.banned.filter((item: string) => item !== data.userId);

				return {
					...prevState,
					chatRooms: prevState.chatRooms.map((room) =>
						room.id === channel.id ? { ...room, settings: { ...room.settings, banned: updatedBanned }} : room
					),
				};
			});
		}

		socket.on('userBanned', handleUserBannedChannel);
		socket.on('userUnbanned', handleUserUnbannedChannel);
		return () => {
			socket.off('userBanned', handleUserBannedChannel);
			socket.off('userUnbanned', handleUserUnbannedChannel);
		}
	}, [chatProps, user]);


	useEffect(() => 
	{
		const handleUserMutedChannel = (data) => 
		{
			setChatProps((prevState: ChatProps) => {
				let channel = prevState.chatRooms.find((item: ChatRoom) => item.id === data.id);
				if (!channel)
					return (prevState);
				
				const updatedMuted: string[] = channel.settings.muted;
				updatedMuted.push(data.userId);
				return {
					...prevState,
					chatRooms: prevState.chatRooms.map((room) =>
						room.id === channel.id ? { ...room, settings: { ...room.settings, muted: updatedMuted }} : room
					),
				};
			});
		}

		const handleUserUnmutedChannel = (data) => 
		{
			setChatProps((prevState: ChatProps) => {
				let channel = prevState.chatRooms.find((item: ChatRoom) => item.id === data.id);
				if (!channel)
					return (prevState);
				
				const updatedMuted: string[] = channel.settings.muted.filter((item: string) => item !== data.userId);
				return {
					...prevState,
					chatRooms: prevState.chatRooms.map((room) =>
						room.id === channel.id ? { ...room, settings: { ...room.settings, muted: updatedMuted }} : room
					),
				};
			});
		}

		socket.on('userMuted', handleUserMutedChannel);
		socket.on('userUnmuted', handleUserUnmutedChannel);
		return () => {
			socket.off('userMuted', handleUserMutedChannel);
			socket.off('userUnmuted', handleUserUnmutedChannel);
		}
	}, [chatProps]);

//////////////////////////////////////////////////////////////////////

	useEffect(() => {
			const handleChannelDeleted = (response) => {
				console.log('Channel deleted', response.channel_id);
				setChatProps((prevState) => ({
					...prevState,
					chatRooms: prevState.chatRooms.filter(chat => chat.id !== response.channel_id),
				}));
				setSelectedChannel(null);
			};
		
			socket.on('channelDeleted', handleChannelDeleted);
			
			return () => {
				socket.off('channelDeleted', handleChannelDeleted);
			};
		}, []);

//////////////////////////////////////////////////////////////////////



	useEffect(() => {
		const handleRoleChanged = (response) => {
			console.log('User role changed (index) to ', response.new_role);

			const selectedChannel = chatProps.chatRooms.find(channel => channel.id === response.channelId);

			const updatedUsers = selectedChannel?.settings.users.map(user => user.id === response.userId ? { ...user, role: response.new_role } : user);
			setChatProps((prevState) => ({
				...prevState,
				chatRooms: prevState.chatRooms.map(channel => 
					channel.id === response.channelId 
					? 	{
							...channel,
							settings: {
								...channel.settings,
								users: updatedUsers,
							},
						}
					: channel)
			}))
		};

		socket.on('userRoleChanged', handleRoleChanged);
		
		return () => {
			socket.off('userRoleChanged', handleRoleChanged);
		};
	}, [chatProps]);


//////////////////////////////////////////////////////////////////////

	useEffect(() => {
	const handleUserLeftChannel = (response: {channelDto: ChatRoom, userId: number}) => {
		if (userInChannel(user.id, response.channelDto)) {
			console.log(`User left channel (index): ${JSON.stringify(response)}`);
			if (!response.channelDto) { 
				return;
			}
			setChatProps((prevState) => ({
				...prevState,
				chatRooms: prevState.chatRooms.map((channel) => {
					if (channel.id !== response.channelDto.id) {
						return channel;
					}
					const updatedUsers = channel.settings.users.filter((usr) => usr.id !== response.userId);
					const newOwner = response.channelDto.settings.owner;
					// console.log('New owner (index) :', newOwner);
					return {
						...channel,
						settings: {
							...channel.settings,
							owner: newOwner || channel.settings.owner,
							users: updatedUsers.map(usr => ({
								...usr,
								role: usr.name === newOwner ? 'owner' : usr.role,
							})),
						},
					};
				}),
			}));
		}
		// console.log('channel after user left (index)', selectedChannel);
	};

	socket.on('leftChannel', handleUserLeftChannel);

	return () => {
		socket.off('leftChannel', handleUserLeftChannel);
	};
}, [chatProps]);

  
//////////////////////////////////////////////////////////////////////

	useEffect(() => {
			const handleUserJoinedChannel = (response) => {
				// console.log(response.channelDto);
				if (userInChannel(user.id, response.channelDto)) {
					console.log('User added to channel (index) ');
					const newUser: UserProps = {
						id: response.user_id,
						name: response.name,
						role: UserRoles.member,
						email: response.email,
						password: '',
						// icon: <Avatar src={tmp.image}/> 
						icon: <PersonAddIcon /> //!!
					};

					setChatProps((prevState) => ({
						...prevState,
						chatRooms: prevState.chatRooms.map((room) =>
							room.id === response.channel_id
							?	{
									...room,
									settings: {
										...room.settings,
										users: [...room.settings.users, newUser],
									},
								}
							: room 
						)
					}));
				}	
			}

			socket.on('joinedChannel', handleUserJoinedChannel);

			return () => {
				socket.off('joinedChannel', handleUserJoinedChannel);
			}

	}, [user]);

//////////////////////////////////////////////////////////////////////
	
	useEffect(() => {
		const handlePrivacyChanged = (updatedChannel) => {
			// console.log('Channel privacy updated:', updatedChannel);
			console.log('Channel privacy updated to (index):', updatedChannel.settings.type);
			// console.log('Channel from backend (index):', updatedChannel);
			
			setChatProps((prevState) => ({
				...prevState,
				chatRooms: prevState.chatRooms.map((room) =>
					room.id === updatedChannel.id
					?	{
							...room,
							settings: {
								...room.settings,
								type: updatedChannel.settings.type,
								password: updatedChannel.settings.password,
							},
						}
					: room 
				)
			}));
		};

		socket.on('privacyChanged', handlePrivacyChanged);

		return () => {
			socket.off('privacyChanged', handlePrivacyChanged);
		};
	}, []);



	useEffect(() => {
			const handleUserJoinedAvailableChannel = (response) => {
				console.log('User joined available channel (index)');
				const newUser: UserProps = {
					id: response.user_id,
					name: response.name,
					role: UserRoles.member,
					email: '',
					password: '',
					icon: <PersonAddIcon />
				};
	
				setChatProps((prevState) => ({
					...prevState,
					chatRooms: prevState.chatRooms.map((room) =>
						room.id === response.channel_id
						?	{
								...room,
								settings: {
									...room.settings,
									users: [...room.settings.users, newUser],
								},
							}
						: room 
					)
				}));
			}
	
			socket.on('joinedAvailableChannel', handleUserJoinedAvailableChannel);
	
			return () => {
				socket.off('joinedAvailableChannel', handleUserJoinedAvailableChannel);
			}
	
		}, [chatProps]);



		useEffect(() => {
				socket.on('newMessage', (message: ChatMessage) => {
				  console.log('Received new message (React):', message);
					//   console.log('Receiver id:', message.channel.channel_id);
					console.log('Before update:', chatProps.chatRooms);
		
					const newMessage: ChatMessage = {
						id: message.id,
						userId: message.userId, 
						message: message.message,
						user: message.user,
						userPP: <Avatar />,
						timestamp: message.timestamp,
						receiver_id: message.receiver_id,
					}
		
					setChatProps((prevProps) => ({
					  ...prevProps,
					  chatRooms: prevProps.chatRooms.map((room) => {
						// console.log('Checking room.id:', room.id);
					  if (room.id === message.receiver_id) {			// NB shall ChatMessage be modified to receive the receiver_id as well
						  return {
								...room,
								messages: [
								  ...room.messages,
								  newMessage,
								],
							};
						}
						return room;
					}),
				  }));
		
				  if (selectedChannel && ( selectedChannel.id === message.receiver_id)) {
					setSelectedChannel((prevState) => ({
						...prevState,
						messages: [...prevState.messages, newMessage]
					}));
				  }
		
				});
				return () => {
				  socket.off('newMessage');
				};
			}, [selectedChannel]);

	////////////////////////////////////////////////////////////////////////

	useEffect(() => {
		if (!user || !user.nameNick) {
			return;
		}
		joinRooms();
	}, [chatProps.chatRooms]);
	
	useEffect(() => {
	}, [chatProps.chatRooms]);
	
    return (
        <ChatContext.Provider value={{ 
			chatProps, setChatProps,
			channelName, setChannelName,
			isAddingChannel, setIsAddingChannel,
			selectedChannel, setSelectedChannel,
		}}>
            {children}
        </ChatContext.Provider>
    );
};
