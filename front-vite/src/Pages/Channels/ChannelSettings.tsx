import React from 'react';
import {useState, useEffect} from 'react';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Box, Stack, TextField, Button, Typography, Modal, Divider, useTheme, MenuItem, Select, FormControl, Avatar} from '@mui/material';
import { ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Add as AddIcon } from '@mui/icons-material';
import { userInChannel, userIsAdmin } from '../Channels/index';
import { fetchOpponent, fetchUser, fetchUserMessage, getUserFromDatabase, User, useUser } from '../../Providers/UserContext/User';
import { socket } from '../../Layout/Chat/ChatContext';
import { prev } from 'cheerio/dist/commonjs/api/traversing';
import { useNavigate } from 'react-router-dom';
import { channel } from 'diagnostics_channel';
// User test data
// const testUser = {
// 	name: 'user_test',

// };
let testUserId = 20;

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    settings: ChatSettings;
    setSettings: (settings: ChatSettings) => void;
	chatProps: ChatProps;
	setChatProps: (chatProps: ChatProps) => void;
	selectedChannel: ChatRoom;
	setSelectedChannel: (selectedChannel: ChatRoom) => void;
	joinedChannels: ChatRoom[]
	setJoinedChannels: (joinedChannels: ChatRoom[]) => void;
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
	joinedChannels,
	setJoinedChannels,
	availableChannels,
	setAvailableChannels,
	setIsSettingsView
}) => {
	const [friendName, setFriendName] = useState('');
	const [label, setLabel] = useState<string>("Add Friend");
	const theme = useTheme();
	const { user } = useUser();
	const [banned, setbanned] = useState<Map<string, User>>(new Map());

	// console.log(user);

	const handleAddFriend = async () => 
	{
		console.log('"Add Friend" clicked!');
		if (friendName.length > 0) {
			var tmp: User | null = await fetchUser(friendName);
			if (tmp === null)
			{
				setFriendName('');
				setLabel("User doesn't exist with that nickname!");
				return ;
			}

			if (settings.users.find((tmp_: UserProps) => tmp_.id === tmp.id))
			{
				setFriendName('');
				setLabel("User already added!");
				return ;
			}
			
			const data = {
				channel_id: selectedChannel.id,
				user_id: tmp.id,
				name: tmp.nameNick,
				email: tmp.email,
			};

			// Emit the user to the backend
			socket.emit('joinChannel', data);
			
			setFriendName('');
			setLabel("User added!");
		}
	}

	useEffect(() => {
		const handleUserJoinedChannel = (response) => {
			const newUser: UserProps = {
				id: response.user_id,
				name: response.name,
				role: 'member',
				email: response.email,
				password: '',
				// icon: <Avatar src={tmp.image}/> 
				icon: <PersonAddIcon /> //!!
			};
			
			setSettings({ ...settings, users: [...settings.users, newUser] });
		}
		socket.on('joinedChannel', handleUserJoinedChannel);
		return () => {
			socket.off('joinedChannel', handleUserJoinedChannel);
		}
	}, [settings]);


	// // -----------FOR TESTING ONLY ----------- //
	// const handleAddFriend = () => {
	// 	console.log('"Add Friend" clicked!');
	// 	if (friendName) {
	// 		const data = {
	// 			channel_id: selectedChannel.id,
	// 			user_id: testUserId++,
	// 			name: friendName,
	// 		};
	// 		socket.emit('joinChannel', data);
	// 		setFriendName('');
	// 	}
	// }

	// useEffect(() => {
	// 	const handleUserJoinedChannel = (response) => {
	// 		const newUser: UserProps = {
	// 			id: response.user_id,
	// 			name: response.name,
	// 			role: 'member',
	// 			email: response.email,
	// 			password: '',
	// 			icon: <PersonAddIcon />
	// 		};
	// 		setSettings({ ...settings, users: [...settings.users, newUser] });
	// 	}

	// 	socket.on('joinedChannel', handleUserJoinedChannel);

	// 	return () => {
	// 		socket.off('joinedChannel', handleUserJoinedChannel);
	// 	}
	// }, [settings]);

////////////////////////////////////////////////////////////////////////////////////////

	const handleKickFriend = (user: UserProps) => 
	{
		socket.emit('kickUserFromChannel', {userid: user.id, channelid: selectedChannel.id});
		
		const updateSettings = (data) =>
		{
			if (selectedChannel.id === data.id)
			{
				const updatedUsers = settings.users.filter((item: UserProps) => item.id !== data.userId);
				setSettings({ ...settings, users: updatedUsers });
			}
		}

		socket.on('userKicked', updateSettings)
	};



	const handleBanFriend = (user: UserProps) => 
	{
		socket.emit('banUserFromChannel', {userid: user.id, channelid: selectedChannel.id});

		const updateSettings = (data) =>
		{
			if (selectedChannel.id === data.id)
			{
				const updatedUsers = settings.users.filter((item: UserProps) => item.id !== data.userId);
				const tmp: string[] = settings.banned;
				if (!settings.banned.find((item: string) => item === data.userId))
					tmp.push(data.userId);
				setSettings({...settings, users: updatedUsers, banned: tmp});
			}
		}
	
		socket.on('userBanned', updateSettings)
	};

	const handleUnbanFriend = (user: User) => 
	{
		socket.emit('unbanUserFromChannel', {userid: user.id, channelid: selectedChannel.id});

		const updateSettings = (data) =>
		{
			if (selectedChannel.id === data.id)
			{
				const updatedUsers = settings.banned.filter((item: string) => item !== data.userId);
				setSettings({...settings, banned: updatedUsers});
			}
		}
		
		socket.on('userUnbanned', updateSettings)
	};

	const handleMuteFriend = (user: UserProps) => 
	{
		socket.emit('muteUserFromChannel', {userid: user.id, channelid: selectedChannel.id});

		const updateSettings = (data) =>
		{
			if (selectedChannel.id === data.id)
			{
				const tmp: string[] = settings.muted;
				if (!settings.muted.find((item: string) => item === data.userId))
				{
					tmp.push(data.userId);
				}
				setSettings({ ...settings, muted: tmp });
			}
		}
			
		socket.on('userMuted', updateSettings)
	};

	const handleUnmuteFriend = (user: UserProps) => 
	{
		socket.emit('unmuteUserFromChannel', {userid: user.id, channelid: selectedChannel.id});

		const updateSettings = (data) =>
		{
			if (selectedChannel.id === data.id)
			{
				const tmp: string[] = settings.muted.filter((item: string) => item !== data.userId);
				setSettings({ ...settings, muted: tmp });
			}
		}
				
		socket.on('userUnmuted', updateSettings)
	};

	const handleRoleChange = (userId: number, role: string) => {
		console.log('"Change Role" clicked!');
		console.log(userId);
		const data = {
			user_id: userId,
			channel_id: selectedChannel.id,
			new_role: role === 'admin' ? 'member' : 'admin',
		};
		socket.emit('changeUserRole', data, (response) => {
			if (response.success) {
				const updatedUsers = settings.users.map(user => user.id === userId ? { ...user, role: data.new_role } : user);
				setSettings({ ...settings, users: updatedUsers });
			} else {
				alert(`Error: ${response.message}`);
			}
		});
	};

	useEffect(() => {
		const handlePrivacyChanged = (updatedChannel) => {
			console.log('Channel privacy updated:', updatedChannel);
			setSettings({ ...settings, type: updatedChannel.ch_type, password: updatedChannel.password})
		};

		socket.on('privacyChanged', handlePrivacyChanged);
		
		return () => {
			socket.off('privacyChanged', handlePrivacyChanged);
		};
	}, [settings]);

	const handleChangePrivacy = (type: 'public' | 'private' | 'password', password: string | null) => {
		console.log('"Change Privacy" clicked!');

		socket.emit('changePrivacy', { channel_type: type, channel_id: selectedChannel.id, password });

		socket.once('error', (error) => {
			console.error(error.message);
		});

	}
	
	const handleDeleteChannel = (channel_id: number) => {
		console.log("'Delete Channel' clicked!");
		
		socket.emit('deleteChannel', channel_id);
	
		socket.once('error', (error) => {
			console.error(error.message);
		});
	};

	const handleLeaveChannel = () => {
		if (selectedChannel.settings.type === 'password'
			&& !selectedChannel.settings.password) {
			alert('Must provide a password or change the channel privacy');
		}
		else {
			setIsSettingsView(false);
	
			const data = {
				user_id: user.id, 
				channel_id: selectedChannel.id,
				role: selectedChannel.settings.users.find(user_ => user.id === user_.id).role,
			};
	
			socket.emit('leaveChannel', data);

			socket.once('leavingChannelError', (error) => {
				console.error(error.message);
				alert(`Error joining channel: ${error.message}`);
			});
		}
	};

	const fetchbanned = async (bannedId: string) => {
		const banned = await fetchUserMessage(bannedId);
		setbanned((prev) => new Map(prev).set(bannedId, banned));
	};

	let showBanned =  (id: string) =>
	{
		var user = banned.get(id);

		if (!user) {
			fetchbanned(id);
			return <Stack>Loading...</Stack>;
		}

		return (
			<Stack direction="row" spacing={40}>
				<Typography sx={{whiteSpace: 'pre-line'}} >
					{user.nameNick?.length > 10 ? user.nameNick.slice(0, 9) + '...' : user.nameNick}
				</Typography>
				<Button variant="contained" size="small" onClick={() => handleUnbanFriend(user)}>Unban</Button>
			</Stack>

		);
	}

	let isUserMuted = (user: UserProps) =>
	{
		if (settings.muted.find((item) => String(item) === String(user.id))) 
			return (true);
		return (false);
	}

	// console.log(selectedChannel.settings.owner, user.nameIntra);
	return (
		<Modal open={open} onClose={onClose}>
			{!selectedChannel.isDirectMessage ? (
			<Box bgcolor={theme.palette.primary.light} p={3} width="500px" borderRadius={2} margin="auto" mt="10%">
				{!selectedChannel.isDirectMessage && (
					<>
					<Typography variant="h6">{`Channel Owner: ${selectedChannel.settings.owner}`}</Typography>
					<Divider sx={{ my: 2 }} />
					</>
				)}
				{/* {console.log(user)} */}
				{/* {console.log(selectedChannel.settings.owner, user.nameIntra)} */}
				{selectedChannel.settings.owner === user.nameIntra && (
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
						label={label}
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
					<Button
						variant="contained"
						onClick={() => handleDeleteChannel(selectedChannel.id)}
						sx={{ mt: 1, minWidth: '155px', color: 'rgb(247, 77, 57)' }}
						>
						Delete Channel
					</Button>
					</Box>
					</>
				)}
				{(selectedChannel.settings.owner === user.nameIntra) ? (
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
					{settings.users.map((_user: UserProps) => (
						<Stack direction="row" justifyContent="space-between" alignItems="center" key={_user.id}>
						<Typography sx={{whiteSpace: 'pre-line'}} >
								{_user.name?.length > 10 ? _user.name.slice(0, 9) + '...' : _user.name}
								{/* {(userIsAdmin(_user.name, selectedChannel) || 
									selectedChannel.settings.owner === _user.name) ? 
										'\n' :
										' '} */}
								{`\n(${_user.role})`}
						</Typography>
						{/* {console.log(user.nameIntra)} */}
						{(selectedChannel.settings.owner === user.nameIntra ||
							userIsAdmin(user.nameIntra, selectedChannel)) &&
							(user.nameIntra !== _user.name) && (isUserMuted(_user) === false) && (
						<Stack direction="row" spacing={0.3}>
							<Button sx={{width: '120px'}} variant="outlined" color="secondary" size="small" onClick={() => handleRoleChange(_user.id, _user.role)}>
								{_user.role === 'admin' ? 'Make Member' : 'Make Admin' }
							</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleKickFriend(_user)}>Kick</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleBanFriend(_user)}>Ban</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleMuteFriend(_user)}>Mute</Button>
						</Stack>
						)}
						{(selectedChannel.settings.owner === user.nameIntra ||
							userIsAdmin(user.nameIntra, selectedChannel)) && isUserMuted(_user) === true && (
							<Stack direction="row" spacing={0.3}>
								<Button variant="contained" color="error" size="small" onClick={() => handleUnmuteFriend(_user)}>Unmute</Button>
							</Stack>	
						)}
						</Stack>
					))}
					</Stack>
				</Box>
				{(selectedChannel.settings.owner === user.nameIntra ||
							userIsAdmin(user.nameNick, selectedChannel)) && (settings.banned.length > 0) && (
					<Stack>
						<Box sx={{ maxHeight: 250, overflow: 'auto', mt: 2}}>
							<Stack spacing={1} mt={2}>
								<Typography variant="h6" sx={{textAlign: 'center'}}>Banned</Typography>
								<Divider />
								{settings.banned.map((item: string) => (showBanned(item)))}
							</Stack>
						</Box>
					</Stack>
				)}
			</Box>
			) : (
				<Box bgcolor={theme.palette.primary.light} p={3} width="450px" borderRadius={2} margin="auto" mt="10%">
					<Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
						<Button
							variant="contained"
							onClick={() => handleDeleteChannel(selectedChannel.id)}
							sx={{ mt: 1, minWidth: '155px', color: 'rgb(247, 77, 57)' }}
							>
							Delete Direct Message
						</Button>
					</Box>
					{/* Friend List */}
					<Box sx={{ maxHeight: 250, overflow: 'auto', mt: 2}}>
						<Stack spacing={1} mt={2}>
						<Typography variant="h6" sx={{textAlign: 'center'}}>Users</Typography>
						<Divider />
						{settings.users.map((_user: UserProps) => (
							<Stack direction="row" justifyContent="space-between" alignItems="center" key={_user.id}>
							<Typography sx={{whiteSpace: 'pre-line'}} >
									{_user.name?.length > 10 ? _user.name.slice(0, 9) + '...' : _user.name}
									{/* {(userIsAdmin(_user.name, selectedChannel) || 
										selectedChannel.settings.owner === _user.name) ? 
											'\n' :
											' '} */}
									{` (${_user.role})`}
							</Typography>
							</Stack>
						))}
						</Stack>
					</Box>	
				</Box>
			)
		}
		</Modal>
	  );
};