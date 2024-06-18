import React from 'react';
import { Container, CssBaseline, Typography, TextField, Button, Box, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const LoginContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(4),
  boxShadow: theme.shadows[3],
  textAlign: 'center',
}));

const LoginSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const LoginPage: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      <LoginContainer>
        <Typography variant="h4" gutterBottom style={{ color: theme.palette.text.primary }}>
          Login
        </Typography>
        <LoginSection>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            margin="normal"
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{
              style: { color: theme.palette.text.primary },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
            InputProps={{
              style: { color: theme.palette.text.primary },
            }}
          />
        </LoginSection>
        <Button variant="contained" color="primary" fullWidth>
          Login
        </Button>
        <Button variant="text" color="secondary" fullWidth style={{ marginTop: theme.spacing(2) }}>
          Forgot Password?
        </Button>
      </LoginContainer>
    </>
  );
};

export default LoginPage;
