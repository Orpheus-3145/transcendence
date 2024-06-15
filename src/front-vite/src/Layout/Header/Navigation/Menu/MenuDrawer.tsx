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
  Logout as LogoutIcon
} from '@mui/icons-material';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.1)`,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  transition: 'border-radius 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
    borderRadius: '2em',
  },
}));

const StyledIconWrapper = styled('div')(({ theme }) => ({
  boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.05)`,
  color: theme.palette.common.white,
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
  backgroundColor: alpha(theme.palette.primary.light, 0.01),
  color: theme.palette.common.white,
  transition: 'border-radius 0.2s ease',
  '&:hover': {
    boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.1)`,
    backgroundColor: alpha(theme.palette.primary.light, 0.9),
    borderRadius: '2em',
  },
}));

const DrawerContainer = styled(Box)(({ theme }) => ({
  width: 250,
  backgroundColor: alpha(theme.palette.primary.dark, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.1),
  },
  height: '100%',
}));

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: darken(theme.palette.primary.main, 0.3),
  },
}));

interface PathItem {
  path: string;
  icon: React.ReactElement;
}

interface PlaceholderUser {
  username: string | null;
  isAuthenticated: boolean;
}

export const MenuDrawer: React.FC<{ user: PlaceholderUser }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  const generalPaths: Record<string, PathItem> = {
    Home: { path: '/', icon: <HomeIcon /> },
    Game: { path: '/game', icon: <GameIcon /> },
  };

  const offlinePaths: Record<string, PathItem> = {
    Login: { path: '/login', icon: <LoginIcon /> },
  };

  const onlinePaths: Record<string, PathItem> = {
    Profile: { path: `/profile/${user.username}`, icon: <AccountCircleIcon /> },
    Settings: { path: '/settings', icon: <SettingsIcon /> },
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
        {(user.isAuthenticated ? Object.keys(onlinePaths) : Object.keys(offlinePaths)).map((text) => (
          <ListItem key={text} disablePadding>
            <StyledListItemButton onClick={handleNavigation((user.isAuthenticated ? onlinePaths : offlinePaths)[text].path)}>
              <ListItemIcon>
                <StyledIconWrapper>{(user.isAuthenticated ? onlinePaths : offlinePaths)[text].icon}</StyledIconWrapper>
              </ListItemIcon>
              <ListItemText primary={text} />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </DrawerContainer>
  );

  return (
    <>
      <StyledIconButton
        size="medium"
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer(true)}
      >
        <StyledIconWrapper>
          <ReorderRoundedIcon sx={{ color: theme.palette.common.white }} />
        </StyledIconWrapper>
      </StyledIconButton>
      <Drawer open={isOpen} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
};

export default MenuDrawer;
