import React, { useState } from 'react';
import { Box, Fab, Drawer, List, ListItemText, Button, Divider, IconButton, Stack, InputBase, Icon } from '@mui/material';
import { Chat as ChatIcon, Search as SearchIcon, Cancel as CancelIcon, Settings as SettingsIcon, Send as SendIcon } from '@mui/icons-material';
import { darken, alpha, useTheme } from '@mui/material/styles';
import Item from '../../Styles/Test';


interface PathItem {
  path: string;
  icon: React.ReactElement;
}

export const Chat: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const theme = useTheme();

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const openChatBox = () => {
    setIsChatBoxOpen(true);
    setIsDrawerOpen(false);
  };

  const closeChatBox = () => {
    setIsChatBoxOpen(false);
  };

  // From backend I need to ask for current chats for the user.
  const testRooms: Record<string, PathItem> = {
    ChatName: { path: '/chat/:chatId', icon: <ChatIcon /> },
    ChatName2: { path: '/chat/:chatId2', icon: <ChatIcon /> },
  };

  return (
    <>
      {!isChatBoxOpen && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <Fab color="secondary" aria-label="chat" onClick={toggleDrawer}>
            <ChatIcon />
          </Fab>
        </Box>
      )}

      <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: darken(theme.palette.background.default, 0.3),
          },
        }}
      >
        <Box width={250} role="chatrooms"
          sx={{
            backgroundColor: alpha(theme.palette.background.default, 0.05),
            '&:hover': {
              backgroundColor: alpha(theme.palette.background.default, 0.1),
            },
            height: '100%',
          }}
        >
          <List>
            <Item marginX={'4px'}>
              <Stack borderRadius={'1em'} direction='row' alignItems='center' justifyContent={'center'} paddingX={'1em'} bgcolor={theme.palette.background.default}>
                <IconButton sx={{ color: theme.palette.secondary.main }} edge='start' onClick={toggleDrawer}>
                  <SearchIcon />
                </IconButton>
                <Divider orientation="vertical" flexItem />
                <InputBase sx={{ marginLeft: '8px', color: theme.palette.secondary.main }} placeholder='Search...' />
              </Stack>
            </Item>
            <Divider sx={{ marginY: '1px' }} />
            {Object.keys(testRooms).map((key) => (
              <Item margin={'4px'} alignItems={'center'}>
                <Stack
                  spacing={1}
                  onClick={openChatBox}
                  direction={'row'}
                  sx={{
                    minHeight: '48px',
                    color: theme.palette.secondary.main,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingX: '1em',
                    display: 'flex',
                    flexGrow: 1,
                  }}
                >
                  {testRooms[key].icon}
                  <ListItemText primary={key} />
                </Stack>
                <Stack alignItems={'center'} direction={'row'}>
                  <IconButton sx={{
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      color: 'orange'
                    },
                  }}>
                    <SettingsIcon />
                  </IconButton>
                  <IconButton sx={{
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      color: theme.palette.error.main,
                    },
                  }}>
                    <CancelIcon />
                  </IconButton>
                </Stack>
              </Item>
            ))}
          </List>
        </Box>
      </Drawer>

      {isChatBoxOpen && (
        <Box padding={'0.2em'} sx={{ position: 'fixed', border: '1px solid #abc', bottom: 16, right: 16, width: 300, height: 'auto', backgroundColor: theme.palette.background.default, borderRadius: '1em', overflow: 'auto' }}>
          <Stack direction={'column'} justifyContent={'flex-end'}>
            <Stack
              direction={'row'}
              sx={{
                borderTopLeftRadius: '1em',
                borderTopRightRadius: '1em',
                color: theme.palette.secondary.main,
                justifyContent: 'space-between',
                paddingX: '0.9em',
                paddingY: '0.1em',
                bgcolor: theme.palette.background.default,
                flexGrow: 1,
              }}
            >
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <ChatIcon />
                <ListItemText primary={'Chat Name'} />
              </Stack>
              <Stack direction={'row'}>
                <IconButton sx={{
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    color: 'orange'
                  },
                }}>
                  <SettingsIcon />
                </IconButton>
                <IconButton onClick={closeChatBox} sx={{
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    color: theme.palette.error.main,
                  },
                }}>
                  <CancelIcon />
                </IconButton>
              </Stack>
            </Stack>
            <Stack minHeight='15em' direction={'column'} padding={'0.5em'} spacing={1} bgcolor={theme.palette.background.default} border={2} borderColor={theme.palette.divider}>
                  // Here I need to add the chat messages
            </Stack>
            <Stack direction={'row'} justifyContent={'space-between'} padding={'0.1em'} paddingX={'0.5em'} bgcolor={theme.palette.background.default} alignItems={'center'} spacing={1}
              sx={{
                borderBottomLeftRadius: '1em',
                borderBottomRightRadius: '1em',
              }}
            >
              <InputBase
                sx={{
                  flexGrow: 1,
                  color: theme.palette.secondary.main,
                  border: '1px solid #ced4da',
                  padding: '0.5em',
                  borderRadius: '5em',
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.divider,
                  },
                  '&.Mui-focused': {
                    borderColor: theme.palette.divider,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                  },
                }}
                placeholder='Type a message...'
              />
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  borderRadius: '0.8em',
                  minWidth: '40px',
                  minHeight: '40px',
                  width: '40px',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <SendIcon />
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </>
  );
};

export default Chat;