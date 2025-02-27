import React, { useState } from "react";
import { User, useUser } from "../../Providers/UserContext/User";
import { TextField, Button, Typography, Box, Stack, useTheme } from "@mui/material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export const TwoFactorAuth: React.FC = () => {
	const theme = useTheme();
	const { user, setUser } = useUser();
	const [ tempCode, setCode ] = useState("");
	const [ hasError, setHasError ] = useState<boolean>(false);
	const navigate = useNavigate();

	const handleSubmit = async () => {
		try {
			// console.log("User from use user ", JSON.stringify(user));
			const url = import.meta.env.URL_BACKEND_2FA_VERIFY
			console.log("Redirection to 2FA validation backend, url: ", url);
			const response = await axios.post(import.meta.env.URL_BACKEND_2FA_VERIFY,
				{ tempCode },
				{ withCredentials: true }
			);
			console.log(response.data.valid)
			if (response.data.user) {
				const newUser: User = response.data.user;
				setUser(newUser);
			}
			navigate('/');
		} catch (error) {
			console.log(error)
			setHasError(true);
		}
		setCode("");
	};

	return (
		<Box
			minHeight={'100vh'}
			gap={'2em'}
			display={'flex'}
			flexDirection={'column'}
			justifyContent={'center'}
			alignItems={'center'}
			alignContent={'center'}
			height={'100vh'}
			padding={'2em'}
		>
			<Stack
				bgcolor={theme.palette.primary.dark}
				gap={3}
				direction={'column'}
				padding={'2em'}
				borderRadius={'1em'}
				boxShadow={'3px 9px 10px rgba(0, 0, 0, 0.5)'}
				display={'flex'}
				flexDirection={'column'}
				alignItems={'center'}
			>
				<Typography variant="body1" gutterBottom fontWeight={'bold'} color={'secondary'}>
					Enter your 6-character 2FA code.
				</Typography>
				<TextField
					autoFocus
					label="2FA Code"
					value={tempCode}
					color={hasError ? 'error' : 'secondary'}
					onChange={(e) => setCode(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							handleSubmit();
						}
					}}
					inputProps={{ maxLength: 6 }}
					InputLabelProps={{
						color: 'secondary',
					}}
					variant="outlined"
					fullWidth
					sx={{
						'& .MuiOutlinedInput-root': {
							'& fieldset': {
								borderColor: hasError ? 'error.main' : 'secondary.main', // Unfocused border color
							},
						},
					}}
				/>
				<Button
					type="submit"
					variant="contained"
					color="secondary"
					sx={{ fontWeight: 'bold' }}
					onClick={handleSubmit}
				>
					Submit
				</Button>
			</Stack>
		</Box>
	);
};

export default TwoFactorAuth;
