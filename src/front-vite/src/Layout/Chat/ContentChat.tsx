import React from 'react';
import { ChatProps, ChatStatus, ChatRoom } from './InterfaceChat';
import { Box, Stack, IconButton, InputBase, Button, ListItemText, Avatar } from '@mui/material';
// import { useTheme } from '@emotion/react';
import { Chat as ChatIcon, Settings as SettingsIcon, Send as SendIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ContentChatProps {
  chatProps: ChatProps;
  setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

const ContentChat: React.FC<ContentChatProps> = ({ chatProps, setChatProps }) => {
  const toggleChatStatus = (status: ChatStatus, selection: ChatRoom | null) => {
    setChatProps({ ...chatProps, chatStatus: status, selected: selection });
  };
  // const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: 'fixed',
        border: '1px solid #abc',
        bottom: 16,
        right: 16,
        width: 300,
        bgcolor: (theme) => theme.palette.background.default,
        borderRadius: '1em',
        maxHeight: '70vh',
        minHeight: '30vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Stack direction={'column'} sx={{ flexGrow: 1, maxHeight: '100%' }}>
        <Stack
          direction={'row'}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            borderTopLeftRadius: '1em',
            borderTopRightRadius: '1em',
            color: (theme) => theme.palette.secondary.main,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingX: '0.9em',
            paddingY: '0.1em',
            bgcolor: (theme) => theme.palette.background.default,
            height: '48px',
          }}
        >
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            {chatProps.selected?.icon || <ChatIcon />}
            <ListItemText primary={chatProps.selected?.name || 'Chat Name'} />
          </Stack>
          <Stack direction={'row'}>
            <IconButton onClick={() => { toggleChatStatus(ChatStatus.Settings, chatProps.selected) }} sx={{
              color: (theme) => theme.palette.secondary.main,
              '&:hover': {
                color: 'orange'
              },
            }}>
              <SettingsIcon />
            </IconButton>
            <IconButton onClick={() => { toggleChatStatus(ChatStatus.Bubble, null) }} sx={{
              color: (theme) => theme.palette.secondary.main,
              '&:hover': {
                color: (theme) => theme.palette.error.main,
              },
            }}>
              <CancelIcon />
            </IconButton>
          </Stack>
        </Stack>
        <Stack direction={'column'} sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '50vh' }}>
          <Stack
            direction="column"
            padding="0.5em"
            spacing={1}
            bgcolor={(theme) => theme.palette.background.default}
            border={2}
            borderColor={(theme) => theme.palette.divider}
            sx={{ maxHeight: 'calc(70vh - 130px)',
              overflowY: 'auto',
              '&': {
                scrollbarWidth: 'thin',
                scrollbarColor: (theme) => `${theme.palette.primary.dark} transparent`,
              },
              '&:hover': {
                  scrollbarColor: (theme) => `${theme.palette.secondary.dark} transparent`,
              },
            }}
          >
            {chatProps.selected?.messages.map((message, idx) => (
              <Stack direction="row" spacing={1} key={idx}>
                <Stack onClick={()=> (navigate(`/profile/${message.user}`))}>
                  <Avatar  sx={{cursor: 'pointer'}} >
                    {message.userPP}
                  </Avatar>
                </Stack>
                <Stack
                  direction="column"
                  spacing={0.5}
                  padding="0.5em"
                  bgcolor={(theme) => theme.palette.primary.main}
                  borderRadius="0.3em"
                  sx={{ width: '70%' }}
                >
                  <ListItemText primary={message.user} />
                  <Stack direction="column" sx={{ wordWrap: 'break-word'}}>
                    <ListItemText
                      primary={message.message}
                      primaryTypographyProps={{
                        sx: { wordWrap: 'break-word' }
                      }}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        fontSize: '0.5rem',
                        color: 'gray',
                        mt: 0.5
                      }}
                    >
                      {message.timestamp}
                    </Box>
                  </Stack>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Stack
          direction={'row'}
          sx={{
            marginY: '0.3em',
            marginX: '0.4em',
            position: 'sticky',
            bottom: 0,
            zIndex: 1,
            bgcolor: (theme) => theme.palette.background.default,
            borderBottomLeftRadius: '1em',
            borderBottomRightRadius: '1em',
            height: '50px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <InputBase
            sx={{
              flexGrow: 1,
              color: (theme) => theme.palette.secondary.main,
              border: '1px solid #ced4da',
              padding: '0.4em',
              borderRadius: '5em',
              borderColor: (theme) => theme.palette.divider,
              '&:hover': {
                borderColor: (theme) => theme.palette.divider,
              },
              '&.Mui-focused': {
                borderColor: (theme) => theme.palette.divider,
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.light}`,
              },
            }}
            placeholder='Type a message...'
          />
          <Button
            variant="contained"
            color="secondary"
            sx={{
              marginLeft: '0.5em',
              borderRadius: '0.8em',
              width: '40px',
              minWidth: '40px',
              height: '40px',
            }}
          >
            <SendIcon />
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ContentChat;