import React, { ReactNode } from 'react';
import { ChatStatus, ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SettingsModal } from './ChannelSettings';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon, Close as CloseIcon,  AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputBase, Divider, Typography, Button, IconButton, Container, useTheme, Stack, Modal, TextField, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { timeStamp } from 'console';
import { index } from 'cheerio/dist/commonjs/api/traversing';

interface ChannelTypeEvent {
  component: React.ReactNode;
  newColor: string;
  clickEvent: () => void;
}

const ChannelsPage: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
  
	const [channelName, setChannelName] = useState('');
	const [isAddingChannel, setIsAddingChannel] = useState(false);
	const [isSettingsView, setIsSettingsView] = useState(false);
	const [onlinePlayers, setOnlinePlayers] = useState<UserProps[]>([
		{
			name: 'Thor',
			role: 'Guest',
			email: 'thor@avengers.com',
			password: '',
			icon: React.ReactElement ,
		},
		{
			name: 'Fury',
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
	
	const [chatProps, setChatProps] = useState<ChatProps>({
	  chatRooms: [
		{
		  name: 'test channel',
		  icon: <GroupIcon />,
		  messages: [
			{
			  message: <Typography>Whazuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuup!</Typography>,
			  user: <Typography>User1</Typography>,
			  userPP: <Typography>img</Typography>,
			  timestamp: <Typography>20:00</Typography>,
			},
			{
			  message: <Typography>Whazuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuup!</Typography>,
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
  
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [selectedChannel, setSelectedChannel] = useState<ChatRoom | null>(null);
	const [newChannelSettings, setNewChannelSettings] = useState<ChatSettings>({
	  icon: <PersonAddIcon />,
	  type: 'public',
	  password: null,
	  users: [],
	  owner: 'currentUser',
	});
  
	// Separate available and joined channels
	const availableChannels = chatProps.chatRooms.slice(0, 3); // Example for available channels
	const joinedChannels = chatProps.chatRooms.slice(3); // Example for joined channels (you can adjust this logic)
  
	// Functions to handle channel creation //
  
	const handleCreateChannel = () => {
		//--> CALL TO BACKEND <-- //
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
				  users: [],
				  owner: 'MYSELF', //--> CALL TO BACKEND <-- //
				},
			  },
			],
		  }));
		  setChannelName('');
		  setIsAddingChannel(false);
		}
	}

	const handleDeleteChannel = () => {
		//--> CALL TO BACKEND <-- //
		console.log("'Delete Channel' clicked!");
		const updatedChannels = chatProps.chatRooms.filter((chat: ChatRoom) => chat.name !== selectedChannel.name);
		setChatProps({...chatProps, chatRooms: updatedChannels});
		setSelectedChannel(null);
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
  
	const handleSettingsClick = (event: React.MouseEvent, channel: ChatRoom) => {
	  event.stopPropagation(); // Prevent triggering the channel click
	  setSelectedChannel(channel);
	//   setSettingsOpen(true);
	  setIsSettingsView(true);
	  setIsAddingChannel(false);
	};

	const handleSendGameInvite = (event: React.MouseEvent) => {
		event.stopPropagation();


	};

	// Channel line component to render each channel in the list
	const ChannelLine: React.FC<{ channel: ChatRoom }> = ({ channel }) => {
	  return (
		<Stack
		  direction={'row'}
		  gap={2}
		  paddingX={'0.5em'}
		  onClick={() => handleChannelClick(channel)}
		  bgcolor={theme.palette.primary.main}
		  justifyContent={'space-between'}
		  alignItems={'center'}
		  textAlign={'center'}
		//   minWidth={'218px'}
		  sx={{
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
			onClick={(event: React.MouseEvent) => handleSettingsClick(event, channel)}
			sx={{
			  minWidth: '10%',
			  width: '40px',
			  height: '40px',
			}}
		  >
			<SettingsIcon />
		  </IconButton>
		</Stack>
	  );
	};
  
	const PlayerLine: React.FC = () => {
		return (
			<Stack
				onClick={() => {(navigate(`/profile/1`))}} // TO BE REPLACED!
				direction='row'
				sx={{
					cursor: 'pointer',
					padding: '0.3em',
					borderRadius: '10px',
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
				<AccountCircleIcon sx={{marginRight: 1}}/>
				{'Player Name'}
				<IconButton
					onClick={(event: React.MouseEvent) => handleSendGameInvite(event)}

				>

				</IconButton>
			</Stack>
		);
	};

	const renderPlayers = () => (
		<Stack gap={1}>
			{}
			{Array.from({ length: 20 }).map((_, index) => (
				<PlayerLine key={index} />	
			))}
		</Stack>
	);

	//---Function to render the list of channels---//
	const renderChannels = (channels: ChatRoom[]) => (
		<Stack gap={1}>
		{channels.map((channel) => (
			<ChannelLine key={channel.name} channel={channel} />
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
				{renderChannels(chatProps.chatRooms)} 
			</Box>
			<Divider/>
			<Box sx={{ marginBottom: 1}}>
				<Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 1}}>
					Available Channels
				</Typography>
				{/* --> CALL TO BACKEND <-- */}
				{renderChannels(chatProps.chatRooms)} 
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
						sx={{display: "flex", alignItems: "top", mb: 4}}
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
							{msg.user}
							{msg.message}
						</Typography>
					  </Box>
					))}
				  </Stack>
				  {/* {(selectedChannel.settings.owner === 'MYSELF') &&
				  <Button
			  		variant="contained"
			  		onClick={handleDeleteChannel}
			  		sx={{ textTransform: 'none', alignSelf: 'flex-end' }}
				  >
			  		Delete Channel
				  </Button>} */}
				  
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
				    //   onClick={handleSendMessage}
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
		</Stack>
	  </Container>
	);
	
};

export default ChannelsPage;
