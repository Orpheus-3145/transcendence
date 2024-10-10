import React from 'react';
import { Box, Stack, Button, useTheme, Typography } from '@mui/material';

const LoginPage: React.FC = () => {
  const theme = useTheme();

  function goAuth() {
    window.location.href = import.meta.env.VITE_AUTH_URL;
  };
  return (
    <Box
      sx={{
        gap: '2em',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: 'background.default',
        padding: '2em',
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: 'secondary.main',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Transcendence
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
        }}
      >
        {import.meta.env.REDIRECT_URL}
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={goAuth}
        sx={{
          padding: '0.8em 2em',
          fontSize: '1em',
          fontWeight: 'bold',
          textTransform: 'none',
          boxShadow: `0 3px 5px 2px ${theme.palette.primary.dark}`,
          ':hover': {
            bgcolor: `${theme.palette.primary.main}`,
            boxShadow: `0 5px 7px 2px ${theme.palette.primary.main}`,
          },
        }}
      >
        SIGN IN
      </Button>
    </Box>
  );
};

export default LoginPage;
