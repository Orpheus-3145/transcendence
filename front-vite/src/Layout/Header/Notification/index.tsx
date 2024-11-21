import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useUser } from '../../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {  Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClearIcon from '@mui/icons-material/Clear';

export const Notification: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const theme = useTheme();  
	const [open, setOpen] = useState<Boolean>(false);
	let [notificationDot, setnotificationDot] = useState<Boolean>(false);

	const toggleDrawer = (newOpen: boolean) => () => {setOpen(newOpen)};
	const navToUser = (id:string) => {navigate('/profile/' + id)}

	const message = "broeder kom gimma spelen!";

	let removeNotification = () =>
	{
		console.log("haha");
	}

	let initNotification = () =>
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
							onClick={() => removeNotification()}
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
						<a href="" onClick={() => navToUser("3")} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>Broeder</a>
						send you a message:
						<br />
						{message}
					</Typography>
				</Box>
			</Stack>
		);
	}

	let acceptFriendReq = () =>
	{
		console.log("haha");
	}

	let declineFriendReq = () =>
	{
		console.log("nene");
	}

	let initFriendNotification = () =>
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
							onClick={() => removeNotification()}
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
						<a href="" onClick={() => navToUser("3")} style={{marginRight: '4px', color: theme.palette.secondary.main,}}>Broeder</a>
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
							onClick={() => acceptFriendReq()}
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
							onClick={() => declineFriendReq()}
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

	let getNotificationMessages = () =>
	{
		return (initNotification());

		return (
			<Typography
				sx={{
					color: 'green',
				}}
			>	
				You have no incoming messages!
			</Typography>
		);
	}

	let getNotificationFrRequests = () =>
	{
		return (initFriendNotification());

		return (
			<Typography
				sx={{
					color: 'green',
				}}
			>
				You have no incoming friend requests!
			</Typography>
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


  	let notificationWrapper = () =>
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



	return (
		notificationWrapper()
  	);
};

export default Notification;