import React from 'react';
import { ChatProps, ChatStatus, ChatRoom } from './InterfaceChat';
import { Box, Drawer, Divider, Stack, IconButton, InputBase, Typography } from '@mui/material';
import { darken, alpha, useTheme } from '@mui/material/styles';
import { Add as AddIcon, Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';

interface ContentDrawerProps {
  chatProps: ChatProps;
  setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

const ContentDrawer: React.FC<ContentDrawerProps> = ({ chatProps, setChatProps }) => {
  const theme = useTheme();

  const toggleChatStatus = (status: ChatStatus, selection: ChatRoom | null) => {
    setChatProps({ ...chatProps, chatStatus: status, selected: selection });
  };

  const handleSearchClick = () => {
    if (chatProps.searchPrompt == '') {
      setChatProps({ ...chatProps, searchPrompt: 'Search...' });
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChatProps({ ...chatProps, searchPrompt: event.target.value });
    console.log('Search Prompt onChange activated: ', chatProps.searchPrompt);
  };

  const DrawerContent = (
    <Stack width={250} role="chatrooms" direction="column"
      sx={{
        width: 250,
        backgroundColor: alpha(theme.palette.background.default, 0.05),
        '&:hover': {
          backgroundColor: alpha(theme.palette.background.default, 0.1),
        },
        '& > *': {
          alignItems: 'center',
          height: '3em',
          color: theme.palette.secondary.main,
          marginY: '0.3em',
          boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.2)`,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          transition: 'border-radius 0.2s ease, boxShadow 0.2s ease',
          '&:hover': {
            boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 1)`,
            backgroundColor: alpha(theme.palette.background.default, 0.9),
            borderRadius: '2em',
          },
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
      >
        <IconButton sx={{ color: theme.palette.secondary.main }} edge="start" onClick={handleSearchClick} aria-label="search">
          <AddIcon />
        </IconButton>
        <Divider sx={{ marginY: '0.3em' }} orientation="vertical" flexItem />
        <InputBase value={chatProps.searchPrompt} onChange={handleInputChange} sx={{ marginLeft: '8px', color: theme.palette.secondary.main }} placeholder="Search..." />
      </Stack>
      <Box sx={{ height: '0', color: 'transparent', bgcolor: 'transparent' }}>
        <Divider orientation="horizontal" />
      </Box>
      {chatProps.chatRooms.map((chatRoom, index) => (
        <Stack key={index} direction={'row'} onClick={() => toggleChatStatus(ChatStatus.Chatbox, chatRoom)}
          sx={{
            cursor: 'pointer',
            justifyContent: 'space-between',
            paddingX: '1em',
            alignItems: 'center',
          }}
        >
          <Stack direction={'row'} spacing={2} alignContent='center' alignItems={'center'} marginY={theme.spacing(.5)}>
            {chatRoom.icon}
            <Typography sx={{ '&:hover': { color: theme.palette.secondary.dark } }}>
              {chatRoom.name}
            </Typography>
          </Stack>
          <Stack direction={'row'} spacing={2} alignContent='center' alignItems={'center'} marginY={theme.spacing(.5)}>
            <Stack onClick={(event) => { event.stopPropagation(); toggleChatStatus(ChatStatus.Settings, chatRoom); }}
              sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.secondary.dark } }}
            >
              <SettingsIcon />
            </Stack>
            <Stack onClick={(event) => { event.stopPropagation(); toggleChatStatus(ChatStatus.Bubble, null); }}
              sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.error.dark } }}
            >
              <LogoutIcon />
            </Stack>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );

  const handleClose = () => {
    if (chatProps.selected == null)
      toggleChatStatus(ChatStatus.Bubble, null);
  }

  return (
    <Drawer
      anchor="right"
      open={chatProps.chatStatus == ChatStatus.Drawer}
      onClose={handleClose}
      sx={{ '& .MuiPaper-root': { backgroundColor: darken(theme.palette.background.default, 0.3) } }}
    >
      {DrawerContent}
    </Drawer>
  );
};

export default ContentDrawer;