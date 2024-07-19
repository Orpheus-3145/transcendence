import React from 'react';
import { Box, Stack, Button, useTheme, Typography } from '@mui/material';

const LoginPage: React.FC = () => {
  const theme = useTheme();

  function handleSubmit() {
    window.location.href = import.meta.env.VITE_AUTH_URL;
  };
  return (
    <Box
      sx={{
        height: '95vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => `linear-gradient(0deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
      }}
    >
      <Stack spacing={'2em'} bgcolor={theme.palette.action.hover} padding={'2em'} borderRadius={'2em'}>
        <Typography
          sx={{
            transition: 'padding ease-in-out 0.5s, background-color ease-in-out 0.5s, border-radius ease-in-out 0.5s, box-shadow ease-in-out 0.5s, transform ease-in-out 0.5s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `inset 0 0 0.85em #000`,
              borderRadius: '0.3em',
              bgcolor: theme.palette.action.hover,
              padding: '0.2em',
            },
            color: theme.palette.secondary.light,
            textAlign: 'center',
            textTransform: 'full-width',
            fontSize: '3em',
            width: '100%',
            whiteSpace: 'normal'
          }}
          color={theme.palette.secondary.light}
          textAlign={'center'}
          textTransform={'full-width'}
          fontSize={'2.7em'}
          width={'100%'}
        >
          Transendence
        </Typography>
        <Typography>
          {import.meta.env.REDIRECT_URL}
        </Typography>
        <Button
          variant="contained"
          color='primary'
          onClick={handleSubmit}
          sx={{
            padding: '0.5em 0',
            fontWeight: 'bold',
            fontSize: '1.5em',
          }}
        >
          SIGN IN
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginPage;
