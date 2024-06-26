import React from 'react';
import { Box, Stack, TextField, Button, useTheme, Typography, lighten } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { useState } from 'react';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleChangeEmail = (event) => {
    setEmail(event.target.value);
  };

  const handleChangePassword = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle login logic here
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <Box
      sx={{
        height: '95vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // place holder for better background
        background: (theme) => `linear-gradient(0deg, ${theme.palette.background.default} 0%, ${theme.palette.action.hover} 100%)`,
      }}
    >
      <Stack
        spacing={'2em'}
        onSubmit={handleSubmit}
        component="form"
        width={'100%'}
        maxWidth={'500px'}
        padding={'3em'}
        bgcolor={lighten(theme.palette.background.default, 0.1)}
        borderRadius={'2em'}
        sx={{
          
        }}
      >
        <Typography
          sx={{
            transition: 'background-color ease-in-out 0.5s, border-radius ease-in-out 0.5s, box-shadow ease-in-out 0.5s, transform ease-in-out 0.5s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `inset 0 0 0.85em #000`,
              borderRadius: '0.3em',
              bgcolor: theme.palette.action.hover,
            }
          }}
          color={theme.palette.secondary.light}
          textAlign={'center'}
          textTransform={'full-width'}
          fontSize={'3em'}>
          Transendence
        </Typography>
        <TextField
          label="Name"
          variant="outlined"
          value={email}
          onChange={handleChangeEmail}
          color='secondary'
          fullWidth
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={handleChangePassword}
          color='secondary'
          fullWidth
        />
        <Button
          variant="contained"
          type="submit"
          fullWidth
          color='primary'
          onClick={handleSubmit}
          sx={{padding: '0.5em 0', fontWeight: 'bold', fontSize: '1.5em'}}
        >
          SIGN IN
        </Button>
      </Stack>
    </Box>
  );
};

export default LoginPage;
