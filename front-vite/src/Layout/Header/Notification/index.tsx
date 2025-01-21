import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useUser } from '../../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {  Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClearIcon from '@mui/icons-material/Clear';
import {NotificationStruct, 
		getUserNotifications, 
		removeNotificationDb, 
		acceptFriendRequest, 
		declineFriendRequest,
		acceptGameInvite, 
		declineGameInvite,
		NotificationType,
		NotificationStatus,
		socket} from '../../../Providers/NotificationContext/Notification'
import { posix } from 'path';

export const Notification: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const theme = useTheme();  
	const [openDrawer, setOpenDrawer] = useState<Boolean>(false);
	const [showNotificationDot, setShowNotificationDot] = useState<Boolean>(false);
	const [messageArray, setMessageArray] = useState<NotificationStruct[] | null>(null);
	const [friendRequestArray, setFriendRequestArray] = useState<NotificationStruct[] | null>(null);
	const [gameInviteArray, setGameInviteArray] = useState<NotificationStruct[] | null>(null);

	const toggleDrawer = (newOpen: boolean) => () => {setOpenDrawer(newOpen)};
	const navToUser = (id:string) => {navigate('/profile/' + id)}


	let removeNotification = (noti: NotificationStruct) =>
	{
		removeNotificationDb(noti.id.toString());
	}

	let initMessage = (noti: NotificationStruct) =>
	{
		var notiMessage = noti.message;
		if (noti.message?.length > 23)
		{
			notiMessage = noti.message?.slice(0, 23) + "...";
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
					}}
				>
					<Tooltip title="Clear Notification" arrow>
						<IconButton 
							variant="contained" 
							component="label"
							onClick={() => removeNotification(noti)}
							sx={{
								left: '190px',
								top: '-30px',
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
					<Typography variant={'h1'}
						sx={{
							position: 'relative',
							top: '-10px',
							fontSize: '0.9rem',
						}}    
					>
						<a href="" onClick={() => navToUser(noti.senderId.toString())} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>{noti.senderName}</a>
						send you a message:
						<br />
						{notiMessage}
					</Typography>
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
				{messageArray.map((item: NotificationStruct) => initMessage(item))}
			</Stack>
		);
	}

	let pressAcceptRequest = (noti: NotificationStruct) =>
	{
		if (noti.type == NotificationType.friendRequest)
			acceptFriendRequest(noti.senderId.toString(), noti.receiverId.toString());
		else if (noti.type == NotificationType.gameInvite)
			acceptGameInvite(noti.senderId.toString(), noti.receiverId.toString());
	}

	let pressDeclineRequest = (noti: NotificationStruct) =>
	{		
		if (noti.type == NotificationType.friendRequest)
			declineFriendRequest(noti.senderId.toString(), noti.receiverId.toString());
		else if (noti.type == NotificationType.gameInvite)
			declineGameInvite(noti.senderId.toString(), noti.receiverId.toString());
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
					}}
				>
					<Tooltip title="Clear Notification" arrow>
						<IconButton 
							variant="contained" 
							component="label"
							onClick={() => removeNotification(noti)}
							sx={{
								left: '240px',
								top: '-30px',
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
					<Typography variant={'h1'}
						sx={{
							position: 'relative',
							top: '-20px',
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
							left: '25px',
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
				{friendRequestArray.map((item: NotificationStruct) => initRequest(item))}
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
				{gameInviteArray.map((item: NotificationStruct) => initRequest(item))}
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
				}}
				width={'350px'}
				minHeight={'600px'}
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

	let notificationBar = () =>
	{
		return (
			<Stack>
				<Tooltip title="Notifications" arrow>
					<IconButton
						onClick={toggleDrawer(true)}
						sx={{
							position: 'absolute',
							left: '30px',
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

	// let getNotificationUser = async () : Promise<void> =>
	// {
	// 	let arr = await getUserNotifications(user);
	// 	if (arr?.length === 0)
	// 	{
	// 		setShowNotificationDot(false);
	// 		setFriendRequestArray(null);
	// 		setMessageArray(null);
	// 		setGameInviteArray(null);
	// 		setShowNotificationDot(false);
	// 	}
	// 	else
	// 	{
	// 		var friendsArr: NotificationStruct[]  = [];
	// 		var messageArr: NotificationStruct[]  = [];
	// 		var gameArr: NotificationStruct[]  = [];
	// 		arr?.map((item: NotificationStruct) =>
	// 		{
	// 			if (item.type == NotificationType.Message)
	// 			{
	// 				messageArr.push(item);
	// 			}
	// 			else if (item.type == NotificationType.friendRequest)
	// 			{
	// 				friendsArr.push(item);
	// 			}
	// 			else if (item.type == NotificationType.gameInvite)
	// 			{
	// 				gameArr.push(item);
	// 			}
	// 		}
	// 		)
	// 		setFriendRequestArray(friendsArr);
	// 		setMessageArray(messageArr);
	// 		setGameInviteArray(gameArr);
	// 		setShowNotificationDot(true);
	// 	}
	// }

  	// let notificationWrapper = () =>
  	// {
	// 	useEffect(() => 
	// 	{
	// 		getNotificationUser();
		
	// 	}, [friendRequestArray, gameInviteArray, messageArray, showNotificationDot, openDrawer]);

	// 	return (notificationBar());
  	// }

	let notificationWrapper = () =>
	{
		const handleNotifications = (arr: NotificationStruct[]) => 
		{
			if (arr?.length === 0)
			{
				setShowNotificationDot(false);
				setFriendRequestArray(null);
				setMessageArray(null);
				setGameInviteArray(null);
				setShowNotificationDot(false);
			}
			else
			{
				var friendsArr: NotificationStruct[]  = [];
				var messageArr: NotificationStruct[]  = [];
				var gameArr: NotificationStruct[]  = [];
				arr?.map((item: NotificationStruct) =>
				{
					if (item.type == NotificationType.Message)
					{
						messageArr.push(item);
					}
					else if (item.type == NotificationType.friendRequest)
					{
						friendsArr.push(item);
					}
					else if (item.type == NotificationType.gameInvite)
					{
						gameArr.push(item);
					}
				})
				setFriendRequestArray(friendsArr);
				setMessageArray(messageArr);
				setGameInviteArray(gameArr);
				setShowNotificationDot(true);
			}
		}
		
		 useEffect(() => 
		{
			socket.on('getNotifications', (notifications: NotificationStruct[]) => 
			{
				handleNotifications(notifications);
			});
		
			getUserNotifications(user);

		  }, [friendRequestArray, gameInviteArray, messageArray, showNotificationDot, openDrawer]);

		  return (notificationBar());
	}

	return (
		notificationWrapper()
  	);
};

export default Notification;