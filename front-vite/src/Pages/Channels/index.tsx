import React, { ReactNode } from 'react';
import { ChatStatus, ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SettingsModal } from './ChannelSettings';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Divider, Typography, Button, IconButton, Container, useTheme, Stack, Modal, TextField } from '@mui/material';
import { styled } from '@mui/system';
import {
  Add as AddIcon,
  Group as GroupIcon,
  Cancel as CancelIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { timeStamp } from 'console';

interface ChannelTypeEvent {
  component: React.ReactNode;
  newColor: string;
  clickEvent: () => void;
}

const ChannelsPage: React.FC = () => {
	const theme = useTheme();
  
	// State for channels, channel name input, settings modal, etc.
	const [channelName, setChannelName] = useState('');
	const [isAddingChannel, setIsAddingChannel] = useState(false);
	const [isSettingsView, setIsSettingsView] = useState(false);
	const [chatProps, setChatProps] = useState<ChatProps>({
	  chatRooms: [
		{
		  name: 'test channel',
		  icon: <GroupIcon />,
		  messages: [
			{
			  message: <Typography>Whazuuuuuuuup!</Typography>,
			  user: <Typography>'User1'</Typography>,
			  userPP: <Typography>'User1PP'</Typography>,
			  timestamp: <Typography>'20:00'</Typography>,
			},
			{
			  message: <Typography>Whazuuuuuuuuuuuuuup/.</Typography>,
			  user: <Typography>'User2'</Typography>,
			  userPP: <Typography>'User2PP'</Typography>,
			  timestamp: <Typography>'20:03'</Typography>,
			},
		  ],
		  settings: {
			icon: <PersonAddIcon />,
			type: 'public',
			password: null,
			users: [],
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
  
	// Functions to handle channel creation

	// const handleCreateChannel = () => {
	//   if (channelName.trim()) {
	// 	const newChannel: ChatRoom = {
	// 	  name: channelName,
	// 	  icon: <GroupIcon />,
	// 	  messages: [],
	// 	  settings: newChannelSettings,
	// 	};
  
	// 	setChatProps((prevState) => ({
	// 	  ...prevState,
	// 	  chatRooms: [...prevState.chatRooms, newChannel],
	// 	}));
	// 	setChannelName('');
	// 	setIsAddingChannel(false); // Hide the input after creating the channel
	//   }
	// };
  
	const handleCreateChannel = () => {
		if (channelName.trim()) {
		  setChatProps((prevState) => ({
			...prevState,
			chatRooms: [
			  ...prevState.chatRooms,
			  {
				name: channelName,
				icon: <GroupIcon />,
				messages: [],
				settings: {
				  type: 'public',
				  password: null,
				  users: [],
				  owner: 'MYSELF',
				},
			  },
			],
		  }));
		  setChannelName('');
		  setIsAddingChannel(false);
		}
	}

	const handleDeleteChannel = () => {
		console.log("'Delete Channel' clicked!");
	}

	const handleCancelNewChannel = () => {
		setIsAddingChannel(false);
		setChannelName('');
	};

	const handleChannelClick = (channel: ChatRoom) => {
	  setSelectedChannel(channel);
	  setIsSettingsView(false);
	};
  
	const handleSettingsClick = (event: React.MouseEvent, channel: ChatRoom) => {
	  event.stopPropagation(); // Prevent triggering the channel click
	  setSelectedChannel(channel);
	//   setSettingsOpen(true);
	  setIsSettingsView(true);
	};

	// const handleSaveChatSettings = () => {

	// };
  
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
		  minWidth={'218px'}
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
			onClick={(event) => handleSettingsClick(event, channel)}
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
  
	// Function to render the list of channels
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
		  {/* Sidebar */}
		  <Stack
			padding="1em"
			gap={2}
			bgcolor={theme.palette.primary.light}
			width="250px"
			sx={{ height: '80vh', overflowY: 'auto' }}
		  >
			<Button
			  variant="contained"
			  onClick={() => setIsAddingChannel(true)}
			  sx={{ textTransform: 'none' }}
			>
			  Create a Channel
			</Button>
  
			<Typography variant="h6">Available Channels</Typography>
			{renderChannels(chatProps.chatRooms)}
		  </Stack>
  
		  {/* Main Content */}
		  <Box flex={1} padding="1em" bgcolor={theme.palette.primary.light}>
			{isAddingChannel ? (
			  <Box>
				<Typography variant="h6">Enter Channel Name</Typography>
				<TextField
				  label="Channel Name"
				  value={channelName}
				  onChange={(e) => setChannelName(e.target.value)}
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
				// Render settings view inline
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
				/>
			  ) : (
				// Render messages view
				<Box
					sx={{display: 'flex', flexDirection: 'column'}}
				>
				  <Typography variant="h6">{selectedChannel.name}</Typography>
				  <Stack mt={2}>
					{selectedChannel.messages.map((msg, index) => (
					  <Typography key={index}>{msg.message}</Typography>
					))}
				  </Stack>
				  {(selectedChannel.settings.owner === 'MYSELF') &&
				  <Button
			  		variant="contained"
			  		onClick={handleDeleteChannel}
			  		sx={{ textTransform: 'none', alignSelf: 'flex-end' }}
				  >
			  		Delete Channel
				  </Button>}
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



// {/* Settings Modal */}
// <SettingsModal
//   open={settingsOpen}
//   onClose={() => setSettingsOpen(false)}
//   settings={newChannelSettings}
//   setSettings={setNewChannelSettings}
// />
// // Main container for the channels page
// return (
// 	<Container sx={{ padding: theme.spacing(3) }}>
// 	  <Stack
// 		direction="row"
// 		bgcolor={theme.palette.primary.dark}
// 		divider={<Divider orientation="vertical" flexItem />}
// 		padding="1em"
// 	  >
// 		{/* Left Sidebar */}
// 		<Stack
// 		  padding="1em"
// 		  gap={1}
// 		  direction="column"
// 		  height="80vh"
// 		  bgcolor={theme.palette.primary.light}
// 		  divider={<Divider flexItem />}
// 		  width="250px"
// 		>
// 		  <Button
// 			variant="contained"
// 			color="primary"
// 			fullWidth
// 			startIcon={<AddIcon />}
// 			onClick={() => setIsAddingChannel(true)} // Show the input field when creating a channel
// 			sx={{
// 			  fontWeight: 'bold',
// 			  textTransform: 'none',
// 			}}
// 		  >
// 			Create a Channel
// 		  </Button>
  
// 		  <Stack sx={{ overflowY: 'auto', maxHeight: '100%' }} divider={<Divider orientation="horizontal" flexItem />} gap={2}>
// 			<Typography variant="h6">Available Channels</Typography>
// 			{renderChannels(availableChannels)} {/* Render available channels */}
// 			<Typography variant="h6">Joined Channels</Typography>
// 			{renderChannels(joinedChannels)} {/* Render joined channels */}
// 		  </Stack>
// 		</Stack>
  
// 		{/* Right Section */}
// 		<Stack width="100%" padding="1em" bgcolor={theme.palette.primary.light} borderRadius={2}>
// 		  {isAddingChannel ? (
// 			<Box>
// 			  <Typography variant="h6">Enter Channel Name</Typography>
// 			  <TextField
// 				label="New Channel Name"
// 				value={channelName}
// 				onChange={(e) => setChannelName(e.target.value)}
// 				fullWidth
// 				sx={{ marginBottom: '1em' }}
// 			  />
// 			  <Button
// 				variant="contained"
// 				color="primary"
// 				fullWidth
// 				onClick={handleCreateChannel}
// 				disabled={!channelName.trim()}
// 				sx={{ fontWeight: 'bold', textTransform: 'none' }}
// 			  >
// 				Create Channel
// 			  </Button>
// 			  <Button
// 				variant="contained"
// 				color="primary"
// 				fullWidth
// 				onClick={handleCancelNewChannel}
// 				sx={{ fontWeight: 'bold', textTransform: 'none', mt: 2 }}
// 			  >
// 				Cancel
// 			  </Button>
// 			</Box>
// 		  ) : selectedChannel ? (
// 			isSettingsView ? (
// 			  <SettingsModal
// 				open={true}
// 				onClose={() => setIsSettingsView(false)}
// 				settings={selectedChannel.settings}
// 				setSettings={(updatedSettings) => {
// 				  setChatProps((prevState) => ({
// 					...prevState,
// 					chatRooms: prevState.chatRooms.map((room) =>
// 					  room.name === selectedChannel.name
// 						? { ...room, settings: updatedSettings }
// 						: room
// 					),
// 				  }));
// 				}}
// 			  />
// 			) : (
// 			  <Box>
// 				<Typography variant="h6">{selectedChannel.name}</Typography>
// 				<Stack divider={<Divider />} mt={2}>
// 				  {selectedChannel.messages.map((msg, index) => (
// 					<Box key={index}>
// 					  <Typography>{msg.message}</Typography>
// 					</Box>
// 				  ))}
// 				</Stack>
// 			  </Box>
// 			)
// 		  ) : (
// 			<Typography variant="h6">Select a channel to view messages</Typography>
// 		  )}
// 		</Stack>
// 	  </Stack>
// 	</Container>
//   );