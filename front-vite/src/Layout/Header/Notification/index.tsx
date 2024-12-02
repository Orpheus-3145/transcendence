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
		NotificationType} from '../../../Providers/NotificationContext/Notification'

export const Notification: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const theme = useTheme();  
	const [openDrawer, setOpenDrawer] = useState<Boolean>(false);
	const [notificationDot, setNotificationDot] = useState<Boolean>(false);
	const [messageArray, setMessageArray] = useState<NotificationStruct[] | null>(null);
	const [friendRequestArray, setFriendRequestArray] = useState<NotificationStruct[] | null>(null);
	const [gameInviteArray, setGameInviteArray] = useState<NotificationStruct[] | null>(null);
	const [notificationNumber, setNotificationNumber] = useState<number | null>(null);

	const toggleDrawer = (newOpen: boolean) => () => {setOpenDrawer(newOpen)};
	const navToUser = (id:string) => {navigate('/profile/' + id)}


	let removeNotification = (noti: NotificationStruct) =>
	{
		removeNotificationDb(noti.id.toString());
	}

	let initMessageNotification = (noti: NotificationStruct) =>
	{
		var notiMessage = noti.message;
		if (noti.message?.length > 15)
		{
			notiMessage = noti.message?.slice(0, 15) + "...";
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
						borderColor: 'blue', 
						borderRadius: '16px',
						backgroundColor: '#2c2c2c',
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
									color: theme.palette.error.main,
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

	let getNotificationMessages = () =>
	{
		if (messageArray == null)
		{
			return (
				<Typography
					sx={{
						position: 'relative',
						left: '50px',
					color: 'green',
					}}
				>	
					<br />
					You have no incoming messages!
				</Typography>
			);
		}
		
		return (
			<Stack>
				{messageArray.map((item: NotificationStruct) => initMessageNotification(item))}
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

	let initRequestNotification = (noti: NotificationStruct) =>
	{
		var message = "has sent you a friend request!";
		if (noti.type == NotificationType.gameInvite)
			message = "has sent you a game invite!"; 

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
						borderColor: 'blue', 
						borderRadius: '16px',
						backgroundColor: '#2c2c2c',
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
									color: theme.palette.error.main,
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
							left: '30px',
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

	let getNotificationFrRequests = () =>
	{
		if (friendRequestArray == null)
		{
			return (
				<Typography
				sx={{
					position: 'relative',
					left: '35px',
					color: 'green',
				}}
				>
					<br />
					You have no incoming friend requests!
				</Typography>
			);
		}
	
		return (
			<Stack>
				{friendRequestArray.map((item: NotificationStruct) => initRequestNotification(item))}
			</Stack>
		);
	}

	let getGameInvites = () =>
	{
		if (gameInviteArray == null)
			{
				return (
					<Typography
					sx={{
						position: 'relative',
						left: '45px',
						color: 'green',
					}}
					>
						<br />
						You have no incoming game invites!
					</Typography>
				);
			}
		
			return (
				<Stack>
					{gameInviteArray.map((item: NotificationStruct) => initRequestNotification(item))}
				</Stack>
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
			>
				<Stack
					sx={{
						position: 'relative',
						left: '70px',
					}}
				>
					<Typography variant="h4"
						sx={{	
							color: theme.palette.secondary.main,
						}}
					>
						Notifications
					</Typography>
				</Stack>
				<br />
				<Box>
					<Typography variant="h5"
						sx={{	
							position: 'relative',
							left: '120px',	
							fontFamily: 'Georgia, serif',
							color: theme.palette.secondary.main,
						}}
					>
						Messages:
					</Typography>
					{getNotificationMessages()}

					<br />
					<Divider />
					<br />

					<Typography variant="h5"
						sx={{
							position: 'relative',
							left: '85px',	
							fontFamily: 'Georgia, serif',
							color: theme.palette.secondary.main,
						}}
					>
						Friend Requests:
					</Typography>
					{getNotificationFrRequests()}

					<br />
					<Divider />
					<br />

					<Typography variant="h5"
						sx={{
							position: 'relative',
							left: '100px',	
							fontFamily: 'Georgia, serif',
							color: theme.palette.secondary.main,
						}}
					>
						Game Invites:
					</Typography>
					{getGameInvites()}
				</Box>
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
							left: '30px',
							'&:hover': {
								color: 'orange',
							},
						}}
					>
						<NotificationsIcon />
					</IconButton>
				</Tooltip>
				{notificationDot && (
					<Box
						sx={{
							width: 12,
							height: 12,
							backgroundColor: 'red',
							borderRadius: '50%',
							position: 'relative',
							left: '60px',
							top: '-30px',
						}}
					/>
				)}
				<Drawer
					anchor={'right'}
					open={openDrawer} 
					onClose={toggleDrawer(false)}
				>
					{DrawerList()}
				</Drawer>
			</Stack>
		);
	}

	let getNotificationUser = async () : Promise<void> =>
	{
		let arr = await getUserNotifications(user);
		if (arr?.length === 0)
		{
			setNotificationDot(false);
			setFriendRequestArray(null);
			setMessageArray(null);
			setGameInviteArray(null);
		}
		else
		{
			var friendsArr: NotificationStruct[] | null = null;
			var messageArr: NotificationStruct[] | null = null;
			var gameArr: NotificationStruct[] | null = null;
			arr?.map((item: NotificationStruct) =>
			{
				if (item.type == NotificationType.Message)
				{
					if (messageArr == null)
					{
						messageArr = [];
					}
					messageArr.push(item);
				}
				else if (item.type == NotificationType.friendRequest)
				{
					if (friendsArr == null)
					{
						friendsArr = [];
					}
					friendsArr.push(item);
				}
				else if (item.type == NotificationType.gameInvite)
				{
					if (gameArr == null)
					{
						gameArr = [];
					}
					gameArr.push(item);
				}
			}
			)
			setFriendRequestArray(friendsArr);
			setMessageArray(messageArr);
			setGameInviteArray(gameArr);
		}
	}

  	let notificationWrapper = () =>
  	{
		useEffect(() => 
		{
			getNotificationUser().then((number) => 
			{
				setNotificationNumber(number);
			});

			if ((friendRequestArray == null) && (gameInviteArray == null) && (messageArray == null))
				setNotificationDot(false);
			else if ((friendRequestArray != null) || (gameInviteArray != null) || (messageArray != null))
				setNotificationDot(true);
		
		}, [friendRequestArray, gameInviteArray, messageArray, notificationDot, openDrawer]);

		if (notificationNumber === null) 
			return <Stack>Loading...</Stack>;

		return (notificationBar());
  	}

	return (
		notificationWrapper()
  	);
};

export default Notification;