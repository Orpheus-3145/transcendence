import React from 'react';
import SearchBar from './Navigation/Search/Bar';
import { MenuDrawer as MenuButton } from './Navigation/Menu/MenuDrawer';
import { NotifyDrawer as NotificationButton } from './Navigation/Notification/NotifyDrawer';
import { Button as ProfileButton } from './Navigation/Profile/Button';
import { Button as LoginButton } from './Navigation/Login/Button';
import { AppBar, Box, Stack, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';

import { Item } from '../../Styles/Test';

const StyledTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontSize: 'relative-size',
  textAlign: 'center',
  fontWeight: 'bold',
  '& > span': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    color: theme.palette.common.white,
    padding: '0.25em 0.5em',
    display: 'inline-block',
    transition: 'border-radius 0.5s ease-in-out, text-shadow 0.5s ease-in-out, box-shadow 0.5s ease-in-out',
  },
  '&:hover > span': {
    borderRadius: '1em',
    textShadow: '0 0 0.5em rgba(255, 255, 255, 1)',
    boxShadow: 'inset 0em 0em 0.9em rgba(0, 0, 0, 0.5)',
  },
}));

export const Bar: React.FC = () => {
  const placeholderUser = {
    username: 'testuser',
    isAuthenticated: false,
  };

  placeholderUser.isAuthenticated = true;

  return (
    <AppBar position='fixed' sx={{ height: '48px' }}>
      <Box paddingX={1} paddingY={0.5}>
        <Stack
          direction='row' flexGrow={'1'} spacing={4}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction='row' spacing={1}>
            <Item>
              <MenuButton user={placeholderUser} />
            </Item>
            <Item>
              <SearchBar />
            </Item>
          </Stack>
          <Typography alignSelf={'center'} sx={{
            fontSize: 'relative-size',
            textAlign: 'center',
            fontWeight: 'bold',
            color: (theme) => theme.palette.common.white,
          }}
          >
            <span>Transcendences</span>
          </Typography>
          <Stack direction='row' spacing={1} >
            {placeholderUser.username && placeholderUser.isAuthenticated ? (
              <>
                <Item>
                  <NotificationButton user={placeholderUser} />
                </Item>
                <Item>
                  <ProfileButton user={placeholderUser} />
                </Item>
              </>
            ) : (<Item><LoginButton /></Item>)
            }
          </Stack>
        </Stack>
      </Box>
    </AppBar>
  )
};

export default Bar;
