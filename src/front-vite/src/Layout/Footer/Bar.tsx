import React from 'react';
import { Stack, Avatar, Typography, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { GitHub } from '@mui/icons-material';

const developers = [
  { photo: 'https://cdn.intra.42.fr/users/d79fb7299db9e1dca736792ac5f0276a/itopchu.jpg', name: 'Ibrahim Topchu', role: 'Frontend', git: 'https://www.github.com/itopchu' },
  { photo: '/path/to/photo2.jpg', name: 'Developer 2', role: 'Backend', git: 'https://www.github.com/yourgithub' },
  { photo: '/path/to/photo3.jpg', name: 'Developer 3', role: 'Game Design', git: 'https://www.github.com/yourgithub' },
];

export const Bar: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box component="footer" padding={'2%'} bgcolor={(theme) => theme.palette.background.default} overflow="hidden">
      <Stack 
        direction={isSmallScreen ? 'column' : 'row'} 
        spacing={4} 
        justifyContent="space-around" 
        alignItems="center" 
        padding={4}
      >
        {developers.map((developer, index) => (
          <Stack 
            key={index}
            direction="column"
            alignItems="center"
            spacing={2}
            padding={2}
            bgcolor={(theme) => theme.palette.primary.main}
            borderRadius={2}
            boxShadow={3}
            sx={{
              width: '200px',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar 
              src={developer.photo} 
              alt={developer.name} 
              sx={{ width: 120, height: 120, borderRadius: 4 }}
            />
            <Typography 
              variant="h6" 
              color="textPrimary"
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                width: '100%',
                textAlign: 'center'
              }}
            >
              {developer.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">{developer.role}</Typography>
            <IconButton href={developer.git} target="_blank" rel="noopener noreferrer" color="inherit">
              <GitHub />
            </IconButton>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default Bar;
