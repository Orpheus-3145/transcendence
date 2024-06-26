import React from 'react';
import { Avatar, Box, Button, Stack, Typography, useTheme, Divider } from '@mui/material';
import { useMediaQuery } from '@mui/material';

import {
  AccountCircle as AccountCircleIcon,
  EmojiEvents as Cup,
  Grade as Star,
} from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Stack
      bgcolor={theme.palette.action.hover}
      minHeight="90vh"
      direction={isSmallScreen ? 'column' : 'row'}
      spacing={2}
      padding="1em"
      justifyContent="space-between"
    >
      <Stack
        bgcolor={theme.palette.action.hover}
        flexGrow={1}
        direction={isSmallScreen ? 'column' : 'row'}
        sx={{ height: 'auto' }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          bgcolor={theme.palette.action.hover}
          direction={isSmallScreen ? 'column' : 'row'}
          justifyContent="space-between"
          display="flex"
          flexGrow={1}
          paddingY="1em"
        >
          <Stack
            bgcolor={theme.palette.action.hover}
            direction="row"
            spacing="1em"
            padding="1em"
            flexGrow={1}
          >
            <Stack
              sx={{ width: 'auto' }}
              spacing={2}
              direction="column"
              flexGrow={0}
              justifyContent="center"
              alignItems="center"
            >
              <Avatar
                sx={{ bgcolor: theme.palette.success.main, width: '9vw', height: '9vw', minWidth: '115px', minHeight: '115px' }}
              >
                <AccountCircleIcon sx={{ width: '9vw', height: '9vw', minWidth: '115px', minHeight: '115px' }} />
              </Avatar>
              <Box
                bgcolor={theme.palette.action.hover}
                padding="0.3em"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <Stack
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                  direction="column"
                  flexGrow={0}
                >
                  <Cup />
                  Achievements
                </Stack>
                <Box
                  bgcolor={theme.palette.action.hover}
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="center"
                  padding="0.3em"
                >
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                </Box>
              </Box>
            </Stack>
            {/* NAME WRAPPER */}
            <Stack spacing={2} justifyContent={'center'}>
              <Stack bgcolor={theme.palette.action.hover} direction={'column'} spacing={1} padding={'0.3em'}>
                <Typography bgcolor={theme.palette.action.hover} padding={'0.3em'}>
                  itopchu
                </Typography>
                <Typography bgcolor={theme.palette.action.hover} padding={'0.3em'}>
                  Am0rA
                </Typography>
                <Typography bgcolor={theme.palette.action.hover} padding={'0.3em'}>
                  Hello, welcome to my profile! We like to test around and wrap the texts!
                </Typography>
              </Stack>
              {/* BUTTON WRAPPER */}
              <Stack
                padding={'0.3em'}
                bgcolor={theme.palette.action.hover}
                direction={isSmallScreen ? 'column' : 'row'}
                spacing={1}
                justifyContent="center"
                alignItems="center"
                maxWidth={'10em'}
              >
                <Stack direction={'column'}>
                  <Button>
                    Add Friend
                  </Button>
                  <Button>
                    Block
                  </Button>
                </Stack>
                <Stack direction={'column'}>
                  <Button>
                    Invite Game
                  </Button>
                  <Button>
                    Message
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          <Stack
            justifyContent={'center'}
            bgcolor={theme.palette.action.hover}
            direction={isSmallScreen ? 'row' : 'column'}
            spacing={'2em'}
            padding={'0.5em'}
          >
            <Typography>
              Phone
              06060606060606
            </Typography>
            <Typography>
              Email:
              Hela vela velvela
            </Typography>
          </Stack>
        </Stack>
        {/* MUST DESIGN-------------------------------------------------------------- */}
        {/* Stats */}
        <Stack bgcolor={theme.palette.action.hover}>
          {/* Total Amount [Win Rate] */}
          {/* Type Amount [Vanilla - Win Rate] | [Custom - Win Rate] */}
        </Stack>
        {/* Match History */}
        <Stack bgcolor={theme.palette.action.hover}>
          {/* Match */}
          <Stack bgcolor={theme.palette.action.hover}>
            {/* [Theme => Win green, loss red] */}
            {/* [ Score-Score | Opponent(Button to Profile) ] */}
            {/* [ Date | Type ] */}
          </Stack>
        </Stack>
        {/* MUST DESIGN-------------------------------------------------------------- */}
      </Stack>
      {/* Friends - if logedin */}
      {/* divider between on/off */}
      <Stack
        bgcolor={theme.palette.action.hover}
        width={isSmallScreen ? '100%' : '270px'}
        minWidth={'250px'}
        padding={'0.3em'}
        divider={<Divider sx={{ marginY: '1em' }} />}
        direction={'column'}
        sx={{
          maxHeight: isSmallScreen ? '40vh' : '90vh',
          overflow: 'auto'
        }}
      >
        {/* Online Friend */}
        <Stack
          bgcolor={theme.palette.action.hover}
          padding={'0.2em'}
          direction={'column'}
          spacing={'1em'}
        >
          <Stack
            bgcolor={theme.palette.action.hover}
            height={isSmallScreen ? '5em' : '3em'}
            alignContent={'center'}
            sx={{ marginY: '1em', cursor: 'pointer' }}
            justifyContent={'left'}
            spacing={1}
            alignItems={'center'}
            padding={'1em'}
            direction={'row'}
            textOverflow={'hidden'}
            textAlign={'center'}
          >
            <Avatar sx={{ width: isSmallScreen ? '3em' : '2em', height: isSmallScreen ? '3em' : '2em' }} >H</Avatar>
            <Typography fontSize={isSmallScreen ? '1.7em' : '1em'} > Some Input for Online</Typography>
          </Stack>
          {/* [Theme => Active green, game yellow, afk red, offline gray] Avatar - Name - Message - Unfriend */}
        </Stack>
        {/* Offline friend */}
        <Stack bgcolor={theme.palette.action.hover}
          padding={'0.2em'}
          direction={'column'}
          spacing={'1em'}
        >
          <Stack
            bgcolor={theme.palette.action.hover}
            height={isSmallScreen ? '5em' : '3em'}
            alignContent={'center'}
            sx={{ marginY: '1em', cursor: 'pointer' }}
            justifyContent={'left'}
            spacing={1}
            alignItems={'center'}
            padding={'1em'}
            direction={'row'}
            textOverflow={'hidden'}
            textAlign={'center'}
          >
            <Avatar sx={{ width: isSmallScreen ? '3em' : '2em', height: isSmallScreen ? '3em' : '2em' }} >H</Avatar>
            <Typography fontSize={isSmallScreen ? '1.7em' : '1em'} > Some Input for Offline</Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ProfilePage;


// import React from 'react';
// import { Box, Stack, useTheme } from '@mui/material';
// import { useMediaQuery } from '@mui/material';

// const ProfilePage: React.FC = () => {
//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

//   return (
//     // {/* Window */}
//     <Stack>
//       <Stack>
//         {/* Personal Info Container */}
//         <Stack direction={isSmallScreen ? 'column' : 'row'} spacing={2}>
//           <Box>
//             {/* background */}
//             <Box>
//               {/* Personal box */}
//               <Stack>
//                 {/* Profile Pic */}
//                 <Box>
//                   {/* Image - border depending on status - badge for status */}
//                   <Box>
//                   </Box>
//                 </Box>
//                 {/* Names */}
//                 <Stack>
//                   {/* codam */}
//                   <Box>
//                   </Box>
//                   {/* unique */}
//                   <Box>
//                   </Box>
//                   {/* Greeting */}
//                   <Box>
//                   </Box>
//                 </Stack>
//                 {/* Interactive buttons */}
//                 <Box>
//                   {/* Add/Remove Friend, Un/Block User*/}
//                   {/* Invite Game, Chat */}
//                 </Box>
//               </Stack>
//               {/* Achivements */}
//               <Stack>
//                 {/* First - Game, Friend, Chat, Nickname */}
//               </Stack>
//             </Box>
//             {/* Contact info (from intra) */}
//             <Box>
//             </Box>
//           </Box>
//         </Stack>
//         {/* Stats */}
//         <Stack>
//           {/* Total Amount [Win Rate] */}
//           {/* Type Amount [Vanilla - Win Rate] | [Custom - Win Rate] */}
//         </Stack>
//         {/* Match History */}
//         <Stack>
//           {/* Match */}
//           <Stack>
//             {/* [Theme => Win green, loss red] */}
//             {/* [ Score-Score | Opponent(Button to Profile) ] */}
//             {/* [ Date | Type ] */}
//           </Stack>
//         </Stack>
//       </Stack>
//       {/* Friends - if logedin */}
//       {/* divider between on/off */}
//       <Stack>
//         {/* Online Friend */}
//         <Stack>
//           {/* [Theme => Active green, game yellow, afk red, offline gray] Avatar - Name - Message - Unfriend */}
//         </Stack>
//         {/* Offline friend */}
//         <Stack>
//         </Stack>
//       </Stack>
//     </Stack>
//   );
// };

// export default ProfilePage;
