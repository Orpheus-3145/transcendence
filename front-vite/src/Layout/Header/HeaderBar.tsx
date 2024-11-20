import React from 'react';
import { MenuDrawer } from './Navigation/Menu/MenuDrawer';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useUser } from '../../Providers/UserContext/User';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import ContactsIcon from '@mui/icons-material/Contacts';
import {  Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';

export const Bar: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();  
  const [open, setOpen] = useState<Boolean>(false);
  let [notificationDot, setnotificationDot] = useState<Boolean>(false);

  const navToProfile = () => { user && user.id && navigate(`/profile/${user.id}`) }
  const navToAll = () => {navigate('/viewusers')}
  const toggleDrawer = (newOpen: boolean) => () => {setOpen(newOpen)};

	let getNotificationMessages = () =>
	{
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
				width={300}
			>
				<Stack
					sx={{
						position: 'relative',
						left: '60px',
					}}
				>
					<Typography variant="h4"
						sx={{		
							color: '#f8d213',
						}}
					>
						Notifications
					</Typography>
				</Stack>
				<br />
				<Box>
					<Typography variant="h5"
						sx={{		
							fontFamily: 'Georgia, serif',
							color: '#f8d213',
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
							fontFamily: 'Georgia, serif',
							color: '#f8d213',
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
							'&:hover': {
							color: '#f8d213',
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
							left: '20px',
							top: '-35px',
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

	let viewUsersWrapper = () =>
	{
		let top = '0px';
		if (notificationDot)
			top = '-6px';

		return (
			<Tooltip title="View Users!" arrow>
				<IconButton
					onClick={navToAll}
					sx={{
						position: 'relative',
						top: top,
						'&:hover': {
						color: '#0c31df',
						},
					}}
				>
					<ContactsIcon />
				</IconButton>
          </Tooltip>
		);
	}

	let viewProfileWrapper = () =>
	{
		return (
			<IconButton
				onClick={navToProfile}
				sx={{
					p: 0,
					border: '1px solid transparent',
					borderRadius: '50%',
					overflow: 'hidden',
					height: '100%',
					width: 'auto',
					'&:hover': {
					'& img': {
						transform: 'scale(1.2)',
						transition: 'transform 0.3s ease',
					},
					},
					'& img': {
					width: '100%',
					height: '100%',
					float: 'right',
					transition: 'transform 0.3s ease',
					},
				}}
			>
			{user && user.image ? (
				<img
					src={user.image}
					alt="User"
					style={{
						display: 'block',
					}}
				/>
				) : (
					<AccountBoxIcon sx={{ color: theme.palette.secondary.main }} />
				)}
			</IconButton>
		);
	}


	return (
		<Box
		alignContent='center'
		>
			<Stack
				zIndex='1'
				bgcolor={theme.palette.primary.dark}
				justifyContent='space-between'
				alignContent='center'
				position='fixed'
				paddingY='0.1em'
				paddingX='0.5em'
				direction='row'
				width='100%'
				height='3em'
				borderBottom={`0.1em outset ${theme.palette.divider}`}
			>
				<MenuDrawer />
				<Box
					sx={{
						position: 'fixed',
						left: '50%',
						transform: 'translateX(-50%)',
						display: 'flex',
						gap: '20px',
						justifyContent: 'center',
					}}
				>
					{viewUsersWrapper()}
					{notificationWrapper()}
				</Box>
				{viewProfileWrapper()}
			</Stack>
		</Box>
  	);
};

export default Bar;
