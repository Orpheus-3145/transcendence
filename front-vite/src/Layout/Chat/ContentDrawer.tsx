import React from 'react';
import { useState } from 'react'
import { ChatProps, ChatStatus, ChatRoom, ChannelType } from './InterfaceChat';
import { Box, Drawer, Divider, Stack, IconButton, InputBase, Typography } from '@mui/material';
import { darken, alpha, useTheme } from '@mui/material/styles';
import { Add as AddIcon, Settings as SettingsIcon, Logout as LogoutIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { Chat as ChatIcon } from '@mui/icons-material';
import ContentSettings from './ContentSettings';
import { useNavigate } from 'react-router-dom';


interface ContentDrawerProps {
	chatProps: ChatProps;
	setChatProps: React.Dispatch<React.SetStateAction<ChatProps>>;
}

const ContentDrawer: React.FC<ContentDrawerProps> = ({ chatProps, setChatProps }) => {
  const theme = useTheme();
  const navigate = useNavigate();


	// Add state for controlling new chat creation
	const [isAddingNewChat, setIsAddingNewChat] = useState(false);
	const [newChatName, setNewChatName] = useState('');

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

  const handleAddChatClick = (event: React.ChangeEvent<HTMLInputElement>) => {
	setIsAddingNewChat(true);
	console.log("'Add new chat' button clicked!");
  };

  const handleSaveNewChat = () => {
	if (newChatName.trim()) {
		setChatProps({
			...chatProps,
			chatRooms: [
				...chatProps.chatRooms,
				{
					name: newChatName,
					icon: <ChatIcon />,
					messages: [],
					settings: {
						icon: <ChatIcon />,
						type: ChannelType.public,
						password: null,
						users: [],
						owner: 'OwnerName',
					},
				},
			],
		});
	} else {
		console.log('Please enter a valid chat name.');
	}
  };

  const handleCancelNewChat = () => {
	setIsAddingNewChat(false);
	setNewChatName('');
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
		
      {/* <Stack
        direction="row"
        justifyContent="center"
      >
        <IconButton sx={{ color: theme.palette.secondary.main }} edge="start" onClick={handleSearchClick} aria-label="search">
          <AddIcon />
        </IconButton>
		<IconButton sx={{ color: theme.palette.secondary.main }} edge="start" onClick={handleAddChatClick} aria-label="add chat">
          <AddIcon />
        </IconButton>
        <Divider sx={{ marginY: '0.3em' }} orientation="vertical" flexItem />
        <InputBase value={chatProps.searchPrompt} onChange={handleInputChange} sx={{ marginLeft: '8px', color: theme.palette.secondary.main }} placeholder="Search..." />
      </Stack>
	  
      <Box sx={{ height: '0', color: 'transparent', bgcolor: 'transparent' }}>
        <Divider orientation="horizontal" />
      </Box>
	  
	   Render the input field for adding a new chat

	   {isAddingNewChat && (
        <Stack direction="row" spacing={2} alignItems="center" marginY={theme.spacing(1)}>
          <InputBase
            value={newChatName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChatName(e.target.value)}
            sx={{ marginLeft: '8px', color: theme.palette.secondary.main }}
            placeholder="Enter chat name"
          />
          <IconButton sx={{ color: theme.palette.secondary.main }} onClick={handleSaveNewChat}>
            <CheckIcon />
          </IconButton>
          <IconButton sx={{ color: theme.palette.secondary.main }} onClick={handleCancelNewChat}>
            <CloseIcon />
          </IconButton>
        </Stack>
      )} */}

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
			  {/* <Stack onClick={(event) => { event.stopPropagation(); navigate(`/channels`); }} */}
            <Stack onClick={(event) => { event.stopPropagation(); toggleChatStatus(ChatStatus.Settings, chatRoom); }}
			  sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.secondary.dark } }}
            >
              <SettingsIcon />
            </Stack>
            {/* <Stack onClick={(event) => { event.stopPropagation(); toggleChatStatus(ChatStatus.Bubble, null); }}
              sx={{ cursor: 'pointer', '&:hover': { color: theme.palette.error.dark } }}
            >
              <LogoutIcon />
            </Stack> */}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );

	const handleClose = () => {
		if (chatProps.selected == null) toggleChatStatus(ChatStatus.Bubble, null);
	};

	return (
		<Drawer
			anchor='right'
			open={chatProps.chatStatus == ChatStatus.Drawer}
			onClose={handleClose}
			sx={{
				'& .MuiPaper-root': { backgroundColor: darken(theme.palette.background.default, 0.3) },
			}}
		>
			{DrawerContent}
		</Drawer>
	);
};

export default ContentDrawer;
