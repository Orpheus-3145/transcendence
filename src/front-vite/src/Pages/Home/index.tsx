import React from 'react';
import { Stack, Box, Container, Typography, CssBaseline, useTheme } from '@mui/material';
import { styled } from '@mui/system';


const MainContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const objectives = [
  'Develop a single-page application for playing Pong online.',
  'Implement real-time multiplayer functionality.',
  'Create a comprehensive user account system with OAuth, two-factor authentication, and user profiles.',
  'Integrate a chat system with features like public and private channels, direct messaging, and user blocking.',
  'Ensure the application adheres to high security standards.',
];

const requirements = [
  'Backend: The backend must be developed using NestJS.',
  'Frontend: The frontend must be created using a TypeScript framework of choice.',
  'Database: PostgreSQL is required as the database management system.',
  'Compatibility: The application must be compatible with the latest stable versions of Google Chrome and one other web browser.',
  'Deployment: The entire application must be deployable via a single docker-compose up --build command, utilizing Docker in rootless mode for security.',
];

const security = [
  'Passwords must be hashed before storing.',
  'Protection against SQL injection attacks.',
  'Server-side validation of all forms and user inputs.',
  'Secure storage of credentials, API keys, and environment variables in a .env file, excluded from version control.',
];

const chat = [
  'Creation of public, private, and password-protected channels.',
  'Direct messaging between users.',
  'Blocking functionality.',
  'Channel administration capabilities including setting passwords, kicking, banning, and muting users.',
  'Integration with the game invitation system.',
];

const pong = [
  'Real-time Pong gameplay between users.',
  'Matchmaking system for automatic player pairing.',
  'Options for game customization (e.g., power-ups, different maps) while retaining a classic mode.',
  'Responsiveness to network issues to ensure a smooth user experience.',
];

export const Home: React.FC = () => {
  const theme = useTheme();
  return (
    <CssBaseline >
      <MainContainer>
        <ContentBox>
          <Typography
            variant='h2'
            sx={{
              textAlign: 'center',
              width: '16ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            ft_transcendence
          </Typography>
          <Typography
            sx={{
              marginBottom: '1em',
              fontVariant: 'body1',
              padding: '0.5em',
              textAlign: 'justify',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={theme.palette.background.default} borderRadius={'1em'} padding={'1em'}>
              A modern web application to play Pong online with real-time multiplayer capabilities.
            </Box>
          </Typography>
          <Typography
            variant='h4'
            sx={{
              textAlign: 'center',
              width: '15ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Project Overview
          </Typography>
          <Typography
            sx={{
              marginBottom: '1em',
              fontVariant: 'body1',
              padding: '0.5em',
              textAlign: 'justify',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={theme.palette.background.default} borderRadius={'1em'} padding={'1em'}>
              is a web development project centered on creating a single-page application (SPA) that allows users to play the classic game Pong against each other. The project emphasizes modern web development practices, utilizing NestJS for the backend, a TypeScript framework for the frontend, and PostgreSQL for the database. The application will feature a user-friendly interface, real-time multiplayer capabilities, a chat system, and robust security measures.
            </Box>
          </Typography>
          <Typography
            variant='h4'
            sx={{
              textAlign: 'center',
              width: '10ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Objectives
          </Typography>
          <Typography
            sx={{
              marginBottom: '1em',
              fontVariant: 'body1',
              padding: '0.5em',
              textAlign: 'justify',
              color: 'secondary.main',
              bgcolor: 'primary.main',
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={'background.default'} borderRadius={'1em'} padding={'1em'}>
              {objectives.map((objective, index) => (
                <Box key={index} component="div" sx={{ marginBottom: index !== objectives.length - 1 ? '0.5em' : '0' }}>
                  {objective}
                </Box>
              ))}
            </Box>
          </Typography>
          <Typography
            variant='h4'
            sx={{
              textAlign: 'center',
              width: '13ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Technical Requirements
          </Typography>
          <Typography
            sx={{
              marginBottom: '1em',
              fontVariant: 'body1',
              padding: '0.5em',
              textAlign: 'justify',
              color: 'secondary.main',
              bgcolor: 'primary.main',
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={'background.default'} borderRadius={'1em'} padding={'1em'}>
              {requirements.map((requirement, index) => (
                <Box key={index} component="div" sx={{ marginBottom: index !== objectives.length - 1 ? '0.5em' : '0' }}>
                  {requirement}
                </Box>
              ))}
            </Box>
          </Typography>
          <Typography
            variant='h4'
            sx={{
              textAlign: 'center',
              width: '13ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Core Features
          </Typography>
          <Stack
            spacing={'0.5em'}
            sx={{
              direction: 'column',
              display: 'flex',
              marginBottom: '1em',
              fontVariant: 'body1',
              padding: '0.5em',
              textAlign: 'justify',
              color: 'secondary.main',
              bgcolor: 'primary.main',
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={'background.default'} borderRadius={'1em'} sx={{ marginX: '0.3em' }}>
              <Typography
                variant='h4'
                sx={{
                  textAlign: 'center',
                  color: theme.palette.background.default,
                  bgcolor: theme.palette.secondary.main,
                  borderTopLeftRadius: '0.5em',
                  borderTopRightRadius: '0.5em',
                }}
              >
                User Account Management
              </Typography>
              <Box bgcolor={'background.default'} padding={'1em'} color={'secondary.main'}>
                {requirements.map((requirement, index) => (
                  <Box key={index} component="div" sx={{ marginBottom: index !== objectives.length - 1 ? '0.5em' : '0' }}>
                    {requirement}
                  </Box>
                ))}
              </Box>
            </Box>
            <Stack direction={'row'}>
              <Box bgcolor={'background.default'} borderRadius={'1em'} sx={{ marginX: '0.3em' }}>
                <Typography
                  variant='h4'
                  sx={{
                    textAlign: 'center',
                    color: theme.palette.background.default,
                    bgcolor: theme.palette.secondary.main,
                    borderTopLeftRadius: '0.5em',
                    borderTopRightRadius: '0.5em',
                  }}
                >
                  Chat System
                </Typography>
                <Box bgcolor={'background.default'} padding={'1em'} color={'secondary.main'}>
                  {chat.map((chaty, index) => (
                    <Box key={index} component="div" sx={{ marginBottom: index !== objectives.length - 1 ? '0.5em' : '0' }}>
                      {chaty}
                    </Box>
                  ))}
                </Box>
              </Box>
              <Box bgcolor={'background.default'} borderRadius={'1em'} sx={{ marginX: '0.3em' }}>
                <Typography
                  variant='h4'
                  sx={{
                    textAlign: 'center',
                    color: theme.palette.background.default,
                    bgcolor: theme.palette.secondary.main,
                    borderTopLeftRadius: '0.5em',
                    borderTopRightRadius: '0.5em',
                  }}
                >
                  Pong Game
                </Typography>
                <Box bgcolor={'background.default'} padding={'1em'} color={'secondary.main'}>
                  {pong.map((pong, index) => (
                    <Box key={index} component="div" sx={{ marginBottom: index !== objectives.length - 1 ? '0.5em' : '0' }}>
                      {pong}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Stack>
          </Stack>
          <Typography
            variant='h4'
            sx={{
              textAlign: 'center',
              width: '13ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Security Considerations
          </Typography>
          <Typography
            sx={{
              marginBottom: '1em',
              fontVariant: 'body1',
              padding: '0.5em',
              textAlign: 'justify',
              color: 'secondary.main',
              bgcolor: 'primary.main',
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={'background.default'} borderRadius={'1em'} padding={'1em'}>
              {security.map((secur, index) => (
                <Box key={index} component="div" sx={{ marginBottom: index !== objectives.length - 1 ? '0.5em' : '0' }}>
                  {secur}
                </Box>
              ))}
            </Box>
          </Typography>
        </ContentBox>
      </MainContainer>
    </CssBaseline>
  );
};

export default Home;
