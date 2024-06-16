import React from 'react';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';


interface PlaceholderUser {
  username: string | null;
  isAuthenticated: boolean;
}

export const Button: React.FC<{ user: PlaceholderUser }> = ({ user }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/${user.username}`);
  };

  return (
      <IconButton onClick={handleClick}>
          <AccountBoxIcon sx={{ color: theme.palette.common.white }} />
      </IconButton>
  );
};

export default Button;
