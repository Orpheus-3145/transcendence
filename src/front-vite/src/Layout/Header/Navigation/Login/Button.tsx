import React from 'react';
import IconButton from '@mui/material/IconButton';
import { Login as LoginIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-radius 0.3s ease',
  '&:hover': {
    boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.3)`,
    borderRadius: '2em',
  },
}));

const StyledAnchor = styled('a')(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.text.primary,
}));

export const Button: React.FC = () => {
  const theme = useTheme();

  return (
    <StyledAnchor href="/login">
      <StyledIconButton color="inherit" edge="end">
        <StyledIconWrapper>
          <LoginIcon sx={{ color: theme.palette.common.white }} />
        </StyledIconWrapper>
      </StyledIconButton>
    </StyledAnchor>
  );
};

export default Button;
