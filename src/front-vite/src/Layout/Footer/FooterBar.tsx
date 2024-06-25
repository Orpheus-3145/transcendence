import React from 'react';
import { Stack, Avatar, Typography, Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { GitHub } from '@mui/icons-material';

interface Developer {
  photo: string;
  name: string;
  role: string;
  git: string;
}

const team: Developer[] = [
  {
    photo: 'https://cdn.intra.42.fr/users/d79fb7299db9e1dca736792ac5f0276a/itopchu.jpg',
    name: 'Ibrahim Topchu',
    role: 'Frontend',
    git: 'https://www.github.com/itopchu'
  },
  {
    photo: 'https://t3.ftcdn.net/jpg/05/63/41/12/360_F_563411266_4zRdCZAiJuIYegKUCX1F1O3PqSwcNros.jpg',
    name: 'Temporary Place Holder Value',
    role: 'What?',
    git: 'https://www.github.com/your-git-comes-here'
  },
  {
    photo: 'https://images.squarespace-cdn.com/content/5edb32112cb3cc498e15a24d/1592278746395-AEX09Z0GJDHC3AFLV7AL/Squareprint+93+Logo+final-01.png?content-type=image%2Fpng',
    name: 'Temporary Place Holder Value',
    role: 'Me?',
    git: 'https://www.github.com/your-git-comes-here'
  }
]

export const Bar: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box component="footer" bgcolor={theme.palette.background.default}>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={theme.spacing(8)}
        padding={'0.5em'}
        height={isSmallScreen ? '200px' : '500px'}
        sx={{
          width: '100%',
          overflow: 'auto',
        }}
      >
        {team.map((developer, index) => (
          <Stack
            borderRadius={'1.5em'}
            bgcolor={theme.palette.primary.main}
            key={index}
            direction={'column'}
            justifyContent="space-between"
            alignItems="center"
            height={'70%'}
            width={'20%'}
            maxWidth={'200px'}
            overflow={'hidden'}
            padding={'10px'}
            sx={{
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.3s, width 0.5s',
              '&:hover': {
                boxShadow: `1px 2px 3px 1px ${theme.palette.secondary.light}`,
                width: '25%',
              },
            }}
          >
            <Avatar
              sx={{
                aspectRatio: '1 / 1',
                height: 'auto',
                maxHeight: '180px',
                width: '90%',
                boxShadow: '1px 1px 5px rgba(0,0,0,3)',
              }}
              src={developer.photo}
              alt={developer.name}
            />
            <Typography fontSize={isSmallScreen ? '0.8em' : '1.2em'} textAlign={'center'} variant="subtitle1" sx={{ mt: 2 }}>{developer.name}</Typography>
            <Box sx={{ flexGrow: 1 }}></Box>
            {isSmallScreen ? null : (
              <Stack spacing={1} justifyContent={'end'} sx={{ width: '100%' }}>
                <Typography textAlign={'center'} variant="subtitle2">{developer.role}</Typography>
                <IconButton sx={{ alignSelf: 'center' }} href={developer.git} target="_blank" rel="noopener noreferrer">
                  <GitHub />
                </IconButton>
              </Stack>
            )}
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default Bar;
