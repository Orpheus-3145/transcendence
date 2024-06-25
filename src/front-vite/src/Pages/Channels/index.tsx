import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  textAlign: 'center',
  padding: theme.spacing(3),
}));

const HomeLink = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.secondary.main,
  borderColor: theme.palette.secondary.main,
}));

const ChannelsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  }

  return (
    <Container>
      <ErrorContainer>
        <Typography variant="h3" component="h3" gutterBottom>
          Channels Page is under construction.
        </Typography>
        <Typography variant="body1" gutterBottom>
          404
        </Typography>
        <HomeLink variant="outlined" onClick={handleHomeClick}>
          Go back to Home
        </HomeLink>
      </ErrorContainer>
    </Container>
  );
};

export default ChannelsPage;
