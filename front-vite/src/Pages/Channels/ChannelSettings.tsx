import React from 'react';
import {useState, useEffect} from 'react';
import { Settings as SettingsIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Box, Stack, TextField, Button, Typography, Modal, Divider, useTheme, MenuItem, Select, FormControl, Avatar} from '@mui/material';
import { ChatMessage, UserRoles, UserProps, ChatSettings, ChatRoom, ChatProps } from '../../Layout/Chat/InterfaceChat';
import { Add as AddIcon } from '@mui/icons-material';
import { userInChannel, userIsAdmin } from '../Channels/index';
import { fetchUser, getUserFromDatabase, User, useUser } from '../../Providers/UserContext/User';
import { socket } from '../../Layout/Chat/ChatContext';
import { prev } from 'cheerio/dist/commonjs/api/traversing';
import { PassThrough } from 'stream';

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
	// 			email: '',
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


	const handleKickFriend = (user: UserProps) => 
	{
		console.log('"Kick Friend" clicked!');
		const updatedUsers = settings.users.filter(item => item.id !== user.id);
		setSettings({ ...settings, users: updatedUsers });

		socket.emit('kickUserFromChannel', {userid: user.id, channelid: selectedChannel.id});
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

	// const handleChangePrivacy = (type: 'public' | 'private' | 'password', password: string | null) => {
	// 	console.log('"Change Privacy" clicked!');

	// 	socket.emit('changePrivacy', { channel_type: type, channel_id: selectedChannel.id, password }, (response) => {
	// 		if (response.success) {
	// 			console.log(`Response: ${response}`);
	// 			console.log(`Channel privacy changed (react) to: ${type}`);
	// 			// setSettings({ ...settings, type, password });
	// 		} else {
	// 			console.error('Failed to change channel privacy:', response.message);
	// 		}
	// 	});
	// };
	// useEffect(() => {
	// 	const handlePrivacyChanged = (updatedChannel) => {
	// 		// console.log('Updated Channel:', updatedChannel);
	// 		// console.log('Channel privacy updated:', updatedChannel);
	// 		console.log('Channel settings:', settings);
	// 		// setSettings((prevSettings) => ({
	// 		// 	...prevSettings,
	// 		// 	type: updatedChannel.ch_type,
	// 		// 	password: updatedChannel.password,
	// 		// 	users: prevSettings.users || [],
	// 		// }));
	// 		setSettings({ ...settings, type: updatedChannel.ch_type, password: updatedChannel.password})
	// 	};

	// 	socket.on('privacyChanged', handlePrivacyChanged);
		
	// 	return () => {
	// 	  socket.off('privacyChanged', handlePrivacyChanged);
	// 	};
	// }, []);

	useEffect(() => {
		socket.on('privacyChanged', (updatedChannel) => {
			console.log('Channel privacy updated:', updatedChannel);
			setSettings({ ...settings, type: updatedChannel.ch_type, password: updatedChannel.password})
	});
		return () => {
			socket.off('privacyChanged');
		};
	}, []);

	const handleChangePrivacy = (type: 'public' | 'private' | 'password', password: string | null) => {
		console.log('"Change Privacy" clicked!');

		socket.emit('changePrivacy', { channel_type: type, channel_id: selectedChannel.id, password });

		socket.once('privacyChanged', (updatedChannel) => {
			console.log('Channel settings:', settings);
			console.log('UpdatedChannel :', updatedChannel);
			setSettings({ ...settings, type: updatedChannel.ch_type, password: updatedChannel.password });
		});

		socket.once('error', (error) => {
			console.error(error.message);
		});

	}
	
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
		}
	};


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
					{settings?.users?.map(_user => (
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
							user.nameIntra !== _user.name && (
						<Stack direction="row" spacing={0.3}>
							<Button sx={{width: '120px'}} variant="outlined" color="secondary" size="small" onClick={() => handleRoleChange(_user.id, _user.role)}>
								{_user.role === 'admin' ? 'Make Member' : 'Make Admin' }
							</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleKickFriend(_user.name)}>Kick</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleBanFriend(_user.name)}>Ban</Button>
							<Button variant="outlined" color="error" size="small" onClick={() => handleBlockFriend(_user.name)}>Block</Button>
						</Stack>
						)}
						</Stack>
					))}
					</Stack>
				</Box>	
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
						{settings.users.map(_user => (
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