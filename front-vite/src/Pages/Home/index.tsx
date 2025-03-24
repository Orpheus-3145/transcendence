import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';

const ContentBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.primary.dark,
	borderRadius: '1em',
	color: theme.palette.text.primary,
	padding: theme.spacing(2),
	marginTop: theme.spacing(2),
}));

const Title = () => {
	const theme = useTheme();
	return (
		<Typography
			variant="h2"
			sx={{
				textAlign: 'center',
				color: theme.palette.secondary.main,
			}}
		>
			Transcendence
		</Typography>
	);
};

const Footer = () => {
	const theme = useTheme();
	return (
		<Typography
			variant="h5"
			sx={{
				textAlign: 'center',
				color: theme.palette.secondary.light,
			}}
		>
			developed by:
		</Typography>
	)
}

const WelcomeMessage: React.FC = () => {
	const theme = useTheme();
	return (
		<Typography
			variant="body1"
			sx={{
				textAlign: 'center',
				color: theme.palette.text.primary,
				padding: '1em 25%'
			}}
		>
			Welcome to our project! Here, you can challenge your friends to a Pong game with superpowers or start your own channel to stay in touch with all of them at once!
		</Typography>
	);
};

const UserList: React.FC<{ users: DevData[] }> = ({ users }) => {
	const theme = useTheme();
	return (
		<Box sx={{ padding: '0 30px', display: 'flex', justifyContent: 'center', gap: '1.5em', marginTop: '2em' }}>
			{users.map((user, index) => (
				<a href={user.link} style={{ textDecoration: 'none' }}>
				<Box
					key={index}
					sx={{
						borderRadius: '1em',
						padding: '1em',
						textAlign: 'center',
						display: 'flex',
						flexDirection: 'column',
						color: theme.palette.text.primary,
						justifyContent: 'center',
						gap: '15px',
						transition: 'all 0.3s',
						'&:hover': {
							transform: 'scale(1.1)',
							boxShadow: '0 1em 15px rgba(0, 0, 0, 0.3)',
							color: theme.palette.secondary.main,
						},
						marginBottom: '3em'
					}}
				>
					<img
						src={user.image}
						alt={user.name}
						style={{
							borderRadius: '50%',
							width: '120px',
							height: '120px',
							objectFit: 'cover',
							cursor: 'pointer',
						}}
					/>
					<Typography
						variant="body2"
						sx={{
							color: 'inherit',
							fontSize: '1.2em',
						}}
					>
						{user.name}
					</Typography>
				</Box>
				</a>
			))}
		</Box>
	);
};

interface DevData {
	name: string;
	image: string;
	link?: string;
}

const Home: React.FC = () => {
	let devs: DevData[] = [
		{
			name: 'yzaim',
			image: 'https://cdn.intra.42.fr/users/a36f361af8cf1e698cc99cbc3d2db280/yzaim.jpg'
		},
		{
			name: 'dhussain',
			image: 'https://cdn.intra.42.fr/users/a94aedb528f8f7e32827922b9e8165c6/dhussain.jpg'
		},
		{
			name: 'faru',
			image: 'https://cdn.intra.42.fr/users/aa36efc4c23571115933ac7aa4960a18/faru.jpg'
		},
		{
			name: 'raanghel',
			image: 'https://cdn.intra.42.fr/users/0d691e68fa643262d098d061ce3201a2/raanghel.jpg'
		},
		{
			name: 'lmuzio',
			image: 'https://cdn.intra.42.fr/users/40e671a678dd9c83196e7e66f2965c5c/lmuzio.jpg'
		},
	]

	devs = devs.map((dev) => {
		return {...dev, link:'https://profile.intra.42.fr/users/' + dev.name};
	})

	return (
		<Container sx={{
			display: 'flex',
			justifyContent: 'center'
		}}>
			<ContentBox>
				<Title />
				<WelcomeMessage />

				<Footer />
				<UserList users={devs} />
			</ContentBox>
		</Container>
	);
};

export default Home;
