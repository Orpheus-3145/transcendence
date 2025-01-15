import React, { ReactNode, useEffect } from 'react';
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
import { Socket } from 'socket.io-client';
interface ChannelTypeEvent {
  component: React.ReactNode;
  newColor: string;
  clickEvent: () => void;
}

export const myself: UserProps =  {
	name: 'raanghel',
	role: 'Guest',
	email: 'raanghel@student.codam.nl',
	password: '',
	icon: React.ReactElement ,
};

export const userIsAdmin = (userName: string, channel: ChatRoom): boolean => {
	// 
	const found = channel.settings.users.find((user) => user.name === userName);
	return found?.role === 'Admin';
};

export const userInChannel = (userName: string, channel: ChatRoom): boolean => {
	const found = channel.settings.users.find((user) => user.name === userName);
	return found ? true : false;
};

const ChannelsPage: React.FC = () => {	
	const theme = useTheme();
	const navigate = useNavigate();
	const [channelName, setChannelName] = useState('');
	const [isAddingChannel, setIsAddingChannel] = useState(false);
	const [isSettingsView, setIsSettingsView] = useState(false);
	const [isPasswordModal, setIsPasswordModal] = useState(false);
	const [enteredChannelPass, setEnteredChannelPass] = useState('');
	const [onlinePlayers, setOnlinePlayers] = useState<UserProps[]>([  //--> CALL TO BACKEND <-- //
		{
			name: 'Thooooooooooooooooooooooor',
			role: 'Guest',
			email: 'thor@avengers.com',
			password: '',
			icon: React.ReactElement ,
		},
		{
			name: 'Fuuuuuuury',
			role: 'Guest',
			email: 'nick@fury.com',
			password: '',
			icon: React.ReactElement ,
		},
		{
			name: 'Loki',
			role: 'Guest',
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
	const [availableChannels, setAvailableChannels] = useState<ChatRoom[]>([ //--> CALL TO BACKEND <-- //
		{
			name: 'chaaaaaaaaaaaaaaaaannel1',
			icon: <GroupIcon />,
			messages:  [],
			settings: {
				icon: <PersonAddIcon />,
				type: 'public',
				password: null,
				users: [
					{
						name: 'User1',
						role: 'Admin',
						email: 'iamgroot@avengers.com',
						password: '',
						icon: React.ReactElement ,
	
					},
				],
				owner: 'User1',
			  },
		},
		{
			name: 'channel2',
			icon: <GroupIcon />,
			messages: [],
			settings: {
				icon: <PersonAddIcon />,
				type: 'private',
				password: null,
				users: [
					{
						name: 'User2',
						role: 'Admin',
						email: 'iamgroot@avengers.com',
						password: '',
						icon: React.ReactElement ,
	
					},
				],
				owner: 'User2',
			  },
		},
		{
			name: 'channel3',
			icon: <GroupIcon />,
			messages: [
				{
				  message: <Typography>Whazuuuuuuuuuuup!</Typography>,
				  user: <Typography>User1</Typography>,
				  userPP: <Typography>img</Typography>,
				  timestamp: <Typography>20:00</Typography>,
				}],
			settings: {
				icon: <PersonAddIcon />,
				type: 'password',
				password: 'pass',
				users: [],
				owner: 'MYSELF',
			  },
		},
	]);
  
	useEffect(() => {
		if (selectedAvailableChannel &&
			selectedAvailableChannel.settings.type === 'public') {
			moveSelectedChToJoinedCh();
		}
	}, [selectedAvailableChannel]);

	// Separate available and joined channels
	// const availableChannels = chatProps.chatRooms.slice(0, 3); // Example for available channels
	// const joinedChannels = chatProps.chatRooms.slice(3); // Example for joined channels (you can adjust this logic)
  
	// Functions to handle channel creation //
  
	const handleCreateChannel = () => {
		//--> CALL TO BACKEND <-- //
		// socket.emit('joinChannel', {'channel': channelName})
		//  TEST CALL BACKEND

		if (channelName.trim()) {
			setChatProps((prevState) => ({
				...prevState,
				chatRooms: [
					...prevState.chatRooms,
					{
						name: channelName, //--> CALL TO BACKEND <-- //
						icon: <GroupIcon />,
						messages: [],
						settings: {
							type: 'public',
							password: null,
							users: [{...myself, role: 'admin'}],
							owner: myself.name, //--> CALL TO BACKEND <-- //
						},
					},
				],
			}));
			setChannelName('');
			setIsAddingChannel(false);
		}
	}

	const handleCancelNewChannel = () => {
		setIsAddingChannel(false);
		setChannelName('');
	};

	const handleChannelClick = (channel: ChatRoom) => {
	  setSelectedChannel(channel);
	  setIsSettingsView(false);
	  setIsAddingChannel(false);
	  
	};

	const handleAvailableChannelClick = (event: React.MouseEvent, channel: ChatRoom) => {
		event.stopPropagation();
		// event.preventDefault();
		console.log('Available channel clicked!');
		setSelectedAvailableChannel(channel);
		setIsSettingsView(false);
	  	setIsAddingChannel(false);
		if (channel.settings.type === 'password') {
			setIsPasswordModal(true);
		}
		//  else {
		// 	moveSelectedChToJoinedCh();
		// }

	};
  
	const handleSettingsClick = (event: React.MouseEvent, channel: ChatRoom) => {
	  event.stopPropagation(); // Prevent triggering the channel click
	  setSelectedChannel(channel);
	  setIsAddingChannel(false);
	  setIsSettingsView(true);
	};

	const handleSendGameInvite = (event: React.MouseEvent) => {
		//--> CALL TO BACKEND <-- //

		event.stopPropagation();
		console.log("'Send Game Invite' clicked!");
	};

	const handleSetMessage = (event: React.KeyboardEvent) => {
		setNewMessage(event.target.value);
	};
	
	const handleSendMessage = () => {
		if (newMessage) {
			const newChatMessage: ChatMessage = {
				message: newMessage,
				user: <Typography>User1</Typography>,
				userPP: <Typography>img</Typography>,
				timestamp: <Typography>20:00</Typography>,
			};

			//--> CALL TO BACKEND <-- //

			setChatProps((prevProps) => ({
				...prevProps,
				chatRooms: prevProps.chatRooms.map(room => 
					room.name === selectedChannel?.name
						? {...room, messages: [...room.messages, newChatMessage]}
						: room
				),
			}));
			setSelectedChannel((prevState) => ({
				...prevState,
				messages: [...prevState.messages, newChatMessage]
			}));
			setNewMessage('');
		}
	};

	const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSendMessage();
		}
	};

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
				users: [...selectedAvailableChannel.settings.users, myself],
			},
		}; 
		
		//--> CALL TO BACKEND <-- //

		setChatProps((prevState) => ({
		  ...prevState,
		  chatRooms: [...prevState.chatRooms, updatedChannel],
		}));
		
		setAvailableChannels((prevState) => 
		  prevState.filter((channel) => channel.name !== updatedChannel.name)
		);
		setSelectedChannel(null);
	};

	// const moveSelectedChToAvailableCh = () => {
	// 	if (!selectedChannel) {
	// 		return ;
	// 	}
	// 	setChatProps((prevState) => ({
	// 		...prevState,
	// 		chatRooms:  prevState.chatRooms.filter((channel) => channel.name != selectedChannel.name),
	// 	}));
	// 	setAvailableChannels((prevState) => ([
	// 		...prevState,
	// 		selectedChannel,
	// 	]))
	// };
	  

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
  
	const PlayerLine: React.FC<{player: UserProps}> = ({player}) => {
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
					{player.name}
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

	const renderPlayers = () => (
		<Stack gap={1}>
			{onlinePlayers.map((player) => (
				<PlayerLine key={player.name} player={player} />	
			))}
			
			{/* {Array.from({ length: 20 }).map((_, index) => (
				<PlayerLine key={index} />	
			))} */}
		</Stack>
	);

	//---Function to render the list of channels---//
	const renderJoinedChannels = (channels: ChatRoom[]) => (
		<Stack gap={1}>
		{channels.map((channel) => (
			<ChannelLine key={channel?.name} channel={channel} />
		))}
	  </Stack>
	);

	const renderAvailableChannels = (channels: ChatRoom[]) => (
		<Stack gap={1}>
		{channels.map((channel) => (
			(channel.settings.type !== 'private') && 
			<AvailableChannelLine key={channel?.name} channel={channel} />
		))}
	  </Stack>
	);

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
				{renderAvailableChannels(availableChannels)} 
			</Box>
			<Divider/>
			<Box sx={{ marginBottom: 1}}>
				<Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1}}>
					Online Players
				</Typography>
				{/* --> CALL TO BACKEND <-- */}
				{renderPlayers()}
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
							{/* {msg.user} */}
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
