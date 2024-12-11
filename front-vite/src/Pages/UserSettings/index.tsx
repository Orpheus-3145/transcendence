import React from 'react';
import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box, Avatar, Switch, FormControlLabel } from '@mui/material';
import { Stack, Divider, Grid, IconButton } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { fetchFriend, getUserFromDatabase, User, useUser } from '../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';

const SettingsContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(4),
  // boxShadow: theme.shadows[3],
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
  const theme = useTheme();
  const { user } = useUser();
  const navigate = useNavigate();
  const [userProfileNumber, setUserProfileNumber] = useState<number | null>(null);
	const [blockedList, setBlockedList] = useState<string[]>([]);
	const [friendDetails, setFriendDetails] = useState<Map<string, User>>(new Map());
	
	const fetchFriendDetails = async (friendId: string) => {
		const friend = await fetchFriend(friendId);
		setFriendDetails((prev) => new Map(prev).set(friendId, friend));
	};

	let blockUser = (id:string) =>
	{
		const friend = friendDetails.get(id);

		if (!friend) {
			fetchFriendDetails(id);
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
						src={friend.image}
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
							<a href="" onClick={() => redirectFriend(friend.id)}>{friend.nameNick}</a>
						</Typography>
					</Stack>
				</Stack>
			</Box>
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
			<Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
				User Account
			</Typography>
			<TextField
				fullWidth
				label="Unique Name"
				variant="outlined"
				margin="normal"
				InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
				InputProps={{
				style: { color: theme.palette.text.primary },
				}}
			/>
			<ProfileAvatar src="/static/images/avatar/1.jpg" />
			<Button variant="contained" component="label">
				Upload Avatar
				<input type="file" hidden />
			</Button>
			</SettingsSection>

			<SettingsSection>
			<Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
				Security
			</Typography>
			<FormControlLabel
				control={<Switch color="primary" />}
				label="Two-Factor Authentication"
				labelPlacement="start"
				style={{ marginLeft: 0 }}
			/>
			</SettingsSection>
			<SettingsSection>
			<Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
				Status
			</Typography>
			<TextField
				fullWidth
				label="Status Message"
				variant="outlined"
				margin="normal"
				InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
				InputProps={{
				style: { color: theme.palette.text.primary },
				}}
			/>
			</SettingsSection>
			<Button variant="contained" color="primary">
			Save Changes
			</Button>

			<SettingsSection>
			<Typography variant="h6" gutterBottom style={{ color: theme.palette.text.primary }}>
				Blocked Users:
			</Typography>
			{blockedList.map((blockedId:string) => blockUser(blockedId))}
			</SettingsSection>
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
		
	let whichPage = () =>
	{
		useEffect(() => 
		{
			getUserProfile().then((number) => 
			{
				setUserProfileNumber(number);
			});
		}, [blockedList]);
		
		if (userProfileNumber === null) 
			return <Stack>Loading...</Stack>;
		
		return pageWrapper();
	}

	return (
		whichPage()
	);
};

export default UserSettings;


