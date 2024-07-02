import React from 'react';
import { Container, Stack, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/system';

const GameBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: '100%',
  paddingTop: '56.25%', // Aspect ratio 16:9
  position: 'relative',
}));

const HistoryBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderRadius: '1em',
}));

const MainContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.dark,
}));

const Game: React.FC = () => {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <MainContainer>
      <Stack direction="column" spacing={2}>
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            padding: theme.spacing(2),
            borderRadius: theme.shape.borderRadius,
          }}
        >
          <Typography
            variant="h4"
            component="div"
            style={{
              color: theme.palette.secondary.main,
              textAlign: 'center',
            }}
          >
            Pong Game
          </Typography>
        </Box>
        <GameBox>
          <Typography
            variant="h6"
            component="div"
            style={{
              color: theme.palette.secondary.main,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            Game
          </Typography>
        </GameBox>
        <HistoryBox>
          <Typography
            variant='h4'
            sx={{
              paddingTop: '0.2em',
              textAlign: 'center',
              width: '11ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Pong (1972)
          </Typography>
          <Typography
            variant="body2"
            sx={{
              marginBottom: '1em',
              padding: '0.5em',
              textAlign: 'justify',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderBottomLeftRadius: '1em',  
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={theme.palette.background.default} borderRadius={'1em'} padding={'1em'}>
              Pong is one of the earliest arcade video games and the first sports arcade video game. It is a table tennis sports game featuring simple two-dimensional graphics. The game was originally manufactured by Atari, which released it in 1972. Allan Alcorn created Pong as a training exercise assigned to him by Atari co-founder Nolan Bushnell. Bushnell based the idea on an electronic ping-pong game included in the Magnavox Odyssey, which later resulted in a lawsuit against Atari.
            </Box>
          </Typography>
          <Typography
            variant='h5'
            sx={{
              paddingTop: '0.2em',
              textAlign: 'center',
              width: '9ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Gameplay
          </Typography>
          <Typography
            variant="body2"
            sx={{
              marginBottom: '1em',
              padding: '0.5em',
              textAlign: 'justify',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Stack
              bgcolor={theme.palette.background.default}
              borderRadius={'1em'}
              padding={'1em'}
              direction={isSmallScreen ? 'column' : 'row'}
              spacing={2}
            >
              <Box>
                Pong is a two-player game that simulates table tennis. Players control the paddles to hit the ball back and forth. The goal is to defeat the opponent by being the first one to gain a high score. The paddles move vertically along the left or right side of the screen. Players use the paddles to hit the ball back and forth. The game can be played with two human players, or one player against a computer controlled paddle.
              </Box>
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/6/62/Pong_Game_Test2.gif"
                alt="Pong Gameplay"
                width={isSmallScreen ? '100%' : 'auto'}
                height={'auto'}
                borderRadius={'1em'}
              />
            </Stack>
          </Typography>
          <Typography
            variant='h5'
            sx={{
              paddingTop: '0.2em',
              textAlign: 'center',
              width: '12ch',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderTopLeftRadius: '0.5em',
              borderTopRightRadius: '0.5em',
            }}
          >
            Development
          </Typography>
          <Typography
            variant="body2"
            sx={{
              marginBottom: '1em',
              padding: '0.5em',
              textAlign: 'justify',
              color: theme.palette.secondary.main,
              bgcolor: theme.palette.primary.main,
              borderBottomLeftRadius: '1em',
              borderBottomRightRadius: '1em',
              borderTopRightRadius: '1em',
            }}
          >
            <Box bgcolor={theme.palette.background.default} borderRadius={'1em'} padding={'1em'}>
              The development of Pong was significant as it was one of the first video games to gain widespread popularity in both arcade and Game console formats. It led to the creation of a new industry of arcade video games, video game arcades, and home video game consoles. The success of Pong not only solidified Atari's position in the video game industry but also led to the development of many other video games and systems.
            </Box>
          </Typography>
        </HistoryBox>
      </Stack>
    </MainContainer>
  );
};

export default Game;
