import React, { useState } from 'react';
import {
  IconButton,
  Box,
  Drawer as MuiDrawer,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  darken
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
  ReorderRounded as ReorderRoundedIcon,
  Home as HomeIcon,
  SportsEsports as GameIcon,
  Login as LoginIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { useUser } from '../../../../Providers/UserContext/User';

const StyledIconWrapper = styled('div')(({ theme }) => ({
  boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.05)`,
  color: theme.palette.secondary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-radius 0.3s ease',
  '&:hover': {
    boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.3)`,
    borderRadius: '2em',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.05)`,
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  color: theme.palette.secondary.main,
  transition: 'border-radius 0.2s ease',
  marginTop: theme.spacing(0.5),
  '&:hover': {
    boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.1)`,
    backgroundColor: alpha(theme.palette.background.default, 0.9),
    borderRadius: '2em',
  },
}));

const DrawerContainer = styled(Box)(({ theme }) => ({
  width: 250,
  backgroundColor: alpha(theme.palette.background.default, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.default, 0.1),
  },
  height: '100%',
}));

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: darken(theme.palette.background.default, 0.3),
  },
}));

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
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  const generalPaths: Record<string, PathItem> = {
    Home: { path: '/', icon: <HomeIcon /> },
    Game: { path: '/game', icon: <GameIcon /> },
    Channels: { path: '/channels', icon: <TagIcon />},
  };

  const onlinePaths: Record<string, PathItem> = {
    Profile: { path: `/profile/${user.id}`, icon: <AccountCircleIcon /> },
    Settings: { path: '/profile/settings', icon: <SettingsIcon /> },
    Logout: { path: '/logout', icon: <LogoutIcon /> },
  };

  const handleNavigation = (path: string) => () => {
    navigate(path);
    setIsOpen(false);
  };

  const DrawerList = (
    <DrawerContainer role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
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
        {(Object.keys(onlinePaths)).map((text) => (
          <ListItem key={text} disablePadding>
            <StyledListItemButton onClick={handleNavigation((onlinePaths)[text].path)}>
              <ListItemIcon>
                <StyledIconWrapper>{( onlinePaths )[text].icon}</StyledIconWrapper>
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
      <IconButton onClick={() => {setIsOpen(true)}}>
          <ReorderRoundedIcon sx={{ color: theme.palette.secondary.main }} />
      </IconButton>
      <Drawer open={isOpen} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </Box>
  );
};

export default MenuDrawer;
