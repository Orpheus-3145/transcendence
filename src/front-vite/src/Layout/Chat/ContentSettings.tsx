import React, { useState } from 'react';
import { ChatProps, ChatStatus, ChatRoom, UserRoles } from './InterfaceChat';
import {
  Box,
  Stack,
  IconButton,
  Button,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Badge,
} from '@mui/material';
import { TextField, Select, MenuItem, FormControl } from '@mui/material';

import {
  Logout as LogoutIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Chat as ChatIcon,
  Add as AddIcon,
} from '@mui/icons-material';
// import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

interface ContentSettingsProps {
  chatProps: ChatProps;
  setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

const ContentSettings: React.FC<ContentSettingsProps> = ({ chatProps, setChatProps }) => {
  const toggleChatStatus = (status: ChatStatus, selection: ChatRoom | null) => {
    setChatProps({ ...chatProps, chatStatus: status, selected: selection });
  };
  const [selectedType, setSelectedType] = useState(chatProps.selected?.settings.type);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue: string = event.target.value;
    if (newValue === "public" || newValue === "private" || newValue === "password" || newValue === undefined) {
      setSelectedType(newValue as "public" | "private" | "password" | undefined);
    } else {
      console.error("Invalid type selected");
    }
  };

  // const theme = useTheme();
  return (
    <Box
      padding="0.2em"
      sx={{
        position: 'fixed',
        border: '1px solid #abc',
        bottom: 16,
        right: 16,
        width: 300,
        maxHeight: '70vh',
        minHeight: '30vh',
        bgcolor: (theme) => theme.palette.background.default,
        borderRadius: '1em',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Stack direction={'column'} sx={{ flexGrow: 1, maxHeight: '100%' }}>
        <Stack
          direction={'row'}
          onClick={() => { toggleChatStatus(ChatStatus.Chatbox, chatProps.selected) }}
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            cursor: 'pointer',
            borderTopLeftRadius: '1em',
            borderTopRightRadius: '1em',
            color: (theme) => theme.palette.secondary.main,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingX: '0.9em',
            paddingY: '0.1em',
            bgcolor: (theme) => theme.palette.background.default,
            height: '40px',
          }}
        >
          <Stack direction={'row'} alignItems={'center'} spacing={1}
            sx={{
              cursor: 'pointer',
              color: (theme) => theme.palette.secondary.main,
              '&:hover': {
                color: (theme) => theme.palette.secondary.dark,
              },
            }}
          >
            <ArrowBackIcon />
            <ListItemText primary={chatProps.selected?.name || 'Chat Name'} />
          </Stack>
          <Stack direction={'row'}>
            <IconButton onClick={(event) => { event.stopPropagation(); toggleChatStatus(ChatStatus.Bubble, null) }} sx={{
              color: (theme) => theme.palette.secondary.main,
              '&:hover': {
                color: (theme) => theme.palette.error.main,
              },
            }}>
              <LogoutIcon />
            </IconButton>
            <IconButton onClick={(event) => { event.stopPropagation(); toggleChatStatus(ChatStatus.Bubble, null) }} sx={{
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
          direction="column"
          padding="0.3em"
          spacing={1}
          bgcolor={(theme) => theme.palette.action.hover}
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
          }}
        >
          <Stack marginY="0.3em" alignItems="center" direction="row" justifyContent="center" paddingX="0.5em"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              // handleFileDrop(e.dataTransfer.files[0]);
            }}
          >
            <Badge
              badgeContent="Edit"
              color="secondary"
              invisible={!isHovered}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <Button
                component="label"
                sx={{
                  position: 'relative',
                  width: 56,
                  height: 56,
                  minWidth: 0,
                  padding: 0,
                  '&:hover': {
                    '& .MuiBadge-badge': {
                      visibility: 'visible',
                    },
                  },
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  // handleFileSelect(e.dataTransfer.files[0]);
                }}
              >
                <Avatar
                  sx={{
                    width: '100%',
                    height: '100%',
                    bgcolor: (theme) => theme.palette.primary.main,
                  }}
                  src={chatProps.selected?.icon || <ChatIcon />}
                />
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    // handleFileSelect(e.target.files[0]);
                  }}
                />
              </Button>
            </Badge>
          </Stack>
          <Divider />
          <Stack direction='column' spacing={2}>
            <Stack flexGrow={1} direction='row' spacing={1}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Stack direction={'row'} spacing={1} gap={0} paddingX={'0.5em'}>
                <Typography alignSelf={'center'} color={(theme) => theme.palette.secondary.main}>Type:</Typography>
                <FormControl variant="standard" sx={{ alignSelf: 'center', width: 'auto' }}>
                  <Select value={selectedType} onChange={handleChange}>
                    <MenuItem value={'public'}>Public</MenuItem>
                    <MenuItem value={'private'}>Private</MenuItem>
                    <MenuItem value={'password'}>Password protected</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <IconButton
                sx={{
                  color: (theme) => theme.palette.secondary.main,
                  bgcolor: (theme) => theme.palette.primary.main,
                }}
              >
                <SaveIcon />
              </IconButton>
            </Stack>
            {selectedType === 'password' && (
              <TextField type="password" label="Password" variant="standard" />
            )}
          </Stack>
          <Divider />
          <Stack paddingX={'0.5em'} direction='row' spacing={1} justifyContent={'space-between'} height={'2em'}
            sx={{ transition: 'border-radius 0.4s ease', '&:hover': { cursor: 'pointer', bgcolor: (theme) => theme.palette.action.hover, borderRadius: '1em' } }}
            onClick={() => navigate(`/profile/${chatProps.selected?.settings?.owner}`)}
          >
            <Typography alignContent={'center'} variant="h6" color="primary" fontSize={'1em'}>Channel Owner:</Typography>
            <Typography alignContent={'center'} variant="h6" color="secondary" fontSize={'1em'} fontWeight={'bold'}>
              {chatProps.selected?.settings?.owner}
            </Typography>
          </Stack>
          <Divider />
          <Stack
            direction={'column'}
            sx={{
              maxHeight: '20em',
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
            <IconButton
              onClick={() => console.log("Add a user")}
              sx={{
                justifyContent: 'center',
                marginY: '0.3em',
                padding: '0.3em',
                height: '1.3em',
                spacing: 1,
                color: (theme) => theme.palette.secondary.main,
                bgcolor: (theme) => theme.palette.primary.main,
                borderRadius: '0em',
                transition: 'border-radius 0.4s ease, background-color 0.4s ease',
                '&:hover': {
                  cursor: 'pointer',
                  bgcolor: (theme) => theme.palette.action.hover,
                  borderRadius: '2em',
                },
              }}
            >
              <AddIcon/>
              <Typography
                alignSelf={'center'}
                fontSize={'0.7em'}
              >
                Add a friend
              </Typography>
            </IconButton>
            {chatProps.selected?.settings?.users?.map((user, index) => (
              user.role !== UserRoles.Owner ? (
                <Stack
                  padding={'0.5em'}
                  height={'3.3em'}
                  justifyContent={'space-between'}
                  marginY={'0.3em'}
                  direction={'row'}
                  key={index}
                  bgcolor={(theme) => theme.palette.action.hover}
                  onClick={() => navigate(`/profile/${user.name}`)}
                  sx={{ transition: 'border-radius 0.4s ease', '&:hover': { cursor: 'pointer', bgcolor: (theme) => theme.palette.action.hover, borderRadius: '2em' } }}
                >
                  <Stack
                    direction={'row'}
                    spacing={1}
                    alignItems={'center'}
                  >
                    <Typography color={(theme) => theme.palette.secondary.main}
                      sx={{
                        '&:hover': {
                          color: (theme) => theme.palette.secondary.dark,
                        },
                      }}
                    >
                      {user.name.length > 9 ? `${user.name.substring(0, 7)}...` : user.name}
                    </Typography>
                    <Select defaultValue={user.role} label="Role" variant='standard' autoWidth
                      sx={{
                        maxWidth: '9.5ch',
                      }}
                    >
                      {Object.entries(UserRoles).filter(([key]) => key !== 'Owner').map(([key, value], index) => (
                        <MenuItem key={index} value={value}>
                          {key}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                  <Stack spacing={'0.4em'} direction={'row'} alignItems={'center'}>
                    <Typography fontSize={'0.8em'} color={(theme) => theme.palette.error.dark}
                      onClick={(event) => { event.stopPropagation(); console.log('Kicked') }}
                      sx={{
                        width: 'auto',
                        borderRadius: '0.5em',
                        marginRight: '0.5em',
                        "&:hover": {
                          cursor: 'pointer',
                          colorAdjust: 'bold',
                          color: (theme) => theme.palette.error.main,
                        },
                      }}
                    >Kick</Typography>
                    <Typography fontSize={'0.8em'} color={(theme) => theme.palette.error.dark}
                      onClick={(event) => { event.stopPropagation(); console.log('Banned') }}
                      sx={{
                        width: 'auto',
                        borderRadius: '0.5em',
                        marginRight: '0.5em',
                        "&:hover": {
                          cursor: 'pointer',
                          colorAdjust: 'bold',
                          color: (theme) => theme.palette.error.main,
                        },
                      }}
                    >Ban</Typography>
                    <Typography fontSize={'0.8em'} color={(theme) => theme.palette.error.dark}
                      onClick={(event) => { event.stopPropagation(); console.log('Blocked') }}
                      sx={{
                        width: 'auto',
                        borderRadius: '0.5em',
                        marginRight: '0.5em',
                        "&:hover": {
                          cursor: 'pointer',
                          colorAdjust: 'bold',
                          color: (theme) => theme.palette.error.main,
                        },
                      }}
                    >Block</Typography>
                  </Stack>
                </Stack>
              ) : null
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ContentSettings;
