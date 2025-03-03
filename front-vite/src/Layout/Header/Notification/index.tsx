import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useUser } from '../../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {  Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useContext } from 'react';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
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
						p: 5, 
						border: 1, 
						borderWidth: '4px', 
						borderColor: theme.palette.secondary.dark, 
						borderRadius: '16px',
						backgroundColor: 'black',
						width: '270px',
						position: 'relative',
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
					sx={{
						position: 'relative',
						left: '45px',
						top :'5px',
						width: 260,
						height: 40,
						borderRadius: 1,
						bgcolor: 'black',
					}}
				>
					<Typography
						sx={{
							position: 'relative',
							left: '10px',
							top: '-15px',
							color: 'green',
						}}
					>	
						<br />
						You have no incoming messages!
					</Typography>
				</Box>
			);
		}
		
		return (
			<Stack>
				<br />
				{messageArray.slice().reverse().map((item: NotificationStruct) => initMessage(item))}
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
						p: 5, 
						border: 1, 
						borderWidth: '4px', 
						borderColor: theme.palette.secondary.dark, 
						borderRadius: '16px',
						backgroundColor: 'black',
						width: '300px',
						height: '150px',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						textAlign: 'center',
					}}
				>
					<Typography variant={'h1'}
						sx={{
							position: 'relative',
							top: '-10px',
							fontSize: '0.9rem',
						}}    
					>
						<a href="" onClick={() => navToUser('/profile/' + noti.senderId.toString())} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>{noti.senderName}</a>
						{message}
					</Typography>
					<ButtonGroup 
						variant="contained"
						sx={{
							position: 'relative',
							top: '10px',
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
					sx={{
						position: 'relative',
						left: '23px',
						top :'5px',
						width: 300,
						height: 40,
						borderRadius: 1,
						bgcolor: 'black',
					}}
				>
					<Typography
						sx={{
							position: 'relative',
							left: '13px',
							top: '-15px',
							color: 'green',
						}}
					>
						<br />
						You have no incoming friend requests!
					</Typography>
				</Box>
			);
		}
	
		return (
			<Stack>
				<br />
				{friendRequestArray.slice().reverse().map((item: NotificationStruct) => initRequest(item))}
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
						sx={{
							position: 'relative',
							left: '33px',
							top :'5px',
							width: 280,
							height: 40,
							borderRadius: 1,
							bgcolor: 'black',
						}}
					>
						<Typography
							sx={{
								position: 'relative',
								left: '10px',
								top: '-15px',
								color: 'green',
							}}
						>
							<br />
							You have no incoming game invites!
						</Typography>
					</Box>
				);
			}

		return (
			<Stack>
				<br />
				{gameInviteArray.slice().reverse().map((item: NotificationStruct) => initRequest(item))}
			</Stack>
		);		
	}

	let messageBox = () =>
	{
		return (
			<Box
				component="section"         
				sx={{
					position: 'relative',
					left: '100px',
					width: 140,
					height: 40,
					borderRadius: 1,
					bgcolor: 'black',
				}}
			>
				<Typography variant="h5"
					sx={{	
						position: 'relative',
						left: '20px',
						top: '2px',
						fontFamily: 'Georgia, serif',
						color: theme.palette.secondary.main,
					}}
				>
					Messages:
				</Typography>
			</Box>
		);
	}

	let friendReqBox = () =>
	{
		return (
			<Box
				component="section"
				sx={{
					position: 'relative',
					left: '63px',
					width: 220,
					height: 40,
					borderRadius: 1,
					bgcolor: 'black',
				}}
			>	
				<Typography variant="h5"
					sx={{
						position: 'relative',
						left: '32px',
						top: '2px',	
						fontFamily: 'Georgia, serif',
						color: theme.palette.secondary.main,
					}}
				>
					Friend Requests:
				</Typography>
			</Box>
		);
	}

	let gameReqBox = () =>
	{
		return (
			<Box
				component="section"         
				sx={{
					position: 'relative',
					left: '73px',
					width: 200,
					height: 40,
					borderRadius: 1,
					bgcolor: 'black',
				}}
			>
				<Typography variant="h5"
					sx={{
						position: 'relative',
						left: '35px',
						top: '2px',
						fontFamily: 'Georgia, serif',
						color: theme.palette.secondary.main,
					}}
				>
					Game Invites:
				</Typography>
			</Box>
		);
	}

	let DrawerList = () =>
	{
		return (
			<Stack
				style={{
					overflowX: 'hidden',
					overflowY: 'auto',
				}}
				width={'350px'}
				minHeight={'1000px'}
			>
				<Box 
					component="section"
					sx={{
						position: 'relative',
						left: '56px',
						top: '10px',
						width: 220,
						height: 50,
						borderRadius: 1,
						bgcolor: 'black',
					}}
				>
					<Typography variant="h4"
						sx={{	
							color: theme.palette.secondary.main,
							position: 'relative',
							left: '22px',
							top: '3px',
							fontFamily: 'Georgia, serif',
						}}
					>
						Notifications
					</Typography>
				</Box>
				<br />
				{messageBox()}
				{putMessages()}
				<br />
				<Divider />
				<br />
				{friendReqBox()}
				{putFiendRequests()}
				<br />
				<Divider />
				<br />
				{gameReqBox()}
				{putGameInvites()}
			</Stack>
		);
	}

	let openBool = () =>
	{
		setOpenDrawer(true);
		setShowNotificationDot(false);
	}

	let notificationBar = () =>
	{
		var color = 'white';
		if (showNotificationDot)
			color = 'orange';
		return (
			<Stack>
				<Tooltip title="Notifications" arrow>
					<IconButton
						onClick={() => openBool()}
						sx={{
							color: color,
							'&:hover': {
								color: 'orange',
							},
						}}
					>
						<NotificationsIcon />
					</IconButton>
				</Tooltip>
				<Drawer
					anchor={'right'}
					open={openDrawer} 
					onClose={toggleDrawer(false)}
					sx={{color: '#000000'}}
				>
					{DrawerList()}
				</Drawer>
			</Stack>
		);
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
				else if (item.type == NotificationType.gameInvite && !messageArray.find((n: NotificationStruct) => n.id === item.id))
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

	}, [friendRequestArray, messageArray, gameInviteArray]);

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