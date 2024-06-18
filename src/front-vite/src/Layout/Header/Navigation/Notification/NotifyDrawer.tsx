import React, { useState } from 'react';
import {
  IconButton,
  Box,
  Drawer as MuiDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  darken
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
  Notifications as NotificationsIcon,
  Chat as ChatIcon,
  SportsEsports as GameIcon,
  Check as AcceptIcon,
  Clear as DeclineIcon
} from '@mui/icons-material';

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

interface PlaceholderUser {
  username: string | null;
  isAuthenticated: boolean;
}

export const NotifyDrawer: React.FC<{ user: PlaceholderUser }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  // From backend I need to ask for unanswered notifications for the user.
  const generalPaths: Record<string, PathItem> = {
    Chat: { path: '/chat/:chatId', icon: <ChatIcon /> },
    Game: { path: '/game/:gameId', icon: <GameIcon /> },
  };

  const handleNavigation = (path: string) => () => {
    navigate(path);
    setIsOpen(false);
  };

  // Need to update:
  //  when pressed on accept, according to type of notification:
  //    open the chat box
  //    go to game url
  const DrawerList = (
    <DrawerContainer role="notification" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <List>
        {Object.keys(generalPaths).map((text) => (
          <ListItem key={text} disablePadding>
            <Box width="100%" p={1} mb={2} borderRadius={1} bgcolor={alpha(theme.palette.background.default, 0.1)}>
              <ListItemIcon> {generalPaths[text].icon} </ListItemIcon>
              <ListItemText primary={`"${user.username}" wants to ${text}`} />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AcceptIcon />}
                  onClick={handleNavigation(generalPaths[text].path)}
                >
                  Accept
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeclineIcon />}
                >
                  Decline
                </Button>
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </DrawerContainer>
  );

  return (
    <>
      <IconButton onClick={toggleDrawer(true)}>
          <NotificationsIcon sx={{ color: theme.palette.secondary.main }} />
      </IconButton>
      <Drawer anchor='right' open={isOpen} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
};

export default NotifyDrawer;
