import React from 'react';
import { Box, Stack, useTheme } from '@mui/material';
import { useMediaQuery } from '@mui/material';

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    // {/* Window */}
    <Stack>
      <Stack>
        {/* Personal Info Container */}
        <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={2}>
          <Box>
            {/* background */}
            <Box>
              {/* Personal box */}
              <Stack>
                {/* Profile Pic */}
                <Box>
                  {/* Image - border depending on status - badge for status */}
                  <Box>
                  </Box>
                </Box>
                {/* Names */}
                <Stack>
                  {/* codam */}
                  <Box>
                  </Box>
                  {/* unique */}
                  <Box>
                  </Box>
                  {/* Greeting */}
                  <Box>
                  </Box>
                </Stack>
                {/* Interactive buttons */}
                <Box>
                  {/* Add/Remove Friend, Un/Block User*/}
                  {/* Invite Game, Chat */}
                </Box>
              </Stack>
              {/* Achivements */}
              <Stack>
                {/* First - Game, Friend, Chat, Nickname */}
              </Stack>
            </Box>
            {/* Contact info (from intra) */}
            <Box>
            </Box>
          </Box>
        </Stack>
        {/* Stats */}
        <Stack>
          {/* Total Amount [Win Rate] */}
          {/* Type Amount [Vanilla - Win Rate] | [Custom - Win Rate] */}
        </Stack>
        {/* Match History */}
        <Stack>
          {/* Match */}
          <Stack>
            {/* [Theme => Win green, loss red] */}
            {/* [ Score-Score | Opponent(Button to Profile) ] */}
            {/* [ Date | Type ] */}
          </Stack>
        </Stack>
      </Stack>
      {/* Friends - if logedin */}
      {/* divider between on/off */}
      <Stack>
        {/* Online Friend */}
        <Stack>
          {/* [Theme => Active green, game yellow, afk red, offline gray] Avatar - Name - Message - Unfriend */}
        </Stack>
        {/* Offline friend */}
        <Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ProfilePage;
