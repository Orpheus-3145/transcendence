import React, { ReactNode } from 'react';
import { ChatStatus, ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Chat as ChatIcon } from '@mui/icons-material';
import {useState} from 'react';
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
  const navigate = useNavigate();

  const ChannelLine: React.FC<ChannelTypeEvent> = ({ component, newColor, clickEvent }) => {
  return (
    <Stack
    direction={'row'}
    gap={2}
    paddingX={'0.5em'}
    onClick={clickEvent}
    bgcolor={theme.palette.primary.main}
    justifyContent={'space-between'}
    alignItems={'center'}
    textAlign={'center'}
    minWidth={'218px'}
    sx={{
      width: '100%',
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
    <Typography noWrap sx={{
      maxWidth: '78%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }}>
      Welcome to the jungle
    </Typography>
    <IconButton
    onClick={(event) => { event.stopPropagation(); clickEvent }}
    sx={{
      minWidth: '10%',
      width: '40px',
      height: '40px', 
      '&:hover': {
      color: newColor,
      },
    }}>
      {component}
    </IconButton>
    </Stack>
  );
  };

  let getAvailableChannels = () => {
  return (
    <Stack gap={1}>
    {Array.from({ length: 5 }, (_, index) => (
      <ChannelLine key={index} component={<LoginIcon />} newColor={"green"} clickEvent={() => console.log(`Channel ${index + 1} clicked`)} />
    ))}
    </Stack>
  );
  };

  let getJoinedChannels = () => {
  return (
    <Stack gap={1}>
    {Array.from({ length: 5 }, (_, index) => (
      <ChannelLine key={index} component={<LogoutIcon />} newColor={"red"} clickEvent={() => console.log(`Channel ${index + 1} clicked`)} />
    ))}
    </Stack>
  );
  };

  let channelCreationSection = () => {
  	const [channelName, setChannelName] = useState('');
	const [settingsOpen, setSettingsOpen] = useState(false);

	const [chatProps, setChatProps] = useState<ChatProps>({
		chatRooms: [
			{
				name: 'New Chat',
				icon: <ChatIcon />,
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
					{
						message: <Typography>I'm good!</Typography>,
						user: <Typography>'User1'</Typography>, 
						userPP: <Typography>'User1PP'</Typography>, 
						timestamp: <Typography>'20:12'</Typography>,
					},

				], 
				settings: {
					icon: <ChatIcon />,
					type: 'public',
					password: null,
					users: [
					{
					  name: 'User1',
					  role: 'Guest',
					  email: 'user1@example.com',
					  password: 'password1',
					  icon: <Typography>User1Icon</Typography>,
					},
					{
					  name: 'User2',
					  role: 'Owner',
					  email: 'user2@example.com',
					  password: 'password2',
					  icon: <Typography>User2Icon</Typography>,
					},
					{
					  name: 'User3',
					  role: 'Administrator',
					  email: 'user3@example.com',
					  password: 'password3',
					  icon: <Typography>User3Icon</Typography>,
					},
					{
					  name: 'User4',
					  role: 'Guest',
					  email: 'user4@example.com',
					  password: 'password4',
					  icon: <Typography>User4Icon</Typography>,
					},
					],
					owner: 'set current user!!',
		  		},
			},
			{
				name: 'ChatName2',
				icon: <ChatIcon />,
				messages: [
				],
				settings: {
					icon: <ChatIcon />,
					type: 'private',
					password: 'chat2password',
					users: [
					],
					owner: 'set current user!!',
				},
			},
		],
		chatStatus: ChatStatus.ChannelsPage,
		selected: null,
		searchPrompt: null,

	});
	
	return (
		<Modal open={open} onClose={onClose}>
		  <Box bgcolor="white" p={3} width="400px" borderRadius={2} margin="auto" mt="10%">
			<Typography variant="h6">Channel Settings</Typography>
			<Divider sx={{ my: 2 }} />
	
			{/* Privacy Options */}
			<Stack direction="row" spacing={2}>
			  <Button variant={settings.type === 'public' ? 'contained' : 'outlined'} onClick={() => handleChangePrivacy('public', null)}>Public</Button>
			  <Button variant={settings.type === 'private' ? 'contained' : 'outlined'} onClick={() => handleChangePrivacy('private', null)}>Private</Button>
			  <Button variant={settings.type === 'password' ? 'contained' : 'outlined'} onClick={() => handleChangePrivacy('password', settings.password)}>Password Protected</Button>
			</Stack>
	
			{/* Password field for password protected */}
			{settings.type === 'password' && (
			  <TextField
				label="Password"
				value={settings.password || ''}
				onChange={(e) => handleChangePrivacy('password', e.target.value)}
				fullWidth
				sx={{ mt: 2 }}
			  />
			)}
	
			{/* Add Friend */}
			<TextField
			  label="Add Friend"
			  value={friendName}
			  onChange={(e) => setFriendName(e.target.value)}
			  fullWidth
			  sx={{ mt: 2 }}
			/>
			<Button variant="contained" color="primary" onClick={handleAddFriend} sx={{ mt: 1 }}>
			  Add Friend
			</Button>
	
			{/* Friend List */}
			<Stack spacing={1} mt={2}>
			  {settings.users.map(user => (
				<Stack direction="row" justifyContent="space-between" alignItems="center" key={user.name}>
				  <Typography>{user.name}</Typography>
				  <Stack direction="row" spacing={1}>
					<Button variant="outlined" color="secondary" onClick={() => handleRoleChange(user.name, 'Admin')}>Make Admin</Button>
					<Button variant="outlined" color="error" onClick={() => handleRemoveFriend(user.name)}>Remove</Button>
				  </Stack>
				</Stack>
			  ))}
			</Stack>
		  </Box>
		</Modal>
	  );
  };

  let createChannelButton = () => {
  return (
    <Stack
    	maxWidth={'100%'}
    	height={'48px'}
    	direction={'row'}
    	justifyContent={'center'}
    	alignItems={'center'}
    	gap={1}
    	bgcolor={theme.palette.primary.main}
    	sx={{
    	  cursor: 'pointer',
    	  transition: 'background-color ease-in-out 0.3s, border-radius ease-in-out 0.3s',
    	  '&:hover': {
    	  borderRadius: '2em',
    	  bgcolor: theme.palette.primary.dark,
    	  },
    	}}
    >
    <AddIcon />
    <Typography>
      Create a Channel
    </Typography>
    </Stack>
  );
  };

  let pageContainer = () => {
  return (
    <Container sx={{ padding: theme.spacing(3) }}>
    <Stack
      direction={'row'}
      bgcolor={theme.palette.primary.dark}
      divider={<Divider orientation='vertical' flexItem />}
      padding={'1em'}
    >
      <Stack
      padding={'1em'}
      gap={1}
      direction={'column'}
      height={'80vh'}
      bgcolor={theme.palette.primary.light}
      divider={<Divider flexItem />}
      width={'250px'}
      >
      {createChannelButton()}
      <Stack
        sx={{ overflowY: 'auto', maxHeight: '100%' }}
        divider={<Divider orientation='horizontal' flexItem />}
        gap={2}
      >
        {getJoinedChannels()}
        {getAvailableChannels()}
      </Stack>
      </Stack>
      <Stack
      width={'100%'}
      >
      {channelCreationSection()}
      </Stack>
    </Stack>
    </Container>
  );
  };

  return (
  	pageContainer()
  );
};

export default ChannelsPage;
