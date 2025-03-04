import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/system';
import axios from 'axios';
import { Container, Typography, TextField, Button, Box, Avatar, Switch, FormControlLabel, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { Stack, Divider, Grid, IconButton } from '@mui/material';
import { fetchFriend, getUserFromDatabase, User, useUser, unBlockFriend } from '../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';

const SettingsContainer = styled(Container)(({ theme }) => ({
	padding: theme.spacing(3),
	backgroundColor: theme.palette.background.paper,
	borderRadius: theme.shape.borderRadius,
	marginTop: theme.spacing(4),
}));

const SettingsSection = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(4),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
	width: theme.spacing(10),
	height: theme.spacing(10),
	marginBottom: theme.spacing(2),
}));

const UserSettings: React.FC = () => {
	const navigate = useNavigate();
  	const [userProfileNumber, setUserProfileNumber] = useState<number | null>(null);
	const [blockedList, setBlockedList] = useState<string[]>([]);
	const [blockedDetails, setBlockedDetails] = useState<Map<string, User>>(new Map());
	
	const theme = useTheme();
	const { user, setUser } = useUser();
	const intraId = user.intraId;

	// State
	const [is2FAEnabled, setIs2FAEnabled] = useState(user?.twoFactorSecret || false);
	const [qrCode, setQrCode] = useState<string | null>('');
	const [secret, setSecret] = useState('');
	// const [otp, setOtp] = useState('');
	const [openQRDialog, setOpenQRDialog] = useState(false);
	const [verificationCode, setVerificationCode] = useState('');
	const [error, setError] = useState(false);


	const check2FAStatus = async () => {
		try {
			const response = await axios.get(import.meta.env.URL_BACKEND_2FA_STATUS + `?intraId=${intraId}`);
		} catch (error) {}
	};
	// Fetch 2FA status on mount
	useEffect(() => {
		const fetch2FAStatus = async () => {
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_2FA_STATUS + `?intraId=${intraId}`);
				setIs2FAEnabled(response.data.is2FAEnabled);
			} catch (error) {}
		};
		fetch2FAStatus();
	}, [intraId]);

	// Handle 2FA Toggle
	const handle2FAToggle = async (event) => {
		const enable2FA = event.target.checked;
		
		if (enable2FA) {
			// User wants to enable 2FA → Generate QR Code
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_QR_GENERATE);
				setQrCode(response.data.qrCode);
				setSecret(response.data.secret)
				setOpenQRDialog(true);
			} catch (error) {
				console.error('Error generating QR Code:', error);
			}
		} else {
			// User wants to disable 2FA → Disable immediately
			try {
				const response = await axios.post(import.meta.env.URL_BACKEND_2FA_DELETE + `?intraId=${intraId}`);
				setIs2FAEnabled(false);
				check2FAStatus();
			} catch (error) {}
		}
	};

	// Verify Code After Scanning QR
	const handleVerifyQR = async () => {
		try {
			const response = await axios.post(import.meta.env.URL_BACKEND_QR_VERIFY, {
				intraId,
				secret,
				token: verificationCode
			});
			check2FAStatus();
			if (response.data.success) {
				setIs2FAEnabled(true);
				setUser({ ...user, twoFactorEnabled: true });
				setOpenQRDialog(false);
			} else {
				setError(true);
			}
		} catch (error) {
			console.error('Error verifying 2FA:', error);
			setError(true);
		}
	}

	const fetchBlockedDetails = async (blockedId: string) => {
		const blocked = await fetchFriend(blockedId);
		setBlockedDetails((prev) => new Map(prev).set(blockedId, blocked));
	};

	let redirectUser = (id:number) =>
	{
		navigate('/profile/' + id.toString());
		
	}

	let unBlockUser = (id:string) =>
	{
		unBlockFriend(user.id, id);
	}

	let buttonUnblockUser = (id:string) =>
	{
		return (
			<Button variant="contained"
				onClick={() => unBlockUser(id)}
			>
				UNBLOCK
			</Button>
		);
	} 

	let blockUser = (id:string) =>
	{
		const blocked = blockedDetails.get(id);

		if (!blocked) {
			fetchBlockedDetails(id);
			return <Stack></Stack>;
		}

		return (
			<Box>
				<Stack direction={'row'}
					sx={{
						cursor: 'pointer',
						justifyContent: 'space-between',
						paddingX: '1em',
						alignItems: 'center',
					}}
				>
					<Stack direction={'row'} 
						spacing={2} 
						alignContent='center' 
						alignItems={'center'} 
						marginY={theme.spacing(.5)}
					>
						<Avatar
						sx={{
							width: '40px',
							height: '40px',
							left: '-5px',
							bgcolor: theme.palette.primary.light,
						}}
						src={blocked.image}
						>
						</Avatar>
						<Typography 
							sx={{
								'& a': {
									textDecoration: 'none',
									color: theme.palette.secondary.main,
									'&:hover': { 
										color: theme.palette.secondary.dark
									}
								},
							}}
						>
							<a href="" onClick={() => redirectUser(blocked.id)}>{blocked.nameNick}</a>
						</Typography>
						{buttonUnblockUser(id)}
					</Stack>
				</Stack>
			</Box>
		);		
	}

	let blockedWrapper = () =>
	{
		if (blockedList.length == 0)
		{
			return (
				<Stack>
					<Typography variant="h7">
						You have no blocked users, how friendly!
					</Typography>
				</Stack>
			);
		}
		return (
			blockedList.map((blockedId:string) => blockUser(blockedId))
		);
	}

	let pageWrapper = () =>
	{
		return (
			<SettingsContainer>
			<Typography variant="h4" gutterBottom style={{ color: theme.palette.text.primary }}>
			User Settings
			</Typography>

			<SettingsSection>
				<Typography variant='h6' gutterBottom style={{ color: theme.palette.text.primary }}>
					User Account
				</Typography>
				<TextField
					fullWidth
					label='Unique Name'
					variant='outlined'
					margin='normal'
					InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
					InputProps={{ style: { color: theme.palette.text.primary } }}
				/>
				<ProfileAvatar src='/static/images/avatar/1.jpg' />
				<Button variant='contained' component='label'>
					Upload Avatar
					<input type='file' hidden />
				</Button>
			</SettingsSection>

			<SettingsSection>
				<Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
					Blocked Users:
				</Typography>
				{blockedWrapper()}
			</SettingsSection>

			{/* 2FA Toggle */}
			<SettingsSection>
				<Typography variant='h6' gutterBottom style={{ color: theme.palette.text.primary }}>
					Security
				</Typography>
				<FormControlLabel
					control={<Switch checked={is2FAEnabled} onChange={handle2FAToggle} color='primary' />}
					label='Two-Factor Authentication'
					labelPlacement='start'
					style={{ marginLeft: 0 }}
				/>
			</SettingsSection>

			<SettingsSection>
				<Typography variant='h6' gutterBottom style={{ color: theme.palette.text.primary }}>
					Status
				</Typography>
				<TextField
					fullWidth
					label='Status Message'
					variant='outlined'
					margin='normal'
					InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
					InputProps={{ style: { color: theme.palette.text.primary } }}
				/>
			</SettingsSection>

			<Button variant='contained' color='primary'>
				Save Changes
			</Button>

			{/* 2FA Verification Dialog */}
			<Dialog open={openQRDialog} onClose={() => setOpenQRDialog(false)}>
				<DialogTitle>Scan QR Code</DialogTitle>
				<DialogContent>
					{qrCode ? <img src={qrCode} alt="2FA QR Code" style={{ width: '100%' }} /> : 'Loading QR Code...'}
					<Typography variant="body2" style={{ marginTop: '1em' }}>
						Enter the 6-digit code from your authentication app.
					</Typography>
					<TextField
						fullWidth
						error={error}
						helperText={error ? 'Invalid verification code' : ''}
						label="Verification Code"
						variant="outlined"
						margin="normal"
						value={verificationCode}
						onChange={(e) => {
							setVerificationCode(e.target.value);
							setError(false); // Reset error when new input comes in
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								handleVerifyQR();
							}
						}}
						selectTextOnFocus // Highlights text when focused
					/>

				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenQRDialog(false)} color="secondary">Cancel</Button>
					<Button onClick={handleVerifyQR} color="primary" variant="contained">Verify</Button>
				</DialogActions>
			</Dialog>
		</SettingsContainer>
		);
	}
	
	let getUserProfile = async () : Promise<void> =>
	{
		const tmp = await getUserFromDatabase(user.id.toString(), navigate);
		
		if (user.id == tmp.id)
		{
			setBlockedList(tmp.blocked);
		}
	}
		
	useEffect(() => 
	{
		getUserProfile().then((number) => 
		{
			setUserProfileNumber(number);
		});
	}, []);

	let whichPage = () =>
	{
		
		if (userProfileNumber === null) 
			return <Stack>Loading...</Stack>;
		return pageWrapper();
	}

	return (
		whichPage()
	);
};

export default UserSettings;

