import React from 'react';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { styled, alpha, useTheme } from '@mui/material/styles';
import { IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.1)`,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  transition: 'border-radius 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.2),
    borderRadius: '2em',
  },
}));

const StyledIconWrapper = styled('div')(({ theme }) => ({
  boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.05)`,
  color: theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-radius 0.3s ease',
  '&:hover': {
    boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.3)`,
    borderRadius: '2em',
  },
}));

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
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
      <StyledIconButton
        size="medium"
        edge="start"
        color="inherit"
        aria-label="profile"
        onClick={handleClick}
      >
        <StyledIconWrapper>
          <AccountBoxIcon sx={{ color: theme.palette.common.white }} />
        </StyledIconWrapper>
      </StyledIconButton>
    </Box>
  );
};

export default Button;
