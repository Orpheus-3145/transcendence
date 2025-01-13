import React from 'react';
import {useState} from 'react';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Box, Stack, TextField, Button, Typography, Modal, Divider, useTheme, MenuItem, Select, FormControl} from '@mui/material';
import { ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Add as AddIcon } from '@mui/icons-material';
import { myself, userInChannel, userIsAdmin } from '.';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    settings: ChatSettings;
    setSettings: (settings: ChatSettings) => void;
	chatProps: ChatProps;
	setChatProps: (chatProps: ChatProps) => void;
	selectedChannel: ChatRoom;
	setSelectedChannel: (selectedChannel: ChatRoom) => void;
	availableChannels: ChatRoom[]
	setAvailableChannels: (availableChannels: ChatRoom[]) => void;
	setIsSettingsView: boolean
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
	open,
	onClose,
	settings,
	setSettings,
	chatProps,
	setChatProps,
	selectedChannel,
	setSelectedChannel,
	availableChannels,
	setAvailableChannels,
	setIsSettingsView
}) => {
	const [friendName, setFriendName] = useState('');
	const theme = useTheme();

	const handleAddFriend = () => {
		//--> CALL TO BACKEND <-- //
		console.log('"Add Friend" clicked!');
		if (friendName) {
			const newUser: UserProps = {
				name: friendName,
				role: 'Guest',
				email: '',
				password: '',
				icon: <PersonAddIcon />
			};
			setSettings({ ...settings, users: [...settings.users, newUser] });
			setFriendName('');
		}
	}

	const handleKickFriend = (name: string) => {
		//--> CALL TO BACKEND <-- //
		console.log('"Kick Friend" clicked!');
		// const updatedUsers = settings.users.filter(user => user.name !== name);
		// setSettings({ ...settings, users: updatedUsers });
	
	};

	const handleBanFriend = (name: string) => {
		//--> CALL TO BACKEND <-- //
		console.log('"Ban Friend" clicked!');
		// const updatedUsers = settings.users.filter(user => user.name !== name);
		// setSettings({ ...settings, users: updatedUsers });
	
	};

	const handleBlockFriend = (name: string) => {
		//--> CALL TO BACKEND <-- //
		console.log('"Block Friend" clicked!');
		// const updatedUsers = settings.users.filter(user => user.name !== name);
		// setSettings({ ...settings, users: updatedUsers });
	
	};

	const handleRoleChange = (name: string, role: string) => {
		//--> CALL TO BACKEND <-- //
		console.log('"Change Role" clicked!');
		// if (selectedChannel.settings.owner === 'MSELF') { 
			const newRole = role === 'Guest' ? 'Admin' : 'Guest';
			const updatedUsers = settings.users.map(user => user.name === name ? { ...user, role: newRole } : user);
			setSettings({ ...settings, users: updatedUsers });
		// } 
		// else {
		// 	alert('Only channel owners can change user permissions!');
		// }
	};

	const handleChangePrivacy = (type: 'public' | 'private' | 'password', password: string | null) => {
		//--> CALL TO BACKEND <-- //
		console.log('"Change Privacy" clicked!');
		setSettings({ ...settings, type, password });
	};

	const handleDeleteChannel = () => {
		//--> CALL TO BACKEND <-- //
		console.log("'Delete Channel' clicked!");
		if (selectedChannel.settings.owner === myself.name) {
			const updatedChannels = chatProps.chatRooms.filter((chat) => chat.name !== selectedChannel.name);
			setChatProps({...chatProps, chatRooms: updatedChannels});
			setSelectedChannel(null);
		}
	}

	const handleLeaveChannel = () => {

		setIsSettingsView(false);

		
		setChatProps((prevState) => ({
			...prevState,
			chatRooms:  prevState.chatRooms.filter((channel) => channel.name !== selectedChannel.name),
		}));
		
		if (selectedChannel.settings.users.length === 1 && userInChannel(myself.name, selectedChannel)) {
			setSelectedChannel(null);
			return ;
		}
		
		const filteredUsers = selectedChannel.settings.users.filter((user) => user.name !== myself.name);
		
		const updatedChannel: ChatRoom = {
			...selectedChannel,
			settings: {
				...selectedChannel.settings,
				users: filteredUsers,
				owner: selectedChannel.settings.owner === myself.name ? filteredUsers?.[filteredUsers.length - 1]?.name ?? null : selectedChannel.settings.owner,
			},
		};

		setAvailableChannels((prevState) => ([
			...prevState,
			updatedChannel,
		]))

		setSelectedChannel(null);

		
	};


	return (
		<Modal open={open} onClose={onClose}>
		  <Box bgcolor={theme.palette.primary.light} p={3} width="450px" borderRadius={2} margin="auto" mt="10%">
			<Typography variant="h6">{`Channel Owner: ${selectedChannel.settings.owner}`}</Typography>
			<Divider sx={{ my: 2 }} />
			{(selectedChannel.settings.owner === myself.name) && (
			<>
			{/* Privacy Options */}
			<Stack direction="row" spacing={2}>
			  <Button variant={settings?.type === 'public' ? 'contained' : 'outlined'} onClick={() => handleChangePrivacy('public', null)}>Public</Button>
			  <Button variant={settings?.type === 'private' ? 'contained' : 'outlined'} onClick={() => handleChangePrivacy('private', null)}>Private</Button>
			  <Button variant={settings?.type === 'password' ? 'contained' : 'outlined'} onClick={() => handleChangePrivacy('password', settings.password)}>Password Protected</Button>
			</Stack>
	
			{/* Password field for password protected */}
			{settings?.type === 'password' && (
			  <TextField
				label="Password"
				value={settings.password || ''}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangePrivacy('password', e.target.value)}
				fullWidth
				sx={{ mt: 2 }}
			  />
			)}
	
			{/* Add Friend */}
  			<TextField
  			  label="Add Friend"
  			  value={friendName}
  			  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFriendName(e.target.value)}
  			  fullWidth
  			  sx={{ mt: 2 }}
  			/>
  			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

  			  <Button
  			    variant="contained"
  			    onClick={handleAddFriend}
  			    sx={{ mt: 1 }}
  			  >
  			    Add Friend
  			  </Button>

			  {(selectedChannel.settings.owner === myself.name) &&
				<Button
					variant="contained"
					onClick={handleDeleteChannel}
					sx={{ mt: 1, minWidth: '155px', color: 'rgb(247, 77, 57)' }}
					>
					Delete Channel
				</Button>
			  }
		  	</Box>
			</>
			)}
			{(selectedChannel.settings.owner === myself.name) ? (
				<Box sx={{display: 'flex'}}>
					<Button
						variant="contained"
						onClick={handleLeaveChannel}
						sx={{ mt: 1, marginLeft: 'auto', minWidth: '155px' }}
						>
						Leave Channel
					</Button> 
				</Box>) : (
				<Box sx={{display: 'flex'}}>
					<Button
						variant="contained"
						onClick={handleLeaveChannel}
						sx={{ mt: 1, minWidth: '200px', mx: 'auto' }}
					>
						Leave Channel
					</Button>
				</Box>
			)}
			{/* Friend List */}
			<Box sx={{ maxHeight: 250, overflow: 'auto', mt: 2}}>
				<Stack spacing={1} mt={2}>
				  <Typography variant="h6" sx={{textAlign: 'center'}}>Users</Typography>
				  <Divider />
				  {settings?.users.map(user => (
					<Stack direction="row" justifyContent="space-between" alignItems="center" key={user.name}>
					  <Typography sx={{whiteSpace: 'pre-line'}} >
							{user.name.length > 10 ? user.name.slice(0, 9) + '...' : user.name}
					  		{(userIsAdmin(myself.name, selectedChannel) ||
					  			selectedChannel.settings.owner === myself.name) ? 
									'\n' :
									' '}
							{`(${user.role})`}
					  </Typography>
					  {(userIsAdmin(myself.name, selectedChannel) ||
					  	selectedChannel.settings.owner === myself.name) && 
						myself.name !== user.name && (
					  <Stack direction="row" spacing={0.3}>
						<Button sx={{width: '110px'}} variant="outlined" color="secondary" size="small" onClick={() => handleRoleChange(user.name, user.role)}>
							{user.role === 'Guest' ? 'Make Admin' : 'Make Guest' }
						</Button>
						<Button variant="outlined" color="error" size="small" onClick={() => handleKickFriend(user.name)}>Kick</Button>
						<Button variant="outlined" color="error" size="small" onClick={() => handleBanFriend(user.name)}>Ban</Button>
						<Button variant="outlined" color="error" size="small" onClick={() => handleBlockFriend(user.name)}>Block</Button>
					  </Stack>
					)}
					</Stack>
				  ))}
				</Stack>
			</Box>	
		  </Box>
		</Modal>
	  );


};