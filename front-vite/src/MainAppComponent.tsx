import React from 'react';
import { Bar as Header } from './Layout/Header/HeaderBar';
import { Bar as Footer } from './Layout/Footer/FooterBar';
import Main from './Layout/Main/index';
import { Box, Container, CssBaseline, Divider } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Styles/themeOptions';
import { useUser } from './Providers/UserContext/User';
import './mainAppComponent.css';

const MainAppComponent: React.FC = () => {
	const theme = createTheme(themeOptions);
	const { user } = useUser();

	return (
		<ThemeProvider theme={theme}>
			{user.id !== 0 && <Header />}
			<CssBaseline />
			<Container maxWidth='xl'>
				<Box marginTop={user.id === 0 ? '0em' : '4em'}>
					<Main />
				</Box>
			</Container>
			<Divider
				orientation='horizontal'
				sx={{
					backgroundColor: theme.palette.background.default,
					width: '0.01em',
					minWidth: '100%',
				}}
			/>
			<Footer />
		</ThemeProvider>
	);
};

export default MainAppComponent;
