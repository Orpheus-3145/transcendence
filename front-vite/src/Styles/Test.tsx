import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const Item: React.FC<React.PropsWithChildren<BoxProps>> = (props) => {
    const { sx, children, ...other } = props;
    return (
      <Box
        sx={{
          cursor: 'pointer',
          display: 'flex',
          flexGrow: '1',
          justifyContent: 'center',
          color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
          borderRadius: '1em',
          fontSize: '0.875rem',
          fontWeight: '700',
          height: "100%",
          bgcolor: (theme) => (theme.palette.background.default),
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: theme => `inset 0 0 1em ${alpha(theme.palette.secondary.main, 0.5)}`,
          },
          ...sx,
        }}
        {...other}
      >
        {children}
      </Box>
    );
}

export default Item;
