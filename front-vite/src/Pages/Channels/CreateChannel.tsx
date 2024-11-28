import React from 'react';
import {useState} from 'react';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Box, Stack, TextField, Button, Typography, Modal, Divider} from '@mui/material';
import { ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Add as AddIcon } from '@mui/icons-material';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    settings: ChatSettings;
    setSettings: (settings: ChatSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, settings, setSettings }) => {
	const [friendName, setFriendName] = useState('');

	const handleAddFriend = () => {
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

	const handleRemoveFriend = (name: string) => {
		console.log('"Remove Friend" clicked!');
		const updatedUsers = settings.users.filter(user => user.name !== name);
		setSettings({ ...settings, users: updatedUsers });
	
	};

	const handleRoleChange = (name: string, role: string) => {
		console.log('"Change Role" clicked!');
		const updatedUsers = settings.users.map(user => user.name === name ? { ...user, role } : user);
		setSettings({ ...settings, users: updatedUsers });
	};

	const handleChangePrivacy = (type: 'public' | 'private' | 'password', password: string | null) => {
		console.log('"Change Privacy" clicked!');
		setSettings({ ...settings, type, password });
	};


	return (
		<Modal open={open} onClose={onClose}>
		  <Box bgcolor="white" p={3} width="400px" borderRadius={2} margin="auto" mt="10%">
			<Typography variant="h6">Channel Settings</Typography>
			<Divider sx={{ my: 2 }} />
	
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
			<Button variant="contained" color="primary" onClick={handleAddFriend} sx={{ mt: 1 }}>
			  Add Friend
			</Button>
	
			{/* Friend List */}
			<Stack spacing={1} mt={2}>
			  {settings?.users.map(user => (
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