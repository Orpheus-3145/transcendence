import React from 'react';
import IconButton from '@mui/material/IconButton';
import { Login as LoginIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';


export const Button: React.FC = () => {
  const theme = useTheme();

  return (
    <a href="/login">
      <IconButton color="inherit" edge="end">
          <LoginIcon sx={{ color: theme.palette.common.white }} />
      </IconButton>
    </a>
  );
};

export default Button;
