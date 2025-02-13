import React, { useState, useEffect } from 'react';
import {
	Container,
	Typography,
	TextField,
	Button,
	Box,
	Avatar,
	Switch,
	FormControlLabel,
} from '@mui/material';
import { styled, useTheme } from '@mui/system';
import axios from 'axios';
import { useUser } from '../../Providers/UserContext/User';

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

const UserSettings = () => {
	const theme = useTheme();
	const [is2FAEnabled, setIs2FAEnabled] = useState(false);
	const intraId = useUser().user.intraId; // Replace with the actual userId from session or context
	console.log(`useuser: ${JSON.stringify(useUser().user)}`);
	// ✅ Fetch 2FA status when component mounts
	useEffect(() => {
		const fetch2FAStatus = async () => {
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_2FA_STATUS + `?intraId=${intraId}`);
				
				setIs2FAEnabled(response.data.is2FAEnabled);
			} catch (error) {
				console.error('Error fetching 2FA status:', error);
			}
		};
		fetch2FAStatus();
	}, []);

	// ✅ Handle 2FA toggle
	const handle2FAToggle = async (event) => {
		const isEnabled = event.target.checked;
		setIs2FAEnabled(isEnabled);

		try {
			// ✅ Send userId as a query param instead of body
			console.log(`Enalbed: ${isEnabled}`);
			const url = isEnabled
				? import.meta.env.URL_BACKEND_ENABLE + `?intraId=${intraId}`
				: import.meta.env.URL_BACKEND_DISABLE + `?intraId=${intraId}`;

			const response = await axios.get(url);

			console.log(`2FA ${isEnabled ? 'enabled' : 'disabled'} successfully`);
			console.log(response.data);
		} catch (error) {
			console.error('Error updating 2FA:', error);
			setIs2FAEnabled(!isEnabled); // Revert state on failure
		}
	};

	return (
		<SettingsContainer>
			<Typography variant='h4' gutterBottom style={{ color: theme.palette.text.primary }}>
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

			{/* ✅ 2FA Toggle */}
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
		</SettingsContainer>
	);
};

export default UserSettings;
