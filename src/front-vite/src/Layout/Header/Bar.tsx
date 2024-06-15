import React from 'react';
import SearchBar from './Navigation/Search/Bar';
import { MenuDrawer as MenuButton } from './Navigation/Menu/MenuDrawer';
import { NotifyDrawer as NotificationButton } from './Navigation/Notification/NotifyDrawer';
import { Button as ProfileButton } from './Navigation/Profile/Button';
import { Button as LoginButton } from './Navigation/Login/Button';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { styled, alpha, lighten } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: lighten(theme.palette.primary.main, 0.1),
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  fontSize: 'relative-size',
  textAlign: 'center',
  fontWeight: 'bold',
  margin: '0 0.625em',
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

const StyledBox = styled(Box)`
  // padding: 0.05em;
`;

export const Bar: React.FC = () => {
  const placeholderUser = {
    username: 'testuser',
    isAuthenticated: false,
  };

  placeholderUser.isAuthenticated = true;

  return (
    <Box sx={{ flexGrow: 1, padding: '0.05em'}}>
      <StyledAppBar position={'fixed'}>
        <Toolbar>
          <StyledBox>
            <MenuButton user={placeholderUser} />
          </StyledBox>
          <StyledBox sx={{ maxWidth: '50%' }}>
            <SearchBar />
          </StyledBox>
          <StyledTypography variant="h6">
            <span>Transcendence</span>
          </StyledTypography>
          {placeholderUser.username && placeholderUser.isAuthenticated ? (
            <>
              <StyledBox>
                <StyledBox>
                  <NotificationButton user={placeholderUser} />
                </StyledBox>
                <StyledBox>
                  <ProfileButton user={placeholderUser} />
                </StyledBox>
              </StyledBox>
            </>
          ) : (
            <StyledBox>
              <LoginButton />
            </StyledBox>
          )}
        </Toolbar>
      </StyledAppBar>
    </Box>
  );
};

export default Bar;
