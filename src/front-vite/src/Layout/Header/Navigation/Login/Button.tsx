import React from 'react';
import IconButton from '@mui/material/IconButton';
import { Login as LoginIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';


export const Button: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/login`);
  };

  return (
    <IconButton color="inherit" edge="end" onClick={handleClick}>
      <LoginIcon sx={{ color: theme.palette.secondary.main }} />
    </IconButton>
  );
};

export default Button;
