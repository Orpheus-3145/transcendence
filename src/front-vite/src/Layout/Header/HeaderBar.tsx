import React from 'react';
import SearchBar from './Navigation/Search/SearchBar';
import { MenuDrawer as MenuButton } from './Navigation/Menu/MenuDrawer';
import { Button as ProfileButton } from './Navigation/Profile/ProfileButton';
import { AppBar, Box, Stack } from '@mui/material';
import { Item } from '../../Styles/Test';
import { useUser } from '../../Providers/UserContext/User';

export const Bar: React.FC = () => {
  const { user } = useUser();

  return (
    user && user.id !== '0' ? (
      <AppBar position="fixed" sx={{ height: '48px' }} color="secondary">
        <Box paddingX={1} paddingY={0.5}>
          <Stack
            direction="row" flexGrow={1} spacing={4}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1}>
              <Item>
                <MenuButton/>
              </Item>
              <Item>
                <SearchBar />
              </Item>
            </Stack>
            <Stack direction="row" spacing={1}>
              <>
                {/* <Item>
                  <NotificationButton />
                </Item> */}
                <Item>
                  <ProfileButton />
                </Item>
              </>
            </Stack>
          </Stack>
        </Box>
      </AppBar>
    ) : null
  );
};

export default Bar;
