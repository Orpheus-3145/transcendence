import React, { useEffect, useState } from 'react';
import { Stack, Box, Container, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import { useCookies } from 'react-cookie';

const ContentBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  borderRadius: '1em',
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

type SectionTitleProps = {
  children: React.ReactNode;
  width: string;
};

const SectionTitle: React.FC<SectionTitleProps> = ({ children, width }) => {
  const theme = useTheme();
  return (
    <Typography
      variant='h4'
      sx={{
        textAlign: 'center',
        width,
        color: theme.palette.secondary.main,
        bgcolor: theme.palette.primary.main,
        borderTopLeftRadius: '0.5em',
        borderTopRightRadius: '0.5em',
      }}
    >
      {children}
    </Typography>
  );
};

type SectionContentProps = {
  children: React.ReactNode;
};

const SectionContent: React.FC<SectionContentProps> = ({ children }) => {
  const theme = useTheme();
  return (
    <Typography
      component={'div'}
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
        {children}
      </Box>
    </Typography>
  );
};

type ListContentProps = {
  items: string[];
};

const ListContent: React.FC<ListContentProps> = ({ items }) => (
  <Box>
    {items.map((item, index) => (
      <Box key={index} component="div" sx={{ marginBottom: index !== items.length - 1 ? '0.5em' : '0' }}>
        {item}
      </Box>
    ))}
  </Box>
);

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

const Home: React.FC = () => {

  const theme = useTheme();
  return (
    <Container>
      <ContentBox>
        <Typography>
          {import.meta.env.ORIGIN_URL_BACK}
        </Typography>
        <SectionTitle width="16ch">ft_transcendence</SectionTitle>
        <SectionContent>
          <Box bgcolor={theme.palette.background.default} borderRadius={'1em'} padding={'1em'}>
            A modern web application to play Pong online with real-time multiplayer capabilities.
          </Box>
        </SectionContent>

        <SectionTitle width="15ch">Project Overview</SectionTitle>
        <SectionContent>
          <Box bgcolor={theme.palette.background.default} borderRadius={'1em'} padding={'1em'}>
            A web development project centered on creating a single-page application (SPA) that allows users to play the classic game Pong against each other. The project emphasizes modern web development practices, utilizing NestJS for the backend, a TypeScript framework for the frontend, and PostgreSQL for the database. The application will feature a user-friendly interface, real-time multiplayer capabilities, a chat system, and robust security measures.
          </Box>
        </SectionContent>

        <SectionTitle width="10ch">Objectives</SectionTitle>
        <SectionContent>
          <ListContent items={objectives} />
        </SectionContent>

        <SectionTitle width="13ch">Technical Requirements</SectionTitle>
        <SectionContent>
          <ListContent items={requirements} />
        </SectionContent>

        <SectionTitle width="13ch">Core Features</SectionTitle>
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
              variant='h5'
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
            <Box borderRadius={'1em'} bgcolor={'background.default'} padding={'1em'} color={'secondary.main'}>
              <ListContent items={requirements} />
            </Box>
          </Box>
          <Stack direction={'row'}>
            <Box bgcolor={'background.default'} borderRadius={'1em'} sx={{ marginX: '0.3em' }}>
              <Typography
                variant='h5'
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
              <Box borderRadius={'1em'} bgcolor={'background.default'} padding={'1em'} color={'secondary.main'}>
                <ListContent items={chat} />
              </Box>
            </Box>
            <Box bgcolor={'background.default'} borderRadius={'1em'} sx={{ marginX: '0.3em' }}>
              <Typography
                variant='h5'
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
              <Box borderRadius={'1em'} bgcolor={'background.default'} padding={'1em'} color={'secondary.main'}>
                <ListContent items={pong} />
              </Box>
            </Box>
          </Stack>
        </Stack>

        <SectionTitle width="13ch">Security Considerations</SectionTitle>
        <SectionContent>
          <ListContent items={security} />
        </SectionContent>
      </ContentBox>
    </Container>
  );
};

export default Home;
