import React from 'react';
import SearchBar from './Navigation/Search/SearchBar';
import { MenuDrawer as MenuButton } from './Navigation/Menu/MenuDrawer';
import { NotifyDrawer as NotificationButton } from './Navigation/Notification/NotifyDrawer';
import { Button as ProfileButton } from './Navigation/Profile/ProfileButton';
import { Button as LoginButton } from './Navigation/Login/LoginButton';
import { AppBar, Box, Stack } from '@mui/material';
import { Item } from '../../Styles/Test';

export const Bar: React.FC = () => {
  const placeholderUser = {
    username: 'testuser',
    isAuthenticated: false,
  };

  placeholderUser.isAuthenticated = true;

  return (
    <AppBar position='fixed' sx={{ height: '48px' }} color='secondary'>
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
