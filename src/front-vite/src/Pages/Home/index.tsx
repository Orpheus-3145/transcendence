import React from 'react';
import { Container, Typography, List, ListItem, ListItemText, CssBaseline, Paper, useTheme } from '@mui/material';

const Section = ({ children, elevation }) => {
  const theme = useTheme();
  return (
    <Paper elevation={elevation} style={{ backgroundColor: theme.palette.primary.main, padding: theme.spacing(3), marginBottom: theme.spacing(2) }}>
      {children}
    </Paper>
  );
};

export const Home: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Container>
        <Section elevation={3}>
          <header>
            <Typography variant="h4" gutterBottom style={{ color: 'white' }}>
              ft_transcendence
            </Typography>
            <Typography variant="body2" style={{ color: 'white' }}>
              A modern web application to play Pong online with real-time multiplayer capabilities.
            </Typography>
          </header>
        </Section>
        <Section elevation={3}>
          <section>
            <Typography variant="h5" gutterBottom style={{ color: 'white' }}>
              Project Overview
            </Typography>
            <Typography variant="body2" style={{ color: 'white' }}>
              <strong>ft_transcendence</strong> is a web development project centered on creating a single-page application (SPA) that allows users to play the classic game Pong against each other. The project emphasizes modern web development practices, utilizing NestJS for the backend, a TypeScript framework for the frontend, and PostgreSQL for the database. The application will feature a user-friendly interface, real-time multiplayer capabilities, a chat system, and robust security measures.
            </Typography>
          </section>
        </Section>
        <Section elevation={3}>
          <section>
            <Typography variant="h5" gutterBottom style={{ color: 'white' }}>
              Objectives
            </Typography>
            <List>
              {[
                'Develop a single-page application for playing Pong online.',
                'Implement real-time multiplayer functionality.',
                'Create a comprehensive user account system with OAuth, two-factor authentication, and user profiles.',
                'Integrate a chat system with features like public and private channels, direct messaging, and user blocking.',
                'Ensure the application adheres to high security standards.',
              ].map((objective, index) => (
                <ListItem key={index}>
                  <ListItemText primary={objective} style={{ color: 'white', fontSize: '0.9rem' }} />
                </ListItem>
              ))}
            </List>
          </section>
        </Section>
        <Section elevation={3}>
          <section>
            <Typography variant="h5" gutterBottom style={{ color: 'white' }}>
              Technical Requirements
            </Typography>
            <List>
              {[
                'Backend: The backend must be developed using NestJS.',
                'Frontend: The frontend must be created using a TypeScript framework of choice.',
                'Database: PostgreSQL is required as the database management system.',
                'Compatibility: The application must be compatible with the latest stable versions of Google Chrome and one other web browser.',
                'Deployment: The entire application must be deployable via a single docker-compose up --build command, utilizing Docker in rootless mode for security.',
              ].map((requirement, index) => (
                <ListItem key={index}>
                  <ListItemText primary={requirement} style={{ color: 'white', fontSize: '0.9rem' }} />
                </ListItem>
              ))}
            </List>
          </section>
        </Section>
        <Section elevation={3}>
          <section>
            <Typography variant="h5" gutterBottom style={{ color: 'white' }}>
              Core Features
            </Typography>
            <Typography variant="subtitle1" gutterBottom style={{ color: 'white' }}>
              User Account Management
            </Typography>
            <List>
              {[
                'OAuth login via 42 intranet.',
                'Unique usernames and avatars.',
                'Two-factor authentication.',
                'Friend system with online status indicators.',
                'Display of user statistics and match history.',
              ].map((feature, index) => (
                <ListItem key={index}>
                  <ListItemText primary={feature} style={{ color: 'white', fontSize: '0.9rem' }} />
                </ListItem>
              ))}
            </List>
            <Typography variant="subtitle1" gutterBottom style={{ color: 'white' }}>
              Chat System
            </Typography>
            <List>
              {[
                'Creation of public, private, and password-protected channels.',
                'Direct messaging between users.',
                'Blocking functionality.',
                'Channel administration capabilities including setting passwords, kicking, banning, and muting users.',
                'Integration with the game invitation system.',
              ].map((feature, index) => (
                <ListItem key={index}>
                  <ListItemText primary={feature} style={{ color: 'white', fontSize: '0.9rem' }} />
                </ListItem>
              ))}
            </List>
            <Typography variant="subtitle1" gutterBottom style={{ color: 'white' }}>
              Pong Game
            </Typography>
            <List>
              {[
                'Real-time Pong gameplay between users.',
                'Matchmaking system for automatic player pairing.',
                'Options for game customization (e.g., power-ups, different maps) while retaining a classic mode.',
                'Responsiveness to network issues to ensure a smooth user experience.',
              ].map((feature, index) => (
                <ListItem key={index}>
                  <ListItemText primary={feature} style={{ color: 'white', fontSize: '0.9rem' }} />
                </ListItem>
              ))}
            </List>
          </section>
        </Section>
        <Section elevation={3}>
          <section>
            <Typography variant="h5" gutterBottom style={{ color: 'white' }}>
              Security Considerations
            </Typography>
            <List>
              {[
                'Passwords must be hashed before storing.',
                'Protection against SQL injection attacks.',
                'Server-side validation of all forms and user inputs.',
                'Secure storage of credentials, API keys, and environment variables in a .env file, excluded from version control.',
              ].map((consideration, index) => (
                <ListItem key={index}>
                  <ListItemText primary={consideration} style={{ color: 'white', fontSize: '0.9rem' }} />
                </ListItem>
              ))}
            </List>
          </section>
        </Section>
      </Container>
    </>
  );
};

export default Home;
