import React, { ReactNode, useEffect } from 'react';
import axios from 'axios';
import { ChatStatus, ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SettingsModal } from './ChannelSettings';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon, Close as CloseIcon,  AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, Box, InputBase, Divider, Typography, Button, IconButton, Container, useTheme, Stack, Modal, TextField, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MessageIcon from '@mui/icons-material/Message';
import { styled } from '@mui/system';
import { Add as AddIcon, Group as GroupIcon, Cancel as CancelIcon, Logout as LogoutIcon, Login as LoginIcon, VideogameAsset as GameIcon} from '@mui/icons-material';
import { timeStamp } from 'console';
import { index } from 'cheerio/dist/commonjs/api/traversing';
import { useChatContext, socket } from '../../Layout/Chat/ChatContext';
import { fetchOpponent, fetchUser, getUserFromDatabase, useUser } from '../../Providers/UserContext/User';
import { User } from '../../Types/User/Interfaces';
import { getAll } from '../../Providers/UserContext/User';
import { getRandomValues } from 'crypto';
import { copyFileSync } from 'fs';
import { GameInviteModal } from '../Game/inviteModal';
import { PowerUpSelected } from '../../Types/Game/Enum';
import { inviteToGame } from '../../Providers/NotificationContext/Notification';
// import { Socket } from 'socket.io-client';


interface ChannelTypeEvent {
	component: React.ReactNode;
	newColor: string;
	clickEvent: () => void;
}

// export const myself: UserProps =  {
// 	id: 777,
// 	name: 'raanghel',
// 	role: 'Guest',
// 	email: 'raanghel@student.codam.nl',
// 	password: '',
// 	icon: React.ReactElement ,
// };

// console.log('USER', )

export const userIsAdmin = (userName: string, channel: ChatRoom): boolean => {
	// 
	const found = channel.settings.users.find((user) => user.name === userName);
	return found?.role === 'admin';
};

export const userInChannel = (userName: string, channel: ChatRoom): boolean => {
	const found = channel.settings.users.find((user) => user.name === userName);
	return found ? true : false;
};

export const userBanned = (userName: string, channel: ChatRoom): boolean =>
{
	const found = channel.settings.banned.find((user) => user === userName);
	return found ? true : false;
}

//////////////////////////////////////////////////////////////////////

let joinedRooms: number[] = [];

const ChannelsPage: React.FC = () => {
	const { user } = useUser();
	// console.log(user.id);
	
	let passwordOk = false;
	const theme = useTheme();
	const navigate = useNavigate();
	const [channelName, setChannelName] = useState('');
	const [isAddingChannel, setIsAddingChannel] = useState(false);
	const [isSettingsView, setIsSettingsView] = useState(false);
	const [isPasswordModal, setIsPasswordModal] = useState(false);
	const [enteredChannelPass, setEnteredChannelPass] = useState('');
	const [users, setUsers] = useState<UserProps>([]);
	const [newMessage, setNewMessage] = useState('');
	const {chatProps, setChatProps} = useChatContext();
	const [availableChannels, setAvailableChannels] = useState<ChatRoom[]>([]);
	const [directMessages, setDirectMessages] = useState<ChatRoom[]>([]);
	const [joinedChannels, setJoinedChannels] = useState<ChatRoom[]>([]);
	const [selectedChannel, setSelectedChannel] = useState<ChatRoom | null>(null);
	const [selectedAvailableChannel, setSelectedAvailableChannel] = useState<ChatRoom | null>(null);
	const [powerupValue, setPowerupValue] = useState<PowerUpSelected>(0);
	const [modalOpen, setModalOpen] = useState<Boolean>(false);

	useEffect(() => {
		// if (chatProps.chatRooms) {
		const joined = chatProps.chatRooms.filter((channel) =>
				!channel.isDirectMessage &&
				userInChannel(user.nameIntra, channel)
			);
		const available = chatProps.chatRooms.filter((channel) => 
				!channel.isDirectMessage &&	
				!userInChannel(user.nameIntra, channel) &&
				channel.settings.type !== 'private'
			);
		const dms = chatProps.chatRooms.filter((channel) =>
				channel.isDirectMessage
			);
		// console.log("Available (useEffect):", available);
		// console.log("Joined (useEffect):", joined);
		
		setJoinedChannels(joined);
		setAvailableChannels(available);
		setDirectMessages(dms);

		// }
	}, [chatProps.chatRooms])

	useEffect(() => {
		const fetchUsers = async () => {
			const usersList = await getAll();
			// console.log("Fetched users (channels page):", usersList);
			setUsers(usersList);
		}
		fetchUsers();
	}, []);


	const handleCreateDirectMessage = () => {
		if (channelName.trim()) {
			const channelDTO = {
				title: channelName,
				ch_type: 'private',
				ch_owner: user.nameIntra,
				users: [
					{ id: user.id, nameIntra: user.nameIntra, role: 'owner', email: user.email }
				],
				password: null,
				isDirectMessage: true,
			};
			socket.emit('createChannel', channelDTO);
		}
	};	
		
//////////////////////////////////////////////////////////////////////
	
	const handleCreateChannel = () => {
		if (channelName.trim()) {
			const channelDTO = {
				title: channelName,
				ch_type: 'public',
				ch_owner: user.nameIntra,
				users: [
					{ id: user.id, nameIntra: user.nameIntra, role: 'owner', email: user.email }
				],
				password: null,
				isDirectMessage: false,
			};
			socket.emit('createChannel', channelDTO);
		}
	};	
			
	useEffect(() => {
		const handleChannelCreated = (newChannel) => {
			// Update the state with the new channel data received from the server
			setChatProps((prevState) => ({
				...prevState,
				chatRooms: [
					...prevState.chatRooms,
					{
						id: newChannel.channel_id, // Use the ID returned by the server
						name: newChannel.title,
						icon: <GroupIcon />,
						messages: [],
						settings: {
							type: newChannel.ch_type,
							password: newChannel.password,
							users: newChannel.members.map((member) => ({
								id: member.user_id,
								name: member.name,
								role: member.member_role,
								icon: <Avatar />,
							})),
							owner: newChannel.ch_owner,
							banned: newChannel.banned,
							muted: newChannel.muted,
						},
						isDirectMessage: newChannel.isDirectMessage,
					},
				],
			}));
			setChannelName('');
			setIsAddingChannel(false);
		};
		socket.on('channelCreated', handleChannelCreated);
		return () => {
			socket.off('channelCreated', handleChannelCreated);
		};
	}, []);

	
//////////////////////////////////////////////////////////////////////

	const handleSendDirectMessageClick = (event: React.MouseEvent, otherUser: User ) => {
		event.stopPropagation();
		console.log("'Send Direct Message' clicked!");
		if (otherUser.id !== user.id) {
			const channelDTO = {
				title: otherUser.nameIntra,
				ch_type: 'private',
				ch_owner: user.nameIntra,
				users: [
					{ id: user.id, nameIntra: user.nameIntra, role: 'owner', email: user.email },
					{ id: otherUser.id, nameIntra: otherUser.nameIntra, role: 'member', email: otherUser.email },
	
				],
				password: null,
				isDirectMessage: true,
			};
			socket.emit('createChannel', channelDTO);
		}
	};

//////////////////////////////////////////////////////////////////////

	const handleCancelNewChannel = () => {
		setIsAddingChannel(false);
		setChannelName('');
	};

	const joinRooms = () => {
		chatProps.chatRooms.forEach((room) => {
			if (!joinedRooms.includes(room.id) && userInChannel(user.nameIntra, room)) {
			  socket.emit('joinRoom', room.id);
			  joinedRooms.push(room.id);
			  console.log(`Client socket joined room: ${room.id}`);
			} 
			// else {
			//   console.log(`Already in room: ${room.id}`);
			// }
		})
	};

	// useEffect(() => {

	// }, [])

	// User socket joins the channels 
	joinRooms();

	const joinRoom = (roomId) => {
		// Check if the client has already joined this room
		if (!joinedRooms.includes(roomId)) {
		  // Join the room and add it to the joinedRooms list
		  socket.emit('joinRoom', roomId);
		  joinedRooms.push(roomId);
		  console.log(`Joined room: ${roomId}`);
		} 
		// else {
		//   console.log(`Already in room: ${roomId}`);
		// }
	
	}

	const handleChannelClick = (channel: ChatRoom) => {
		setSelectedChannel(channel);
		setIsSettingsView(false);
		setIsAddingChannel(false);
		joinRoom(channel.id)
	};
//////////////////////////////////////////////////////////////////////
	const handleAvailableChannelPasswordSubmit = (event: React.MouseEvent) => {
		event.preventDefault();
		console.log(enteredChannelPass, selectedChannel.settings.password);
		if (enteredChannelPass !== selectedChannel.settings.password) {
			alert("Incorrect password!");
			setEnteredChannelPass('');
		} 
		else {
			passwordOk = true;
			setIsPasswordModal(false);
			handleAvailableChannelClick(event, selectedChannel);
		}
	};

	const handleAvailableChannelClick = (event: React.MouseEvent, channel: ChatRoom) => {
		event.stopPropagation();
		console.log('Available channel clicked!');
		if (!passwordOk && channel.settings.type === 'password' ) {
			setSelectedChannel(channel);
			setIsPasswordModal(true);
			// return ;
		} 
		else {
			setIsSettingsView(false);
			setIsAddingChannel(false);
			setSelectedChannel(channel);
			setIsPasswordModal(false);
			const data = {
				channel_id: channel.id,
				user_id: user.id,
				name: user.nameIntra,
			};
	
			socket.emit('joinChannel', data);
	
			socket.once('joinedChannel', (response) => {
				console.log('joinedChannel response from gateway:', response);
				if (response.channel_id === channel.id) {
	
					// setChatProps((prevState) => ({
					// 	...prevState,
					// 	chatRooms: [...prevState.chatRooms, channel],
					// }));
	
					// setChatProps((prevState) => {
					// 	const updatedChatRooms = [
					// 		...prevState.chatRooms.filter((ch) => ch.id !== channel.id), 
					// 		channel,
					// 	];
		
					// 	return { ...prevState, chatRooms: updatedChatRooms };
					// });
	
					// console.log('Available ch before: ', availableChannels);
					// console.log('chatProps.chatRooms before filter: ', chatProps.chatRooms);
	
					// const updatedChannel = { ...selectedChannel }; 
					const updatedChannel: ChatRoom = {
						...channel,
						settings: {
							...channel.settings,
							users: [
								...channel.settings.users,
								{
									id: user.id,
									name: user.nameIntra,
									role: 'member',
									icon: <Avatar />,
								},
							],
						},
					}; 
					
					setAvailableChannels((prevState) => prevState.filter((ch) => ch.id !== channel.id));
	
					setJoinedChannels((prevState) => [...prevState, updatedChannel]);
	
					// console.log('chatProps.chatRooms after filter: ', chatProps.chatRooms);
	
					// console.log('Available ch after: ', availableChannels);
	
					// setSelectedChannel(null);
				} 
	
			});
	
			socket.once('joinChannelError', (error) => {
				console.error(error.message);
				alert(`Error joining channel: ${error.message}`);
			});
		}
		

	};

	// useEffect(() => {
	// 	console.log('Available ch after: ', availableChannels);
	// }, [availableChannels]);
	

// 	const handleAvailableChannelClick = (event: React.MouseEvent, channel: ChatRoom) => {
// 	event.stopPropagation();
// 	console.log('Available channel clicked!');

// 	setSelectedAvailableChannel(channel);
// 	setIsSettingsView(false);
// 	setIsAddingChannel(false);

// 	if (channel.settings.type === 'password') {
// 		setIsPasswordModal(true);
// 		return;
// 	}

// 	const data = {
// 		channel_id: channel.id,
// 		user_id: user.id,
// 		name: user.nameIntra,
// 	};

// 	socket.emit('joinChannel', data);

// 	socket.once('joinedChannel', (response) => {
// 		console.log('joinedChannel response from gateway:', response);
// 		if (response.channel_id === channel.id) {

// 			// Move the channel from availableChannels to chatRooms properly
// 			setChatProps((prevState) => ({
// 				...prevState,
// 				chatRooms: [
// 					...prevState.chatRooms.filter((ch) => ch.id !== channel.id), // Remove from chatRooms if exists
// 					channel, // Add it properly
// 				],
// 			}));

// 			// Remove from availableChannels
// 			setAvailableChannels((prevState) =>
// 				prevState.filter((ch) => ch.id !== channel.id)
// 			);

// 			setSelectedChannel(channel); // Ensure user sees the new channel
// 		}
// 	});

// 	socket.once('joinChannelError', (error) => {
// 		console.error(error.message);
// 		alert(`Error joining channel: ${error.message}`);
// 	});
// };

	
//////////////////////////////////////////////////////////////////////


	const handleSettingsClick = (event: React.MouseEvent, channel: ChatRoom) => {
	  event.stopPropagation(); // Prevent triggering the channel click
	  setSelectedChannel(channel);
	  setIsAddingChannel(false);
	  setIsSettingsView(true);
	};
//////////////////////////////////////////////////////////////////////

	const handleSendGameInvite = (event: React.MouseEvent) => {
		//--> CALL TO BACKEND <-- //

		event.stopPropagation();
		console.log("'Send Game Invite' clicked!");
	};



//////////////////////////////////////////////////////////////////////

	const handleSetMessage = (event: React.KeyboardEvent) => {
		setNewMessage(event.target.value);
	};
//////////////////////////////////////////////////////////////////////
	
	const handleSendMessage = () => {
		// console.log(user.id);
		if (newMessage && selectedChannel) {
		  	const messageData = {
				sender_id: user.id,
				receiver_id: selectedChannel.id,
				content: newMessage,
			};
			socket.emit('sendMessage', messageData); 
		
			setNewMessage('');
		}
	};

	useEffect(() => {
		socket.on('newMessage', (message) => {
		  console.log('Received new message (React):', message);
			//   console.log('Receiver id:', message.channel.channel_id);
			console.log('Before update:', chatProps.chatRooms);
			
			const newMessage: ChatMessage = {
				id: message.msg_id,
				message: message.content,
				user: message.sender_id,
				userPP: <Avatar />,
				timestamp: message.send_time,
			}

			setChatProps((prevProps) => ({
			  ...prevProps,
			  chatRooms: prevProps.chatRooms.map((room) => {
				// console.log('Checking room.id:', room.id);
			  if (room.id === message.channel.channel_id) {
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

		  if (selectedChannel) {
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
	  

//////////////////////////////////////////////////////////////////////

	const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSendMessage();
		}
	};
//////////////////////////////////////////////////////////////////////

	// const handleJoinAvailableChannel = () => {
		
	// 	if (!selectedAvailableChannel) {
	// 		return;
	// 	}
	// 	setIsPasswordModal(false);

	// 	const data = {
	// 		channel_id: selectedAvailableChannel.id,
	// 		user_id: user.id,
	// 		name: user.nameIntra,
	// 	};

	// 	socket.emit('joinChannel', data);

	// 	socket.once('joinedChannel', (response) => {
	// 		console.log('Join Channel response:', response);
	// 		if (response.channel_id === selectedAvailableChannel.id) {
	// 			setChatProps((prevState) => ({
	// 				...prevState,
	// 				chatRooms: [...prevState.chatRooms, selectedAvailableChannel],
	// 			}));
	// 			setAvailableChannels((prevState) => 
	// 				prevState.filter((channel) => channel.id !== selectedAvailableChannel.id)
	// 			);

	// 			setSelectedChannel(null);
	// 		} 

	// 	});

	// 	socket.once('joinChannelError', (error) => {
	// 		console.error(error.message);
	// 		alert(`Error joining channel: ${error.message}`);
	// 	});
		
	// 	// const updatedChannel = { ...selectedAvailableChannel }; 
	// 	// const updatedChannel: ChatRoom = {
	// 	// 	...selectedAvailableChannel,
	// 	// 	settings: {
	// 	// 		...selectedAvailableChannel.settings,
	// 	// 		users: [
	// 	// 			...selectedAvailableChannel.settings.users,
	// 	// 			{
	// 	// 				id: user.id,
	// 	// 				name: user.nameIntra ,
	// 	// 				role: 'member',
	// 	// 				icon: <Avatar />,
	// 	// 			},
	// 	// 		],
	// 	// 	},
	// 	// }; 
		
		
		
	// };


	
	
//////////////////////////////////////////////////////////////////////


	const MessageInput: React.FC<{ channel: ChatRoom }> = ({ channel }) => {
		console.log('d');
	};

	// Channel line component to render each channel in the list
	const ChannelLine: React.FC<{ channel: ChatRoom}> = ({ channel }) => {
	  return (
		<Stack
		  direction={'row'}
		  gap={2}
		  paddingX={'0.5em'}
		  bgcolor={theme.palette.primary.main}
		  height={'2em'}
		  justifyContent={'space-between'}
		  alignItems={'center'}
		  textAlign={'center'}
		  onClick={() => {handleChannelClick(channel)}}
		//   height={'3em'}
		//   minWidth={'218px'}
		  sx={{
			borderRadius: '5px',
			cursor: 'pointer',
			transition: 'padding-left ease-in-out 0.3s, padding-right ease-in-out 0.3s, border-radius ease-in-out 0.3s, background-color ease-in-out 0.3s',
			'&:hover': {
			  bgcolor: theme.palette.primary.dark,
			  borderRadius: '2em',
			  paddingLeft: '1em',
			  paddingRight: '0.02em',
			},
		  }}
		>
		  <GroupIcon sx={{ width: '10%' }} />
		  <Typography noWrap sx={{ maxWidth: '78%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
			{channel?.name}
		  </Typography>
		  <IconButton
			onClick={(event: React.MouseEvent) => handleSettingsClick(event, channel)}
			sx={{  }}
		  >
			<SettingsIcon />
		  </IconButton>
		</Stack>
	  );
	};
//////////////////////////////////////////////////////////////////////

	const AvailableChannelLine : React.FC<{channel: ChatRoom}> = ({channel}) => {
		return (
			<Stack
			  direction={'row'}
			  gap={2}
			  paddingX={'0.5em'}
			  bgcolor={theme.palette.primary.main}
			  height={'2em'}
			  justifyContent={'space-between'}
			  alignItems={'center'}
			  textAlign={'center'}
			//   onClick={() => handleAvailableChannelClick(channel)}
			//   height={'3em'}
			//   minWidth={'218px'}
			  sx={{
				borderRadius: '5px',
				cursor: 'pointer',
				transition: 'padding-left ease-in-out 0.3s, padding-right ease-in-out 0.3s, border-radius ease-in-out 0.3s, background-color ease-in-out 0.3s',
				'&:hover': {
				  bgcolor: theme.palette.primary.dark,
				  borderRadius: '2em',
				  paddingLeft: '1em',
				  paddingRight: '0.02em',
				},
			  }}
			>
			  <GroupIcon sx={{ width: '10%' }} />
			  <Typography noWrap sx={{ maxWidth: '78%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
				{channel.name}
			  </Typography>
			  <IconButton
					onClick={(event: React.MouseEvent) => handleAvailableChannelClick(event, channel)}
					sx={{  }}
		  	>
				<AddRoundedIcon />
		 	 </IconButton>
			</Stack>
		  );
	};
//////////////////////////////////////////////////////////////////////

	const handleModalClose = () => {
		setModalOpen(false);
	};

	const handleModalOpen = () => {
		setModalOpen(true); 
	};

	const checkIfBlocked = (otherUser: User) =>
	{
		if (user.blocked.find((blockedId:string) => blockedId === otherUser.intraId.toString())) 
		{
			return (true);
		}
		return (false);
	}

	const InviteGame = (otherUser: User) => {
		
		handleModalClose();
		if (checkIfBlocked(otherUser) == true)
				return ;

		inviteToGame(user.id.toString(), otherUser.id.toString(), powerupValue);
	}

	const UserLine: React.FC<{eveuser: User}> = ({user}) => {
		return (
			<Stack
				direction={'row'}
				paddingX={'0.5em'}
				justifyContent={'center'}
				alignItems= {'center'}
				textAlign={'center'}
				height={'2em'}
				sx={{
					cursor: 'pointer',
					// padding: '0.3em',
					borderRadius: '5px',
					backgroundColor: theme => theme.palette.primary.main,
					transition: 'padding-left ease-in-out 0.3s, padding-right ease-in-out 0.3s, border-radius ease-in-out 0.3s, background-color ease-in-out 0.3s',
					'&:hover': {
					  bgcolor: theme.palette.primary.dark,
					//   borderRadius: '2em',
					  paddingLeft: '1em',
					  paddingRight: '0.02em',
					},
				}}
			>
				<AccountCircleIcon sx={{ marginRight: 1}}/>
				<Typography noWrap onClick={() => {(navigate(`/profile/` + user.id.toString()))}} sx={{ maxWidth: '78%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{user.nameIntra}
		 		 </Typography>
				<Box sx={{ flexGrow: 1 }} /> 
				<Tooltip title='Send game invite' arrow>
					<IconButton
						onClick={handleModalOpen}
						sx={{  }}
					>
						<GameIcon sx={{ }}/>
					</IconButton>
				</Tooltip>
				{modalOpen && 
					<GameInviteModal 
						open={modalOpen} 
						onClose={() => InviteGame(user)} 
						setValue={(revalue: PowerUpSelected) => {setPowerupValue(revalue)}} 
					/>
				}
				<Tooltip title='Send a direct messsage' arrow>
					<IconButton
						onClick={(event: React.MouseEvent) => handleSendDirectMessageClick(event, user)}
						sx={{  }}
						>
						<MessageIcon sx={{ }}/>
					</IconButton>
				</Tooltip>
			</Stack>
		);
	};
//////////////////////////////////////////////////////////////////////

	const renderUsers = () => (
		<Stack gap={1}>
			{users
				.filter((item: User) => item.intraId !== user.intraId) // ✅ Filter users first
				.map((item: User) => <UserLine key={item.id} user={item} />)}
		</Stack>
	);


	//---Function to render the list of channels---//
	const renderJoinedChannels = (channels: ChatRoom[]) => {
		const filteredChannels = channels.filter(channel => userInChannel(user.nameIntra, channel));
		
		// if (filteredChannels.length === 0) {
		// 	return null;
		// }

		return (
			<Stack gap={1}>
			{channels.map(channel => (
				<ChannelLine key={channel.id} channel={channel} />
			))}
	  		</Stack>
	  	);
	};

	const renderAvailableChannels = (channels: ChatRoom[]) => {
		let filteredChannels = channels.filter(
			channel => 
				!userInChannel(user.nameIntra, channel) 
				// && channel.settings.type !== 'private'
		);
		
		filteredChannels = channels.filter(
			channel => 
				!userBanned(user.id.toString(), channel) 
				// && channel.settings.type !== 'private'
		);
		// if (filteredChannels.length === 0) {
		// 	return null;
		// }

		return (
			<Stack gap={1}>
			{filteredChannels.map((channel) => ( 
				<AvailableChannelLine key={channel?.id} channel={channel} />
			))}
	 		</Stack>
		);
	};

	const renderDirectMessages = (channels: ChatRoom[]) => {
		// const filteredChannels = channels.filter(
		// 	channel => 
		// 		!userInChannel(user.nameIntra, channel) 
		// 		// && channel.settings.type !== 'private'
		// );

		// if (filteredChannels.length === 0) {
		// 	return null;
		// }

		return (
			<Stack gap={1}>
			{directMessages.map((channel) => ( 
				<ChannelLine key={channel?.id} channel={channel} />
			))}
	 		</Stack>
		);
	};

	const [userMessage, setUserMessage] = useState<Map<string, User>>(new Map());

	const fetchUser = async (userId: string) => {
		const user = await fetchOpponent(userId);
		setUserMessage((prev) => new Map(prev).set(userId, user));
	};

	const showMessages =  (muted: string[], msg: ChatMessage, index: number) =>
	{
		if (muted.find((item: string) => item == msg.user))
		{
			return (
				<Stack></Stack>
			);
		}

		var user = userMessage.get(msg.user);
		
		if (!user) {
			fetchUser(msg.user);
			return <Stack>Loading...</Stack>;
		}

		return (
				<Box
					key={index}
					sx={{display: "flex", alignItems: "center", mb: 3}}
				>
					<Avatar
						onClick={()=> (navigate(`/profile/${user.id.toString()}`))}
						sx={{cursor: 'pointer', mr: 2}}
						src={user.image}
					>
					</Avatar>
					<Typography 
						sx={{ whiteSpace: "normal",
							overflowWrap: 'anywhere',
							wordBreak: 'break-word',
							maxWidth: "70%"}}
						key={index}
					>
						{`(${user.nameNick}): `}
						{msg.message}
					</Typography>
				</Box>
		);
	}

	return (
	  <Container sx={{ padding: theme.spacing(3) }}>
		<Stack
		  direction="row"
		  bgcolor={theme.palette.primary.dark}
		  divider={<Divider orientation="vertical" flexItem />}
		  padding="1em"
		>
		  {/*---Sidebar---*/}
		  <Stack
			padding="1em"
			gap={2}
			bgcolor={theme.palette.primary.light}
			width="251px"
			sx={{ height: '80vh', overflowY: 'auto', scrollbarColor: (theme) => `${theme.palette.primary.main} transparent` }}
		  >
			<Button
			  variant="contained"
			  onClick={() => setIsAddingChannel(true)}
			  sx={{ textTransform: 'none' }}
			>
			  Create a Channel
			</Button>
			<Divider sx={{}} />
			{/* Joined Channels Section */}
			<Box sx={{ marginBottom: 1}}>
				<Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1}}>
					Joined Channels
				</Typography>
				{/* {renderJoinedChannels(chatProps.chatRooms)} */}
				{renderJoinedChannels(joinedChannels)}
			</Box>
			<Divider/>
			{/* Available Channels Section */}
			<Box sx={{ marginBottom: 1}}>
				<Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1}}>
					Available Channels
				</Typography>
				{/* {renderAvailableChannels(availableChannels)}  */}
				{/* {renderAvailableChannels(chatProps.chatRooms)}  */}
				{renderAvailableChannels(availableChannels)} 
			</Box>
			<Divider/>
			{/* Direct Messages Section */}
			<Box sx={{ marginBottom: 1}}>
				<Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1}}>
					Direct Messages
				</Typography>
				{/* {renderAvailableChannels(availableChannels)}  */}
				{/* {renderAvailableChannels(chatProps.chatRooms)}  */}
				{renderDirectMessages(availableChannels)} 
			</Box>
			<Divider/>

			{/* Users Section */}
			<Box sx={{ marginBottom: 1}}>
				<Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1}}>
					Users
				</Typography>
				{renderUsers()}
			</Box>
		  </Stack>
  
		  {/* Main Content */}
		  <Box flex={1} padding="1em" bgcolor={theme.palette.primary.light} sx={{height: '80vh'}}>
			{isAddingChannel ? (
			  <Box>
				<Typography variant="h6">Enter Channel Name</Typography>
				<TextField
				  label="Channel Name"
				  value={channelName}
				  onChange={(event: React.KeyboardEvent) => setChannelName(event.target.value)}
				  fullWidth
				  sx={{ my: 2 }}
				/>
				<Button
				  variant="contained"
				  onClick={handleCreateChannel}
				  fullWidth
				  sx={{ textTransform: 'none', mt: 2 }}
				>
				  Create
				</Button>
				<Button
					  variant="contained"
					  color="primary"
					  fullWidth
					  onClick={handleCancelNewChannel}
					  sx={{ textTransform: 'none', mt: 2 }}
					>
					  Cancel
					</Button>
			  </Box>
			) : selectedChannel ? (
			  isSettingsView ? (
				//---Render Settings Modal---//
				<SettingsModal
				//   key={selectedChannel.settings.type}
				  open={isSettingsView}
				  onClose={() => setIsSettingsView(false)}
				  settings={selectedChannel.settings}
				  setSettings={(updatedSettings) => {
					setChatProps((prevState) => ({
					  ...prevState,
					  chatRooms: prevState.chatRooms.map((room) =>
						room.name === selectedChannel.name
						  ? { ...room, settings: updatedSettings }
						  : room
					  ),
					}));
					setSelectedChannel((prevState) => ({
						...prevState,
						settings: updatedSettings,
					}));
				}}
				  chatProps={chatProps}
				  setChatProps={setChatProps}
				  selectedChannel={selectedChannel}
				  setSelectedChannel={setSelectedChannel}
				  joinedChannels={joinedChannels}
				  setJoinedChannels={setJoinedChannels}
				  availableChannels={availableChannels}
				  setAvailableChannels={setAvailableChannels}
				  setIsSettingsView={setIsSettingsView}
				  style={{ width: '5000px' }}
				/>
			  ) : (
				//---Render Messages---//
				<Box
					sx={{display: 'flex', flexDirection: 'column',  height: '100%'}}
				>
				  {/* <Typography variant="h6">{selectedChannel.name}</Typography> */}
				  <Stack 
				  	mt={2}
				  	sx={{
						flexGrow: 1, // Ensures this takes up available vertical space
						overflowY: 'auto', // Enables scrolling if content overflows
						padding: '1em',
						// scrollbarWidth: 'thin',
						scrollbarColor: (theme) => `${theme.palette.primary.main} transparent`, 
					}
					}     
				  >
					{/* {console.log(selectedChannel.messages)}; */}
					{selectedChannel.messages.map((msg: ChatMessage, index: number) => (showMessages(selectedChannel.settings.muted, msg, index)))}
				  </Stack>
				
				  {/*---Render Input Box---*/}
				  <Box
				    sx={{
					//   marginTop: '1em',
				      display: 'flex',
				      alignItems: 'center',
					  borderTop: `1px solid ${theme.palette.primary.main}`,
					  padding: '0.5em',
					  width: '100%',
					//   borderRadius: '5em',
				    //   bgcolor: theme.palette.primary.dark,
				    }}
				  >
				    <InputBase
					  value = {newMessage}
					  onChange={handleSetMessage} 
				      onKeyDown={handleEnterPress}
					  sx={{
						// marginTop: '0.5em',
				        flexGrow: 1,
				        border: '1px solid',
				        padding: '0.5em',
				        borderRadius: '0.5em',
				        marginRight: '0.5em',
						boxShadow: `0px -2px 5px rgba(0, 0, 0, 0.2)`,
						
						
					}}
					placeholder="Type a message..."
				    />
				    <Button
					  variant="contained"
				      color="primary"
				      sx={{ textTransform: 'none' }}
				      onClick={handleSendMessage}
				    >
				      Send
				    </Button>
				  </Box>

				</Box>
			  )
			) : (
			  <Typography>Select a channel to view messages.</Typography>
			)}
		  </Box>
		  <Dialog
		  	open={isPasswordModal}
			onClose={() => setIsPasswordModal(false)}
		  >
			<DialogTitle>Enter Channel Password</DialogTitle>
			<DialogContent>
				<TextField
					type='password'
					label='Password'
					value={enteredChannelPass}
					onChange={(e) => setEnteredChannelPass(e.target.value)}
					fullWidth
				/>
			</DialogContent>
			<DialogActions>
				<Button 
					onClick={() => {
						setIsPasswordModal(false);
						setEnteredChannelPass('');
						setSelectedAvailableChannel(null);
					}}
				>
					Cancel
				</Button>
				<Button onClick={handleAvailableChannelPasswordSubmit}>Submit</Button>
			</DialogActions>
		  </Dialog>
		</Stack>
	  </Container>
	);
};

export default ChannelsPage;
