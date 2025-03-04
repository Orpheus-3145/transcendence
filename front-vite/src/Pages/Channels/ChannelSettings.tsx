import React from 'react';
import {useState, useEffect} from 'react';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Box, Stack, TextField, Button, Typography, Modal, Divider, useTheme, MenuItem, Select, FormControl, Avatar} from '@mui/material';
import { ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Add as AddIcon } from '@mui/icons-material';
import { userInChannel, userIsAdmin } from '../Channels/index';
import { fetchOpponent, fetchUser, getUserFromDatabase, User, useUser } from '../../Providers/UserContext/User';
import { socket } from '../../Layout/Chat/ChatContext';
import { prev } from 'cheerio/dist/commonjs/api/traversing';
import { useNavigate } from 'react-router-dom';

// User test data
// const testUser = {
// 	name: 'user_test',

// };

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
			const newUser: UserProps = {
				id: tmp.id,
				name: tmp.nameNick,
				role: 'member',
				email: tmp.email,
				password: '',
				icon: <Avatar src={tmp.image}/>
			};

			if (settings.banned.find((item: string) => item === newUser.id.toString()))
			{
				setFriendName('');
				setLabel("User has been banned!");
				return ;
			}

			if (settings.users.find((item: UserProps) => item.id === newUser.id))
			{
				setFriendName('');
				setLabel("User already added!");
				return ;
			}

			setSettings({ ...settings, users: [...settings.users, newUser] });
			
			const data = {
				channel_id: selectedChannel.id,
				user_id: tmp.id,
				name: tmp.nameNick,
			};

			// Emit the user to the backend
			socket.emit('joinChannel', data);
			
			setFriendName('');
			setLabel("User added!");
		}
	}

	const handleKickFriend = (user: UserProps) => 
	{
		const updatedUsers = settings.users.filter((item: UserProps) => item.id !== user.id);
		setSettings({ ...settings, users: updatedUsers });

		socket.emit('kickUserFromChannel', {userid: user.id, channelid: selectedChannel.id});
	};

	const handleBanFriend = (user: UserProps) => 
	{
		const updatedUsers = settings.users.filter((item: UserProps) => item.id !== user.id);
		const tmp: string[] = settings.banned;
		tmp.push(user.id.toString());
		setSettings({...settings, users: updatedUsers, banned: tmp});

		socket.emit('banUserFromChannel', {userid: user.id, channelid: selectedChannel.id});
	};

	const handleUnbanFriend = (user: User) => 
	{
		const updatedUsers = settings.banned.filter((item: string) => item !== user.id.toString());
		setSettings({...settings, banned: updatedUsers});

		socket.emit('unbanUserFromChannel', {userid: user.id, channelid: selectedChannel.id});
	};

	const handleBlockFriend = (user: UserProps) => {
		//--> CALL TO BACKEND <-- //

		console.log('"Block Friend" clicked!');
		// const updatedUsers = settings.users.filter(user => user.name !== name);
		// setSettings({ ...settings, users: updatedUsers });
	};

	const handleRoleChange = (name: string, role: string) => {
		console.log('"Change Role" clicked!');
		// if (selectedChannel.settings.owner === 'MSELF') { 
			const newRole = role === 'member' ? 'admin' : 'member';
			const updatedUsers = settings.users.map(user => user.name === name ? { ...user, role: newRole } : user);
			setSettings({ ...settings, users: updatedUsers });
			// } 
			// else {
				// 	alert('Only channel owners can change user permissions!');
				// }

		//--> CALL TO BACKEND <-- //
	};

	const handleChangePrivacy = (type: 'public' | 'private' | 'password', password: string | null) => {
		console.log('"Change Privacy" clicked!');

		socket.emit('changePrivacy', { channel_type: type, channel_id: selectedChannel.id, password }, (response) => {
			if (response.success) {
				console.log(`Response: ${response}`);
				console.log(`Channel privacy changed (react) to: ${type}`);
				// setSettings({ ...settings, type, password });
			} else {
				console.error('Failed to change channel privacy:', response.message);
			}
		});
	};

	// useEffect(() => {
	// 	socket.on('privacyChanged', (updatedChannel) => {
	// 		console.log('Channel privacy updated:', updatedChannel);
	// 		setSettings({ ...settings, type: updatedChannel.ch_type, password: updatedChannel.password})
	// });
	// 	return () => socket.off('privacyChanged');
	// }, []);

	useEffect(() => {
		const handlePrivacyChanged = (updatedChannel) => {
			console.log('Channel privacy updated:', updatedChannel);
			setSettings({ ...settings, type: updatedChannel.ch_type, password: updatedChannel.password})
		};

		socket.on('privacyChanged', handlePrivacyChanged);
		
		// Cleanup the listener when the component unmounts
		return () => {
		  socket.off('privacyChanged', handlePrivacyChanged);
		};
	}, []);

	// const handleDeleteChannel = (channel_id: number) => {
	// 	console.log("'Delete Channel' clicked!");

	// 	socket.emit('deleteChannel', channel_id);

	// 	// if (selectedChannel.settings.owner === user.nameIntra) {
	// 		const updatedChannels = chatProps.chatRooms.filter(chat => chat.id !== channel_id);
	// 		setChatProps({...chatProps, chatRooms: updatedChannels});
	// 		setSelectedChannel(null);

	// 	// }
	// 	socket.on('error', (error) => {
	// 		console.error(error.message);
	// 	})
	// }
	
	const handleDeleteChannel = (channel_id: number) => {
		console.log("'Delete Channel' clicked!");
		socket.emit('deleteChannel', channel_id);
	
		// Listen for success or error response from the server
		socket.once('channelDeleted', (deletedChannel) => {
			if (deletedChannel) {
				const updatedChannels = chatProps.chatRooms.filter(chat => chat.id !== channel_id);
				setChatProps({ ...chatProps, chatRooms: updatedChannels });
				setSelectedChannel(null);
				console.log(`Channel deleted: ${deletedChannel.title}`);
			} else {
				console.error('Failed to delete channel');
			}
		});
	
		socket.once('error', (error) => {
			console.error(error.message);
		});
	};
	

	const handleLeaveChannel = () => {
		setIsSettingsView(false);

		const data = {
			user_id: user.id, 
			channel_id: selectedChannel.id,
			role: selectedChannel.settings.users.find(user_ => user.id === user_.id).role,
		};

		socket.emit('leaveChannel', data);
		
		socket.once('leftChannel', (response) => {
			if (response.channel_id === selectedChannel.id) {
				setJoinedChannels((prevState) => prevState.filter(ch => ch.id !== selectedChannel.id));

			}
			
			const filteredUsers = selectedChannel.settings.users.filter((usr) => usr.name !== user.nameIntra);
			const updatedChannel: ChatRoom = {
				...selectedChannel,
				settings: {
					...selectedChannel.settings,
					users: filteredUsers,
					owner: selectedChannel.settings.owner === user.nameIntra ? filteredUsers?.[filteredUsers.length - 1]?.name ?? null : selectedChannel.settings.owner,
				},
			};
			
			// console.log('Filtered users', filteredUsers);
			// if (filteredUsers.length )
			// setAvailableChannels((prevState) => {
			// 	const newChannels = [...prevState, updatedChannel];
			// 	// console.log("Updated availableChannels:", n`ewChannels);
			// 	return newChannels;
			// });

			if (filteredUsers.length > 0) {
				setAvailableChannels((prevState) => [...prevState, updatedChannel]);
			}

			setSelectedChannel(null);
		});
		
		socket.once('leavingChannelError', (error) => {
			console.error(error.message);
			alert(`Error joining channel: ${error.message}`);
		});


		// if (selectedChannel.settings.users.length === 1 && userInChannel(user.nameIntra, selectedChannel)) {
		// 	setSelectedChannel(null);
		// 	return ;
		// }

		// setAvailableChannels((prevState) => [...prevState, updatedChannel]);

		

	};

	const fetchbanned = async (bannedId: string) => {
		const banned = await fetchOpponent(bannedId);
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
			<Stack direction="row" spacing={5.3}>
				<Typography sx={{whiteSpace: 'pre-line'}} >
					{user.nameNick?.length > 10 ? user.nameNick.slice(0, 9) + '...' : user.nameNick}
				</Typography>
				<Button variant="contained" size="small" onClick={() => handleUnbanFriend(user)}>Unban</Button>
			</Stack>

		);
	}

	// console.log(selectedChannel.settings.owner, user.nameIntra);
	return (
		<Modal open={open} onClose={onClose}>
			{!selectedChannel.isDirectMessage ? (
			<Box bgcolor={theme.palette.primary.light} p={3} width="450px" borderRadius={2} margin="auto" mt="10%">
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
							userIsAdmin(_user.name, selectedChannel)) &&
							user.nameIntra !== _user.name && (
						<Stack direction="row" spacing={0.3}>
							<Button sx={{width: '110px'}} variant="outlined" color="secondary" size="small" onClick={() => handleRoleChange(user.name, user.role)}>
								{_user.role === 'admin' ? 'Make Member' : 'Make Admin' }
							</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleKickFriend(_user)}>Kick</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleBanFriend(_user)}>Ban</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleBlockFriend(_user)}>Block</Button>
						</Stack>
						)}
						</Stack>
					))}
					</Stack>
				</Box>
				{(selectedChannel.settings.owner === user.nameIntra ||
							userIsAdmin(user.nameNick, selectedChannel)) && (
					<Box sx={{ maxHeight: 250, overflow: 'auto', mt: 2}}>
						<Stack spacing={1} mt={2}>
						<Typography variant="h6" sx={{textAlign: 'center'}}>Banned</Typography>
						<Divider />
						{settings.banned.map((item: string) => (showBanned(item)))}
						</Stack>
					</Box>
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