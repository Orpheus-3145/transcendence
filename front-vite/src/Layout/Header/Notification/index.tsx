import React from 'react';
import { useUser } from '../../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useContext } from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import {NotificationStruct, 
		removeNotificationDb, 
		acceptFriendRequest, 
		declineFriendRequest,
		acceptGameInvite, 
		declineGameInvite,
		NotificationType,
		socket} from '../../../Providers/NotificationContext/Notification';
import { GameData } from '/app/src/Types/Game/Interfaces';
import { GameDataContext } from '/app/src/Providers/GameContext/Game';
import {
	StyledIconWrapper,
	StyledListItemButton,
	DrawerContainer,
	Drawer,
} from '../DrawerList/DrawerComponents';
import {
	IconButton,
	Box,
	List,
	Stack,
	Divider,
	Typography,
	Tooltip,
	Button,
	ButtonGroup
} from '@mui/material';

export const Notification: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const theme = useTheme();  
	const [openDrawer, setOpenDrawer] = useState<Boolean>(false);
	const [showNotificationDot, setShowNotificationDot] = useState<Boolean>(false);
	const [messageArray, setMessageArray] = useState<NotificationStruct[]>([]);
	const [friendRequestArray, setFriendRequestArray] = useState<NotificationStruct[]>([]);
	const [gameInviteArray, setGameInviteArray] = useState<NotificationStruct[]>([]);
	const [isFirst, setIsFirst] = useState<Boolean>(true);
	const { setGameData } = useContext(GameDataContext)!;

	const toggleDrawer = (newOpen: boolean) => () => {setOpenDrawer(newOpen)};
	const navToUser = (id:string) => {navigate('/profile/' + id)};
	const navToChat = () => {navigate('/channels')};
	const navToGame = (gameInfo: GameData) => {
		setGameData(gameInfo);
		navigate('/game');
	}
	let removeNotiFromArray = (noti: NotificationStruct, arr: NotificationStruct[], type: NotificationType) =>
	{
		var tmparr = arr.filter((tmp: NotificationStruct) => tmp !== noti);
		
		if (type == NotificationType.Message || type == NotificationType.groupChat)
		{
			setMessageArray(tmparr);
		}
		else if (type == NotificationType.gameInvite)
		{
			setGameInviteArray(tmparr);
		}
		else if (type == NotificationType.friendRequest)
		{
			setFriendRequestArray(tmparr);
		}
	}

	let removeNotification = (noti: NotificationStruct) =>
	{
		removeNotiFromArray(noti, messageArray, noti.type);
		removeNotificationDb(noti.id.toString());
	}

	let whichMessage = (noti: NotificationStruct) =>
	{
		if (noti.message == null)
			return ;
		var notiMessage = noti.message;
		if (noti.message?.length > 23)
		{
			notiMessage = noti.message?.slice(0, 23) + "...";
		}

		if (noti.type === NotificationType.groupChat)
		{
			return (
				<Typography variant={'h1'}
					sx={{
						position: 'relative',
						left: '0px',
						fontSize: '0.9rem',
					}}    
				>
					The message: "{notiMessage}" has been sent in <a href="" onClick={() => navToChat()} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>{noti.senderName}</a>
				</Typography>
			);
		}
		return (
			<Typography variant={'h1'}
				sx={{
					position: 'relative',
					left: '0px',
					fontSize: '0.9rem',
				}}    
			>
				<a href="" onClick={() => navToUser(noti.senderId.toString())} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>{noti.senderName}</a>
				sent a message:
				<br />
				{notiMessage}
			</Typography>
		);
	}

	let initMessage = (noti: NotificationStruct) =>
	{
		return (
			<Stack
				sx={{
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Box 
					component="section" 
					sx={{
						padding: '10px',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<Tooltip title="Clear Notification" arrow>
						<IconButton 
							variant="contained" 
							component="label"
							onClick={() => removeNotification(noti)}
							sx={{
								position: 'absolute',
								left: '230px',
								top: '5px',
								width: '20px',
								height: '20px',
								fontSize: '20px',
								color: theme.palette.secondary.main,
								'&:hover': {
									color: theme.palette.error.dark,
								},
							}}				
						>
							<ClearIcon fontSize="inherit" />
						</IconButton>
					</Tooltip>
					{whichMessage(noti)}
				</Box>
			</Stack>
		);
	}

	let putMessages = () =>
	{
		if (messageArray == null || messageArray.length == 0)
		{
			return (
				<Box
					component="section"
				>
					<Typography
						sx={{
							color: theme.palette.secondary.main,
							padding: "5px",
						}}
					>
						You have no incoming messages!
					</Typography>
				</Box>
			);
		}
		
		return (
			<Stack>
				{messageArray.slice().reverse().map((item: NotificationStruct) => initMessage(item))}
				<Divider />
			</Stack>
		);
	}

	let pressAcceptRequest = (noti: NotificationStruct) =>
	{
		if (noti.type == NotificationType.friendRequest)
		{
			setOpenDrawer(false);
			removeNotiFromArray(noti, friendRequestArray, NotificationType.friendRequest);
			acceptFriendRequest(noti.senderId.toString(), noti.receiverId.toString());
		}
		else if (noti.type == NotificationType.gameInvite)
		{
			setOpenDrawer(false);
			removeNotiFromArray(noti, gameInviteArray, NotificationType.gameInvite);
			acceptGameInvite(noti.senderId.toString(), noti.receiverId.toString());
		}
	}

	let pressDeclineRequest = (noti: NotificationStruct) =>
	{		
		if (noti.type == NotificationType.friendRequest)
		{
			removeNotiFromArray(noti, friendRequestArray, NotificationType.friendRequest);
			declineFriendRequest(noti.senderId.toString(), noti.receiverId.toString());
		}
		else if (noti.type == NotificationType.gameInvite)
		{
			removeNotiFromArray(noti, gameInviteArray, NotificationType.gameInvite);
			declineGameInvite(noti.senderId.toString(), noti.receiverId.toString());
		}
	}

	let initRequest = (noti: NotificationStruct) =>
	{
		var message = "has sent you a friend request!";
		if (noti.type == NotificationType.gameInvite)
		{
			message = "has sent you a game invite!"; 
		}

		return (
			<Stack
				sx={{
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Box 
					component="section" 
					sx={{
						padding: '10px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<Typography variant={'h1'}
						sx={{
							fontSize: '0.9rem',
						}}    
					>
						<a href="" onClick={() => navToUser(noti.senderId.toString())} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>{noti.senderName}</a>
						{message}
					</Typography>
					<ButtonGroup 
						variant="contained"
						sx={{
							margin: '5px 0',
						}}
					>
						<Button
							onClick={() => pressAcceptRequest(noti)}
							sx={{
								background: "green",
								'&:hover': {
									background: '#375a18',
								},
							}}
						>
							Accept
						</Button>
						<Button
							onClick={() => pressDeclineRequest(noti)}
							sx={{
								background: "red",
								'&:hover': {
									background: '#a2251b',
								},
							}}
						>
							Decline
						</Button>
					</ButtonGroup>
				</Box>
			</Stack>
		);
	}

	let putFiendRequests = () =>
	{
		if (friendRequestArray == null || friendRequestArray.length == 0)
		{
			return (
				<Box
					component="section"
				>
					<Typography
						sx={{
							color: theme.palette.secondary.main,
							padding: "5px",
						}}
					>
						You have no incoming friend requests!
					</Typography>
				</Box>
			);
		}
	
		return (
			<Stack>
				{friendRequestArray.slice().reverse().map((item: NotificationStruct) => initRequest(item))}
				<Divider />
			</Stack>
		);
	}

	let putGameInvites = () =>
	{
		if (gameInviteArray == null || gameInviteArray.length == 0)
			{
				return (
					<Box
						component="section"         
					>
						<Typography
							sx={{
								color: theme.palette.secondary.main,
								padding: "5px",
							}}
						>
							You have no incoming game invites!
						</Typography>
					</Box>
				);
			}

		return (
			<Stack>
				{gameInviteArray.slice().reverse().map((item: NotificationStruct) => initRequest(item))}
				<Divider />
			</Stack>
		);		
	}

	let openBool = () =>
	{
		setOpenDrawer(true);
		setShowNotificationDot(false);
	}

	interface SectionHeaderProps {
		text: string;
		width: number;
	}

	let SectionHeader: React.FC<SectionHeaderProps> = ({ text, width }) =>
	{
		return (<Typography
			variant='h4'
			sx={{
				textAlign: 'center',
				width,
				color: theme.palette.secondary.main,
				bgcolor: theme.palette.primary.main,
			}}
		>{text}</Typography>)
	}

	let notificationBar = () =>
	{
		return (
			<Box alignContent={'center'}>
				<IconButton
					onClick={() => {
						openBool();
					}}
				>
					<NotificationsIcon sx={{ color: theme.palette.secondary.main }} />
				</IconButton>
				<Drawer open={openDrawer} anchor="right" onClose={toggleDrawer(false)}>
					<DrawerContainer
						role='presentation'
						onClick={toggleDrawer(false)}
						onKeyDown={toggleDrawer(false)}
					>
						<List>
							<SectionHeader text="Game invites" />
							{putGameInvites()}
							<SectionHeader text="Friend requests" />
							{putFiendRequests()}
							<SectionHeader text="Messages" />
							{putMessages()}
						</List>
					</DrawerContainer>
				</Drawer>
			</Box>
		)
	}

	let handleNotifications = (arr: NotificationStruct[]) => 
	{
		if (arr?.length === 0)
		{
			setShowNotificationDot(false);
			setFriendRequestArray([]);
			setMessageArray([]);
			setGameInviteArray([]);
			setShowNotificationDot(false);
		}
		else
		{
			var tmpfriendsArr: NotificationStruct[]  = [];
			var tmpmessageArr: NotificationStruct[]  = [];
			var tmpgameArr: NotificationStruct[]  = [];
			arr?.map((item: NotificationStruct) =>
			{
				if (item.type == NotificationType.Message && !messageArray.find((n: NotificationStruct) => n.id === item.id))
				{
					tmpmessageArr.push(item);
				}
				else if (item.type == NotificationType.groupChat && !messageArray.find((n: NotificationStruct) => n.id === item.id))
				{
					messageArray.push(item);
				}
				else if (item.type == NotificationType.friendRequest && !friendRequestArray.find((n: NotificationStruct) => n.id === item.id))
				{
					tmpfriendsArr.push(item);
				}
				else if (item.type == NotificationType.gameInvite && !gameInviteArray.find((n: NotificationStruct) => n.id === item.id))
				{
					tmpgameArr.push(item);
				}
			})
			setFriendRequestArray(tmpfriendsArr);
			setMessageArray(tmpmessageArr);
			setGameInviteArray(tmpgameArr);
			setShowNotificationDot(true);
		}
	}

	let addNotification = (noti: NotificationStruct) =>
	{
		if (noti.type == NotificationType.friendRequest && !friendRequestArray.find((n: NotificationStruct) => n.id === noti.id))
		{
			friendRequestArray.push(noti);
		}
		else if (noti.type == NotificationType.gameInvite && !gameInviteArray.find((n: NotificationStruct) => n.id === noti.id))
		{
			gameInviteArray.push(noti);
		}
		else if (noti.type == NotificationType.Message || noti.type == NotificationType.groupChat)
		{
			var tmp = messageArray.find((n: NotificationStruct) => n.senderName === noti.senderName);
			if (tmp != undefined)
			{
				var tmparr = messageArray.filter((item: NotificationStruct) => item !== tmp);
				tmparr.push(noti);
				setMessageArray(tmparr);
				setShowNotificationDot(true);
				return ;
			}
			else
				messageArray.push(noti);
		}
		setFriendRequestArray(friendRequestArray);
		setMessageArray(messageArray);
		setGameInviteArray(gameInviteArray);
		setShowNotificationDot(true);
	}

	useEffect(() => 
	{
		socket.on('sendNoti', (noti: NotificationStruct) =>
		{
			if (noti != null)
			{
				addNotification(noti);
			}
		});
	}, [messageArray, friendRequestArray, gameInviteArray]);

	let notificationWrapper = () =>
	{
		if (isFirst)
		{
			setIsFirst(false);
			socket.emit('getFromUser', { id: user.id.toString() });
			socket.on('getAllNotifications', (notifications: NotificationStruct[]) => 
			{
				handleNotifications(notifications);
				return (notificationBar());
			});
		}

		socket.on('goToGame', navToGame);

		return (notificationBar());
	}

	return (
		notificationWrapper()
  	);
};

export default Notification;