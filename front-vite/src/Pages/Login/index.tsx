// import React from 'react';
// import axios from 'axios';
// import { Box, Stack, Button, useTheme, Typography } from '@mui/material';

// const LoginPage: React.FC = () => {
// 	const theme = useTheme();

// 	async function goAuth() {
// 		try {
// 			// Redirect to Intra42 login
// 			window.location.href = import.meta.env.URL_INTRA_AUTH as string;
// 		} catch (error) {
// 			console.error('Error starting authentication:', error);
// 		}
// 	}


// 	return (
// 		<Box
// 			sx={{
// 				gap: '2em',
// 				display: 'flex',
// 				flexDirection: 'column',
// 				justifyContent: 'center',
// 				alignItems: 'center',
// 				height: '100vh',
// 				bgcolor: 'background.default',
// 				padding: '2em',
// 			}}
// 		>
// 			<Typography
// 				variant='h2'
// 				sx={{
// 					color: 'secondary.main',
// 					textAlign: 'center',
// 					fontWeight: 'bold',
// 				}}
// 			>
// 				{import.meta.env.PROJECT_NAME}
// 			</Typography>
// 			<Typography
// 				variant='body1'
// 				sx={{
// 					color: 'text.secondary',
// 					textAlign: 'center',
// 				}}
// 			></Typography>
// 			<Button
// 				variant='contained'
// 				color='primary'
// 				onClick={goAuth}
// 				sx={{
// 					padding: '0.8em 2em',
// 					fontSize: '1em',
// 					fontWeight: 'bold',
// 					textTransform: 'none',
// 					boxShadow: `0 3px 5px 2px ${theme.palette.primary.dark}`,
// 					':hover': {
// 						bgcolor: `${theme.palette.primary.main}`,
// 						boxShadow: `0 5px 7px 2px ${theme.palette.primary.main}`,
// 					},
// 				}}
// 			>
// 				SIGN IN
// 			</Button>
// 		</Box>
// 	);
// };

// export default LoginPage;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, useTheme, Typography, TextField, Alert } from '@mui/material';
import { useUser } from '../../Providers/UserContext/User';

const LoginPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { setUser } = useUser(); // Update user in global state

    const [userId, setUserId] = useState<number | null>(null);
    const [token, setToken] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const [error, setError] = useState('');

	useEffect(() => {
		async function checkAuth() {
			try {
				const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/status`, {
					withCredentials: true,
				});

				console.log("Auth Status Response:", response.data); // Debugging

				if (response.data.isAuthenticated) {
					if (response.data.requires2FA) {
						console.log("2FA Required, setting userId:", response.data.userId);
						setUserId(response.data.userId); // Ensure userId is set
						setShow2FA(true);
					} else {
						setUser(response.data.user);
						navigate('/home');
					}
				}
			} catch (error) {
				console.error('Authentication check failed:', error);
				setError('Failed to check authentication. Please try again.');
			}
		}

		checkAuth();
	}, [navigate, setUser]);


    async function goAuth() {
        try {
            window.location.href = import.meta.env.VITE_URL_INTRA_AUTH as string;
        } catch (error) {
            console.error('Error starting authentication:', error);
            setError('Could not start authentication. Please try again.');
        }
    }

    async function verify2FA() {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/verify-2fa`,
                { userId, token },
                { withCredentials: true }
            );

            if (response.data.success) {
                setUser(response.data.user);
                navigate('/home');
            } else {
                setError('Invalid 2FA token. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying 2FA:', error);
            setError('Failed to verify 2FA. Check your token and try again.');
        }
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                bgcolor: 'background.default',
                padding: '2em',
                gap: '2em',
            }}
        >
            <Typography variant="h2" sx={{ color: 'secondary.main', textAlign: 'center', fontWeight: 'bold' }}>
                {import.meta.env.VITE_PROJECT_NAME}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}

            {!show2FA ? (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={goAuth}
                    sx={{
                        padding: '0.8em 2em',
                        fontSize: '1em',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: `0 3px 5px 2px ${theme.palette.primary.dark}`,
                        ':hover': {
                            bgcolor: theme.palette.primary.main,
                            boxShadow: `0 5px 7px 2px ${theme.palette.primary.main}`,
                        },
                    }}
                >
                    SIGN IN
                </Button>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1em', width: '300px' }}>
                    <Typography variant="h6" sx={{ textAlign: 'center' }}>
                        Enter 2FA Code
                    </Typography>
                    <TextField
                        label="2FA Token"
                        variant="outlined"
                        fullWidth
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        error={!!error}
                    />
                    <Button variant="contained" color="primary" onClick={verify2FA}>
                        Verify 2FA
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default LoginPage;
