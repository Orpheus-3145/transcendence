import React, { ReactNode, useEffect } from 'react';
import axios from 'axios';
import { ChatStatus, ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SettingsModal } from './ChannelSettings';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon, Close as CloseIcon,  AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputBase, Divider, Typography, Button, IconButton, Container, useTheme, Stack, Modal, TextField, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SportsEsportsRoundedIcon from '@mui/icons-material/SportsEsportsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { styled } from '@mui/system';
import { Add as AddIcon, Group as GroupIcon, Cancel as CancelIcon, Logout as LogoutIcon, Login as LoginIcon, VideogameAsset as GameIcon} from '@mui/icons-material';
import { timeStamp } from 'console';
import { index } from 'cheerio/dist/commonjs/api/traversing';
import { useChatContext, socket } from '../../Layout/Chat/ChatContext';
import { User, useUser } from '../../Providers/UserContext/User';
import { getAll } from '../../Providers/UserContext/User';
import { getRandomValues } from 'crypto';
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

//////////////////////////////////////////////////////////////////////

let joinedRooms: number[] = [];

const ChannelsPage: React.FC = () => {
	const { user } = useUser();
	// console.log(user.id);
	
	const theme = useTheme();
	const navigate = useNavigate();
	const [channelName, setChannelName] = useState('');
	const [isAddingChannel, setIsAddingChannel] = useState(false);
	const [isSettingsView, setIsSettingsView] = useState(false);
	const [isPasswordModal, setIsPasswordModal] = useState(false);
	const [enteredChannelPass, setEnteredChannelPass] = useState('');
	const [users, setUsers] = useState<UserProps>([]);

	const [onlineUsers, setOnlineUsers] = useState<UserProps[]>([ 
		{
			name: 'Thooooooooooooooooooooooor',
			role: 'member',
			email: 'thor@avengers.com',
			password: '',
			icon: React.ReactElement ,
		},
		{
			name: 'Fuuuuuuury',
			role: 'member',
			email: 'nick@fury.com',
			password: '',
			icon: React.ReactElement ,
		},
		{
			name: 'Loki',
			role: 'member',
			email: 'loki@avengers.com',
			password: '',
			icon: React.ReactElement ,
		},
	]);
	
	// const {newMessage, setNewMessage} = useChatContext();
	const [newMessage, setNewMessage] = useState('');
	const {chatProps, setChatProps} = useChatContext();
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [selectedChannel, setSelectedChannel] = useState<ChatRoom | null>(null);
	const [selectedAvailableChannel, setSelectedAvailableChannel] = useState<ChatRoom | null>(null);
	const [newChannelSettings, setNewChannelSettings] = useState<ChatSettings>({
		icon: <PersonAddIcon />,
		type: 'public',
		password: null,
		users: [],
		owner: 'currentUser',
	});

	const [availableChannels, setAvailableChannels] = useState<ChatRoom[]>([]);
 
	// const [availableChannels, setAvailableChannels] = useState<ChatRoom[]>([ //--> CALL TO BACKEND <-- //
	// 	{
	// 		id: -7,
	// 		name: 'chaaaaaaaaaaaaaaaaannel1',
	// 		icon: <GroupIcon />,
	// 		messages:  [],
	// 		settings: {
	// 			icon: <PersonAddIcon />,
	// 			type: 'public',
	// 			password: null,
	// 			users: [
	// 				{
	// 					name: 'User1',
	// 					role: 'admin',
	// 					email: 'iamgroot@avengers.com',
	// 					password: '',
	// 					icon: React.ReactElement ,
	
	// 				},
	// 			],
	// 			owner: 'User1',
	// 		  },
	// 	},
	// 	{
	// 		id: -4,
	// 		name: 'channel2',
	// 		icon: <GroupIcon />,
	// 		messages: [],
	// 		settings: {
	// 			icon: <PersonAddIcon />,
	// 			type: 'private',
	// 			password: null,
	// 			users: [
	// 				{
	// 					name: 'User2',
	// 					role: 'admin',
	// 					email: 'iamgroot@avengers.com',
	// 					password: '',
	// 					icon: React.ReactElement ,
	
	// 				},
	// 			],
	// 			owner: 'User2',
	// 		  },
	// 	},
	// 	{
	// 		id: -5,
	// 		name: 'channel3',
	// 		icon: <GroupIcon />,
	// 		messages: [
	// 			{
	// 			  message: <Typography>Whazuuuuuuuuuuup!</Typography>,
	// 			  user: <Typography>User1</Typography>,
	// 			  userPP: <Typography>img</Typography>,
	// 			  timestamp: <Typography>20:00</Typography>,
	// 			}],
	// 		settings: {
	// 			icon: <PersonAddIcon />,
	// 			type: 'password',
	// 			password: 'pass',
	// 			users: [],
	// 			owner: user.nameIntra,
	// 		  },
	// 	},
	// ]);
  
	useEffect(() => {
		if (chatProps.chatRooms) {
			setAvailableChannels(chatProps.chatRooms.filter(
				channel => 
					!userInChannel(user.nameIntra, channel) 
					&& channel.settings.type !== 'private'
			));
		}
	}, [chatProps.chatRooms])

	useEffect(() => {
		if (selectedAvailableChannel &&
			selectedAvailableChannel.settings.type === 'public') {
			moveSelectedChToJoinedCh();
		}
	}, [selectedAvailableChannel]);

	useEffect(() => {
		const fetchUsers = async () => {
			const usersList = await getAll();
			console.log("Fetched users (channels page):", usersList);
			setUsers(usersList);
		}
		fetchUsers();

		// setUsers((prevUsers) => );

		
	}, []);

//////////////////////////////////////////////////////////////////////
	
	const handleCreateChannel = () => {
		if (channelName.trim()) {
			const channelDTO = {
				title: channelName,
				ch_type: 'public',  // or another type based on UI
				ch_owner: user.nameIntra,
				users: [
					{ id: user.id, nameIntra: user.nameIntra, role: 'owner', email: user.email }
				],
				password: null,  // set password if needed
			};
	
			// Emit the event to create the channel on the server
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
						},
					},
				],
			}));
			// Clear the input field and close the channel creation modal
			setChannelName('');
			setIsAddingChannel(false);
		};
		// Listen for the server's response with the created channel data
		socket.on('channelCreated', handleChannelCreated);
		// You might also want to add a cleanup to remove the event listener when the component unmounts:
		return () => {
			socket.off('channelCreated', handleChannelCreated); // Ensure cleanup to prevent multiple listeners
		};
	}, []);
 
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
			  console.log(`Joined room: ${room.id}`);
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

	const handleAvailableChannelClick = (event: React.MouseEvent, channel: ChatRoom) => {
		event.stopPropagation();
		console.log('Available channel clicked!');
	
		setSelectedAvailableChannel(channel);
		setIsSettingsView(false);
		setIsAddingChannel(false);
	
		if (channel.settings.type === 'password') {
			setIsPasswordModal(true);
		} 
	};
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
	
	// const handleSendMessage = () => {
	// 	if (newMessage && selectedChannel) {
	// 		const newChatMessage: ChatMessage = {
	// 			message: newMessage,
	// 			user: <Typography>{user.nameIntra}</Typography>,
	// 			userPP: <Typography>img</Typography>,
	// 			timestamp: new Date().toLocaleTimeString(),
	// 		};

	// 		setChatProps((prevProps) => ({
	// 			...prevProps,
	// 			chatRooms: prevProps.chatRooms.map(room => 
	// 				room.id === selectedChannel.id
	// 					? {...room, messages: [...room.messages, newChatMessage]}
	// 					: room
	// 			),
	// 		}));
	// 		setSelectedChannel((prevState) => ({
	// 			...prevState,
	// 			messages: [...prevState.messages, newChatMessage]
	// 		}));

	// 		socket.emit('sendMessage', {client_id: user.id, channel_id: selectedChannel.id, message: newMessage});

	// 		setNewMessage('');
	// 	}
	// };

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
				user: user.nameIntra,
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
		  socket.off('newMessage'); // Cleanup listener
		};
	  }, [selectedChannel]);  // Only run once when the component mounts
	  


	//   useEffect(() => {
	// 	socket.on('newMessage', (message) => {
	// 	  console.log('Before update:', chatProps.chatRooms);
	  
	// 	  setChatProps((prevProps) => {
	// 		const updatedRooms = prevProps.chatRooms.map((room) =>
	// 		  room.id === message.receiver_id
	// 			? { ...room, messages: [...room.messages, message] }
	// 			: room
	// 		);
	  
	// 		console.log('After update:', updatedRooms);
	// 		return { ...prevProps, chatRooms: updatedRooms };
	// 	  });
	// 	});
	  
	// 	return () => socket.off('newMessage');
	//   }, []);
	  
	//   useEffect(() => {
	// 		console.log('updated channels:', chatProps.chatRooms);
	// 	}, [chatProps.chatRooms]);
	
	// 	useEffect(() => {
	// 		const handleNewMessage = (message) => {
	// 		  console.log('Received new message:', message);
	// 		  setChatProps((prevProps) => ({
	// 			...prevProps,
	// 			chatRooms: prevProps.chatRooms.map((room) =>
	// 			  room.id === message.receiver_id
	// 				? { ...room, messages: [...room.messages, message] }
	// 				: room
	// 			),
	// 		  }));
	// 		};
		  
	// 		socket.on('newMessage', handleNewMessage);
		  
	// 		return () => {
	// 		  socket.off('newMessage', handleNewMessage); // ✅ Proper cleanup
	// 		};
	// 	  }, []); // ✅ Empty dependency array ensures it runs only once
		  


	// useEffect(() => {
	// 	const handleNewMessage = (newMessage) => {
	// 		// console.log('Updated messages for channel:', updatedMessages);
	//         console.log('Received new message:', newMessage);

	// 		setChatProps((prevState) => ({
	// 			...prevState,
	// 			chatRooms: prevState.chatRooms.map((room) =>
	// 				room.id === newMessage.channel_id
	// 					? { ...room, messages: [...room.messages, newMessage.message] } // Update with full messages list
	// 					: room
	// 			),
	// 		}));

	// 		setSelectedChannel((prevState) =>
	// 			prevState.id === newMessage.channel_id
	// 				? { ...prevState, messages: [...prevState.messages, newMessage.message] }
	// 				: prevState
	// 		);
	// 	};
	
	// 	socket.on('newMessage', handleNewMessage);
	
	// 	return () => {
	// 		socket.off('newMessage', handleNewMessage);
	// 	};
	// }, [])

//////////////////////////////////////////////////////////////////////

	const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSendMessage();
		}
	};
//////////////////////////////////////////////////////////////////////

	const moveSelectedChToJoinedCh = () => {
		if (!selectedAvailableChannel) {
			return;
		}
		setIsPasswordModal(false);
		
		// const updatedChannel = { ...selectedAvailableChannel }; 
		const updatedChannel: ChatRoom = {
			...selectedAvailableChannel,
			settings: {
				...selectedAvailableChannel.settings,
				users: [
					...selectedAvailableChannel.settings.users,
					{
						id: user.id,
						name: user.nameIntra ,
						role: 'member',
						icon: <Avatar />,
					},
				],
			},
		}; 
		
		//--> CALL TO BACKEND <-- //

		setChatProps((prevState) => ({
		  ...prevState,
		  chatRooms: [...prevState.chatRooms, updatedChannel],
		}));
		
		setAvailableChannels((prevState) => 
		  prevState.filter((channel) => channel.id !== updatedChannel.id)
		);
		setSelectedChannel(null);
	};
	
//////////////////////////////////////////////////////////////////////

	const handleAvailableChannelPasswordSubmit = (event: React.MouseEvent) => {
		event.preventDefault();

		//--> CALL TO BACKEND <-- //

		if (enteredChannelPass !== selectedAvailableChannel?.settings.password) {
			alert("Incorrect password!");
		} else {
			// Move the channel to the joined channels secion //
			moveSelectedChToJoinedCh();
		}
		setEnteredChannelPass('');
	};

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

	const UserLine: React.FC<{user: User}> = ({user}) => {
		return (
			<Stack
				onClick={() => {(navigate(`/profile/1`))}} // TO BE REPLACED!
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
				<Typography noWrap sx={{ maxWidth: '78%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{user.nameIntra}
		 		 </Typography>
				<Box sx={{ flexGrow: 1 }} />
				<IconButton
					onClick={handleSendGameInvite}
					sx={{  }}
				>
					<GameIcon sx={{ }}/>
				</IconButton>
			</Stack>
		);
	};
//////////////////////////////////////////////////////////////////////

	const renderUsers = () => (
		<Stack gap={1}>
			{users.map((user) => (
				<UserLine key={user.id} user={user} />	
			))}
			
			{/* {Array.from({ length: 20 }).map((_, index) => (
				<UserLine key={index} />	
			))} */}
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
			{filteredChannels.map(channel => (
				<ChannelLine key={channel.id} channel={channel} />
			))}
	  		</Stack>
	  	);
	};

	const renderAvailableChannels = (channels: ChatRoom[]) => {
		const filteredChannels = channels.filter(
			channel => 
				!userInChannel(user.nameIntra, channel) 
				&& channel.settings.type !== 'private'
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
				{/* --> CALL TO BACKEND <-- */}
				{renderJoinedChannels(chatProps.chatRooms)} 
			</Box>
			<Divider/>
			<Box sx={{ marginBottom: 1}}>
				<Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1}}>
					Available Channels
				</Typography>
				{/* --> CALL TO BACKEND <-- */}
				{/* {renderAvailableChannels(availableChannels)}  */}
				{renderAvailableChannels(chatProps.chatRooms)} 
			</Box>
			<Divider/>
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
				  availableChannels={availableChannels}
				  setAvailableChannels={setAvailableChannels}
				  setIsSettingsView={setIsSettingsView}
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
					{selectedChannel.messages.map((msg, index) => (
					  <Box
						key={index}
						sx={{display: "flex", alignItems: "center", mb: 3}}
					  >
					  	<Avatar
							onClick={()=> (navigate(`/profile/${msg.user}`))}
							sx={{cursor: 'pointer', mr: 2}}
						>
							{msg.userPP}
						</Avatar>
					  	<Typography 
							sx={{ whiteSpace: "normal",
								overflowWrap: 'anywhere',
								wordBreak: 'break-word',
								maxWidth: "70%"}}
							key={index}
						>
							{/* {console.log(msg.user)} */}
							{`(${msg.user})`}
							{`(${socket.id}): `}
							{msg.message}
						</Typography>
					  </Box>
					))}
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
