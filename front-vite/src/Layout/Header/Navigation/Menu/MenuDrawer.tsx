import React, { useState } from 'react';
import {
	IconButton,
	Box,
	List,
	Divider,
	ListItem,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
	ReorderRounded as ReorderRoundedIcon,
	Home as HomeIcon,
	SportsEsports as GameIcon,
	AccountCircle as AccountCircleIcon,
	Settings as SettingsIcon,
	Logout as LogoutIcon,
	Tag as TagIcon,
	Person as PersonIcon,
	Leaderboard as LeaderboardIcon,
} from '@mui/icons-material';
import { useUser } from '../../../../Providers/UserContext/User';
import {
	StyledIconWrapper,
	StyledListItemButton,
	DrawerContainer,
	Drawer
} from '../../DrawerList/DrawerComponents';

interface PathItem {
	path: string;
	icon: React.ReactElement;
}

export const MenuDrawer: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();
	const theme = useTheme();
	const { user } = useUser();

	const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
		if (
			event.type === 'keydown' &&
			((event as React.KeyboardEvent).key === 'Tab' ||
				(event as React.KeyboardEvent).key === 'Shift')
		) {
			return;
		}
		setIsOpen(open);
	};

	const generalPaths: Record<string, PathItem> = {
		Home: { path: '/', icon: <HomeIcon /> },
		Game: { path: '/game', icon: <GameIcon /> },
		Channels: { path: '/channels', icon: <TagIcon /> },
		Users: { path: '/viewusers', icon: <PersonIcon /> },
		Leaderboard: { path: '/leaderboard', icon: <LeaderboardIcon /> },
	};

	const onlinePaths: Record<string, PathItem> = {
		Profile: { path: `/profile/${user.id}`, icon: <AccountCircleIcon /> },
		Logout: { path: '/logout', icon: <LogoutIcon /> },
	};

	const handleNavigation = (path: string) => () => {
		navigate(path);
		setIsOpen(false);
	};

	const DrawerList = (
		<DrawerContainer
			role='presentation'
			onClick={toggleDrawer(false)}
			onKeyDown={toggleDrawer(false)}
		>
			<List>
				{Object.keys(generalPaths).map((text) => (
					<ListItem key={text} disablePadding>
						<StyledListItemButton onClick={handleNavigation(generalPaths[text].path)}>
							<ListItemIcon>
								<StyledIconWrapper>{generalPaths[text].icon}</StyledIconWrapper>
							</ListItemIcon>
							<ListItemText primary={text} />
						</StyledListItemButton>
					</ListItem>
				))}
			</List>
			<Divider />
			<List>
				{Object.keys(onlinePaths).map((text) => (
					<ListItem key={text} disablePadding>
						<StyledListItemButton onClick={handleNavigation(onlinePaths[text].path)}>
							<ListItemIcon>
								<StyledIconWrapper>{onlinePaths[text].icon}</StyledIconWrapper>
							</ListItemIcon>
							<ListItemText primary={text} />
						</StyledListItemButton>
					</ListItem>
				))}
			</List>
		</DrawerContainer>
	);

	return (
		<Box alignContent={'center'}>
			<IconButton
				onClick={() => {
					setIsOpen(true);
				}}
			>
				<ReorderRoundedIcon sx={{ color: theme.palette.secondary.main }} />
			</IconButton>
			<Drawer open={isOpen} onClose={toggleDrawer(false)}>
				{DrawerList}
			</Drawer>
		</Box>
	);
};

export default MenuDrawer;
