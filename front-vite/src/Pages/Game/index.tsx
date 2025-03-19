import React from 'react';
import { Container, Stack, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { margin, styled } from '@mui/system';

import GameComponent from '/app/src/Pages/Game/GameComponent';
import { List, ListItem, ListItemText } from '@mui/material';


// const HistoryBox = styled(Box)(({ theme }) => ({
// 	backgroundColor: theme.palette.background.default,
// 	color: theme.palette.text.primary,
// 	padding: theme.spacing(2),
// 	marginTop: theme.spacing(2),
// 	borderRadius: '1em',
// }));

const MainContainer = styled(Container)(({ theme }) => ({
	padding: theme.spacing(3),
	marginBottom: theme.spacing(2),
	backgroundColor: theme.palette.primary.dark,
}));

const ContentBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.primary.dark,
	borderRadius: '1em',
	color: theme.palette.text.primary,
	padding: theme.spacing(2),
	marginTop: theme.spacing(2),
}));

const Game: React.FC = () => {
	const theme = useTheme();

	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	return (
		<MainContainer>
			<Stack direction='column' spacing={2}>
				{/* <Box
					sx={{
						backgroundColor: theme.palette.primary.main,
						padding: theme.spacing(2),
						borderRadius: theme.shape.borderRadius,
					}}
				> */}
				<Typography
					variant='h3'
					component='div'
					style={{
						color: theme.palette.secondary.main,
						textAlign: 'center',
						fontWeight: 'bold'
					}}
				>
					Pong
				</Typography>
				{/* </Box> */}
				<ContentBox>
					<Typography
						variant='h5'
						sx={{
							paddingTop: '0.5em',
							textAlign: 'center',
							width: '20ch',
							fontWeight: 'bold',
							color: theme.palette.secondary.main,
							// bgcolor: theme.palette.primary.main,
							// borderTopLeftRadius: '0.5em',
							// borderTopRightRadius: '0.5em',
						}}
					>
						Development & Impact
					</Typography>
					<Typography
						variant='body'
						sx={{
							marginBottom: '2em',
							// padding: '0.5em',
							paddingBottom: '1em',
							textAlign: 'justify',
							// color: theme.palette.secondary.main,
							// bgcolor: theme.palette.primary.main,
							borderBottomLeftRadius: '0.5em',
							borderBottomRightRadius: '0.5em',
							borderTopRightRadius: '0.5em',
							borderTopLeftRadius: '0.5em',
						}}
					>
						<Box bgcolor={theme.palette.background.default} borderRadius={'1em'} padding={'1em'}>
							Pong is one of the earliest arcade video games and the first sports arcade video game.
							It is a table tennis sports game featuring simple two-dimensional graphics. The game
							was originally manufactured by Atari, which released it in 1972. Allan Alcorn created
							Pong as a training exercise assigned to him by Atari co-founder Nolan Bushnell.
							Bushnell based the idea on an electronic ping-pong game included in the Magnavox
							Odyssey, which later resulted in a lawsuit against Atari.

							Pong was one of the first video games to achieve widespread success, helping to establish 
							the arcade gaming industry and home video game consoles. Its popularity secured Atari's place 
							in gaming history and paved the way for future video games and systems.
						</Box>
					</Typography>
					<Typography
						variant='h5'
						sx={{
							paddingTop: '0.5em',
							textAlign: 'center',
							width: '9ch',
							color: theme.palette.secondary.main,
							fontWeight: 'bold'
							// bgcolor: theme.palette.primary.main,
							// borderTopLeftRadius: '0.5em',
							// borderTopRightRadius: '0.5em',
						}}
					>
						Gameplay
					</Typography>
					<Typography
						variant='body'
						sx={{
							marginBottom: '2em',
							// padding: '0.5em',
							textAlign: 'justify',
							// color: theme.palette.secondary.main,
							// bgcolor: theme.palette.primary.main,
							// borderBottomLeftRadius: '1em',
							// borderBottomRightRadius: '1em',
							// borderTopRightRadius: '1em',
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
								Pong is a two-player game that simulates table tennis. 
								Players control paddles that move vertically along the 
								left and right sides of the screen to hit a bouncing ball. 
								The goal is to outscore the opponent. The game can be 
								played against another player or a computer-controlled paddle.

							</Box>
							<Box
								component='img'
								src='https://upload.wikimedia.org/wikipedia/commons/6/62/Pong_Game_Test2.gif'
								alt='Pong Gameplay'
								width={isSmallScreen ? '100%' : 'auto'}
								height={'auto'}
								borderRadius={'0.5em'}
							/>
						</Stack>
					</Typography>
					<Typography
						variant="h5"
						sx={{
							paddingTop: '0.5em',
							width: '20ch',
							fontWeight: 'bold',
							color: theme.palette.secondary.main,
						}}
					>
						How to Play
					</Typography>
					<Box bgcolor={theme.palette.background.default} borderRadius="1em" padding="1em">
						<Typography variant="h5" sx={{ fontWeight: 'bold', marginTop: '0.5em', marginBottom: '0.5em' }}>
							Move your paddle
						</Typography>
						<Typography variant="body1" sx={{margin: '1em'}}>
							⬆ / ⬇ keys <strong>OR</strong> W / S keys
						</Typography>
						<Typography variant="h5" sx={{ fontWeight: 'bold', marginTop: '1em' }}>
							Choose Power Ups
						</Typography>
						<List sx={{ listStyleType: 'none', pl:0 }}>
							<ListItem sx={{ display: 'list-item' }}>
								<ListItemText primary={<><strong>speedBall:</strong> Hit the ball harder </>} />
							</ListItem>
							<ListItem sx={{ display: 'list-item' }}>
								<ListItemText  primary={<><strong>speedPaddle:</strong> Your paddle moves faster</>} />
							</ListItem>
							<ListItem sx={{ display: 'list-item' }}>
								<ListItemText primary={<><strong>slowPaddle:</strong> Your opponent's paddle moves slower</>} />
							</ListItem>
							<ListItem sx={{ display: 'list-item' }}>
								<ListItemText primary={<><strong>shrinkPaddle:</strong> Shrink your opponent's paddle</>} />
							</ListItem>
							<ListItem sx={{ display: 'list-item' }}>
								<ListItemText primary={<><strong>stretchPaddle:</strong> Stretch your paddle</>} />
							</ListItem>
						</List>
					</Box>

				</ContentBox>
				<GameComponent />
			</Stack>
		</MainContainer>
	);
};

export default Game;
