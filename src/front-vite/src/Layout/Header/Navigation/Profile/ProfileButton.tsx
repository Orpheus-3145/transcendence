import React from 'react';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useTheme } from '@mui/material/styles';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../Providers/UserContext/User';


interface PlaceholderUser {
  username: string | null;
  isAuthenticated: boolean;
}

export const Button: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();

  const handleClick = () => {
    navigate(`/profile/${user.id}`);
  };

  return (
      <IconButton onClick={handleClick}>
        {/* replace this with users actual pp */}
          <AccountBoxIcon sx={{ color: theme.palette.secondary.main }} />
      </IconButton>
  );
};

export default Button;
