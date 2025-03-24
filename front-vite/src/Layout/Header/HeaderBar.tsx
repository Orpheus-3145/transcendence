import React, { useEffect, useState } from 'react';
import { MenuDrawer } from './Navigation/Menu/MenuDrawer';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useUser } from '../../Providers/UserContext/User';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Notification } from './Notification/index'
import { socket } from '../../Providers/NotificationContext/Notification';

export const Bar: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const theme = useTheme();
	const [image, setImage] = useState<string>("");

	const navToProfile = () => { user && user.id && navigate(`/profile/${user.id}`) }

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
				<img
					src={image}
					alt="User"
					style={{
						display: 'block',
						width: '50px',
						height: '50px',
					}}
				/>
			</IconButton>
		);
	}

	let headerBar = () =>
	{
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
					<Box display='flex' flexDirection='row'>
						<Notification />
						{viewProfileWrapper()}
					</Box>
				</Stack>
			</Box>
		);
	}
	
	useEffect(() =>
	{
		if (user && user.image)
			setImage(user.image)

		socket.on('updateHeaderImage', (image: string) =>
		{
			setImage(image);
		});

	}, [])

	let pageWrapper = () =>
	{
		return (headerBar());
	}

	return (
		pageWrapper()
	);
};

export default Bar;
