import React from 'react';
import { CssBaseline, Container, Stack, Box, Typography, useTheme } from '@mui/material';
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
}));

const MainContainer = styled(Container)(({ theme }) => ({
  paddingLeft: '10em',
  paddingRight: '10em',
}));

const Home: React.FC = () => {
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
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
            <Typography variant="h6">Game History</Typography>
            <Typography variant="body2">
              Here you can put the history of the game.
            </Typography>
          </HistoryBox>
        </Stack>
      </MainContainer>
    </>
  );
};

export default Home;
