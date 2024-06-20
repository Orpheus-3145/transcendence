import React from 'react';
import { ChatProps, ChatStatus, ChatRoom } from './InterfaceChat';
import { Box, Stack, IconButton, InputBase, Button, ListItemText } from '@mui/material';
import { useTheme } from '@emotion/react';
import { Chat as ChatIcon, Settings as SettingsIcon, Send as SendIcon, Cancel as CancelIcon } from '@mui/icons-material';

interface ContentChatProps {
  chatProps: ChatProps;
  setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

const ContentChat: React.FC<ContentChatProps> = ({ chatProps, setChatProps }) => {
  const toggleChatStatus = (status: ChatStatus, selection: ChatRoom | null) => {
    setChatProps({ ...chatProps, chatStatus: status, selected: selection });
  };
  const theme = useTheme();
  return (
    <Box
      padding="0.2em"
      sx={{
        position: 'fixed',
        border: '1px solid #abc',
        bottom: 16,
        right: 16,
        width: 300,
        height: 'auto',
        bgcolor: (theme) => theme.palette.background.default,
        borderRadius: '1em',
        overflow: 'auto'
      }}
    >      <Stack direction={'column'} justifyContent={'flex-end'}>
        <Stack
          direction={'row'}
          sx={{
            borderTopLeftRadius: '1em',
            borderTopRightRadius: '1em',
            color: (theme) => theme.palette.secondary.main,
            justifyContent: 'space-between',
            paddingX: '0.9em',
            paddingY: '0.1em',
            bgcolor: (theme) => theme.palette.background.default,
            flexGrow: 1,
          }}
        >
          <Stack direction={'row'} alignItems={'center'} spacing={1}>
            <ChatIcon />
            <ListItemText primary={chatProps.selected?.name || 'Chat Name'} />
          </Stack>
          <Stack direction={'row'}>
            <IconButton onClick={() => { toggleChatStatus(ChatStatus.Settings, chatProps.selected)}} sx={{
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
        <Stack
          minHeight="15em"
          direction="column"
          padding="0.5em"
          spacing={1}
          bgcolor={(theme) => theme.palette.background.default}
          border={2}
          borderColor={(theme) => theme.palette.divider}
        >          {chatProps.selected?.messages.map((message) => (
          <Stack direction={'row'} spacing={1} alignItems={'center'}>
            <ListItemText primary={message.user} />
            <ListItemText primary={message.message} />
            <ListItemText primary={message.timestamp} />
          </Stack>
        ))}
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          padding="0.1em"
          paddingX="0.5em"
          alignItems="center"
          spacing={1}
          sx={{
            bgcolor: (theme) => theme.palette.background.default,
            borderBottomLeftRadius: '1em',
            borderBottomRightRadius: '1em',
          }}
        >
          <InputBase
            sx={{
              flexGrow: 1,
              color: (theme) => theme.palette.secondary.main,
              border: '1px solid #ced4da',
              padding: '0.5em',
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
  );
};

export default ContentChat;