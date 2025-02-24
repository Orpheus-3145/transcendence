import React from 'react';
import { useState, useEffect } from 'react';
import { MenuDrawer } from './Navigation/Menu/MenuDrawer';
import {Notification} from './Notification/index'
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useUser } from '../../Providers/UserContext/User';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import ContactsIcon from '@mui/icons-material/Contacts';
import {  Tooltip } from '@mui/material';
import Leaderboard from '../../Pages/Leaderboard';
import GroupsIcon from '@mui/icons-material/Groups';

export const Bar: React.FC = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const theme = useTheme();
	// const [showNotificationDot, setShowNotificationDot] = useState<Boolean>(false);

	const navToProfile = () => { user && user.id && navigate(`/profile/${user.id}`) }
	const navToAll = () => {navigate('/viewusers')}
	const navToLeaderboard = () => {navigate('/leaderboard')}


	let viewUsersWrapper = () =>
	{
		return (
			<Tooltip title="View Users!" arrow>
				<IconButton
					onClick={() => navToAll()}
					sx={{
						position: 'absolute',
						left: '-80px',
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

	let leaderboardWrapper = () =>
	{
		return (
			<Tooltip title="View Leaderboard!" arrow>
				<IconButton
					onClick={() => navToLeaderboard()}
					sx={{
						position: 'absolute',
						left: '-25px',
						'&:hover': {
						color: '#0c31df',
						},
					}}
				>
					<GroupsIcon />
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
						width: '50px',
						height: '50px',
					}}
				/>
				) : (
					<AccountBoxIcon sx={{ color: theme.palette.secondary.main }} />
				)}
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
						{leaderboardWrapper()}
						<Notification />
					</Box>
					{viewProfileWrapper()}
				</Stack>
			</Box>
		);
	}
	
	let pageWrapper = () =>
	{
		return (headerBar());
	}

	return (
		pageWrapper()
  	);
};

export default Bar;
