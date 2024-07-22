import React from 'react';
import { MenuDrawer } from './Navigation/Menu/MenuDrawer';
import { Box, IconButton, Stack } from '@mui/material';
import { useUser } from '../../Providers/UserContext/User';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export const Bar: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      alignContent={'center'}
    >
      <Stack
        bgcolor={theme.palette.primary.dark}
        justifyContent={'space-between'}
        alignContent={'center'}
        position={'fixed'}
        paddingY={'0.1em'}
        paddingX={'0.5em'}
        direction={'row'}
        width={'100%'}
        height={'3em'}
        borderBottom={`0.1em outset ${theme.palette.divider}`}
      >
        <MenuDrawer />
        <IconButton
          onClick={() => { navigate(`/profile/${user.id}`) }}
          sx={{
            p: 0,
            border: '1px solid transparent',
            borderRadius: '50%',
            overflow: 'hidden',
            '&:hover': {
              '& img': {
                transform: 'scale(1.2)',
                transition: 'transform 0.3s ease',
              },
            },
            '& img': {
              width: '100%',
              height: '100%',
              transition: 'transform 0.3s ease',
            },
          }}
        >
          {user && user.image ? (
            <img
              src={user.image}
              alt="User"
              style={{
                display: 'block',
              }}
            />
          ) : (
            <AccountBoxIcon sx={{ color: theme.palette.secondary.main }} />
          )}
        </IconButton>
      </Stack>
    </Box>
  );
};

export default Bar;
