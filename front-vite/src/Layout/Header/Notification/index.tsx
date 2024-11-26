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
import {NotificationStruct, getUserNotifications, removeNotificationDb, acceptFriendRequest, declineFriendRequest, NotificationType, NotificationStatus} from '../../../Providers/NotificationContext/Notification'

export const Notification: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const theme = useTheme();  
	const [open, setOpen] = useState<Boolean>(false);
	const [notificationDot, setNotificationDot] = useState<Boolean>(false);
	const [messageArray, setMessageArray] = useState<NotificationStruct[] | null>(null);
	const [friendReqArray, setFriendReqArray] = useState<NotificationStruct[] | null>(null);
	const [notificationNumber, setNotificationNumber] = useState<number | null>(null);

	const toggleDrawer = (newOpen: boolean) => () => {setOpen(newOpen)};
	const navToUser = (id:string) => {navigate('/profile/' + id)}


	let removeNotification = (noti: NotificationStruct) =>
	{
		removeNotificationDb(noti.senderId.toString(), noti.receiverId.toString(), noti.type);
	}

	let initMessageNotification = (noti: NotificationStruct) =>
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
						<a href="" onClick={() => navToUser('/profile/' + noti.senderId.toString())} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>{noti.senderName}</a>
						send you a message:
						<br />
						{noti.message}
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

	let acceptFriendReq = (noti: NotificationStruct) =>
	{
		acceptFriendRequest(noti.senderId.toString(), noti.receiverId.toString());
	}

	let declineFriendReq = (noti: NotificationStruct) =>
	{
		declineFriendRequest(noti.senderId.toString(), noti.receiverId.toString());
	}

	let initFriendNotification = (noti: NotificationStruct) =>
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
						has sent you a friend request!
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
							onClick={() => acceptFriendReq(noti)}
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
							onClick={() => declineFriendReq(noti)}
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
		if (friendReqArray == null)
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
				{friendReqArray.map((item: NotificationStruct) => initFriendNotification(item))}
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
							left: '95px',	
							fontFamily: 'Georgia, serif',
							color: theme.palette.secondary.main,
						}}
					>
						Friend Requests:
					</Typography>
					{getNotificationFrRequests()}
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
					open={open} 
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
			setFriendReqArray(null);
			setMessageArray(null);
		}
		else
		{
			var friendsArr: NotificationStruct[] | null = null;
			var messageArr: NotificationStruct[] | null = null;
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
				else if (item.type == NotificationType.FriendReq)
				{
					if (friendsArr == null)
					{
						friendsArr = [];
					}
					friendsArr.push(item);
				}
			}
			)
			setNotificationDot(true);
			setFriendReqArray(friendsArr);
			setMessageArray(messageArr);
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
		}, [friendReqArray, messageArray, notificationDot]);

		if (notificationNumber === null) 
			return <Stack>Loading...</Stack>;

		return (notificationBar());
  	}

	return (
		notificationWrapper()
  	);
};

export default Notification;