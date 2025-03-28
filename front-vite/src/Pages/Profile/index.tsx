import React from 'react';
import { Avatar, Box, Stack, Typography, useTheme, Divider, Grid, IconButton, Container, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, styled, FormControlLabel, Switch } from '@mui/material';
import {Input} from '@mui/material'
import { useMediaQuery, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
	EmojiEvents as Cup,
	Block as BlockIcon,
	PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import EditIcon from '@mui/icons-material/Edit';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePageOther from './other'
import { useUser,
		getUserFromDatabase, 
		setNewNickname, 
		fetchFriend, 
		removeFriend, 
		blockFriend, 
		changePFP, 
		fetchRatios,
		fetchOpponent,
		fetchMatchData} from '../../Providers/UserContext/User';
import { socket } from '../../Providers/NotificationContext/Notification';
import { User, MatchData, MatchRatio } from '../../Types/User/Interfaces';
import { UserStatus } from '../../Types/User/Enum';
import '../../Styles/profile.css'
import axios from 'axios';


const ProfilePage: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const isSmallScreen = useMediaQuery('(max-width:1275px)');
	const { user, setUser } = useUser();
	const intraId = user.intraId;
	const location = useLocation();
	const pathSegments = location.pathname.split('/');
	const lastSegment = pathSegments[pathSegments.length - 1]
	const [showInputMessage, setShowInputMessage] = useState<Boolean>(false);
	const [showInput, setShowInput] = useState<Boolean>(false);
	const [inputValue, setInputValue] = useState<string>("");
	const [ownPage, showOwnPage] = useState<Boolean>(false);
	const [userProfile, setUserProfile] = useState<User | null>(null);
	const [userProfileNumber, setUserProfileNumber] = useState<number | null>(null);
	const [showMessage, setShowMessage] = useState<Boolean>(false);
	const [messageErrorNickname, setMessageErrorNickname] = useState<string>("");
	const [profileImage, setProfileImage] = useState<string>("");
	const [friendsList, setFriendsList] = useState<string[]>([]);
	const [friendDetails, setFriendDetails] = useState<Map<string, User>>(new Map());
	const [opponentDetails, setOpponentDetails] = useState<Map<string, User>>(new Map());
	const [whichStatus, setWhichStatus] = useState<UserStatus>(UserStatus.Offline);
	const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
	const [ratioArr, setRatioArr] = useState<MatchRatio[]>([]);
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
			await axios.get(import.meta.env.URL_BACKEND_2FA_STATUS + `?intraId=${intraId}`, {withCredentials: true});
		} catch (error) {}
	};

	// Handle 2FA Toggle
	const handle2FAToggle = async (event) => {
		const enable2FA = event.target.checked;
		
		if (enable2FA) {
			// User wants to enable 2FA → Generate QR Code
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_QR_GENERATE, {withCredentials: true});
				setQrCode(response.data.qrCode);
				setSecret(response.data.secret)
				setOpenQRDialog(true);
			} catch (error) {
				console.error('Error generating QR Code:', error);
			}
		} else {
			// User wants to disable 2FA → Disable immediately
			try {
				await axios.post(import.meta.env.URL_BACKEND_2FA_DELETE + `?intraId=${intraId}`, {}, {withCredentials: true});
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
				token: verificationCode},
				{withCredentials: true});
			check2FAStatus();
			if (response.data.success) {
				setIs2FAEnabled(true);
				setOpenQRDialog(false);
			} else {
				setError(true);
			}
		} catch (error) {
			console.error('Error verifying 2FA:', error);
			setError(true);
		}
	}

	const SettingsSection = styled(Box)(({ theme }) => ({
		marginBottom: theme.spacing(0),
	}));

	const TwoFactorToggle = () => {
		return (
			<SettingsSection
				className="twoFA"
			>
				<br/>
				<b>Two-Factor Authentication:</b>
				<br/>
				<FormControlLabel
					control={<Switch checked={is2FAEnabled} onChange={handle2FAToggle} color='primary' />}
				/>
			</SettingsSection>
		)
	}
	
	const TwoFactorDialog = () => {
		return (
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
		)
	}

	let RemoveFriend = (id:string) => {
		var newlist: string[] = friendsList.filter((friend: String) => friend !== id);
		setFriendsList(newlist);
		removeFriend(userProfile.id.toString(), id);
	}

	let BlockFriend = (id:string) => {
		var newlist: string[] = friendsList.filter((friend: string) => friend !== id);
		setFriendsList(newlist);
		blockFriend(userProfile.id.toString(), id);
	}

	let friendLineButtons = (intraid:string) => 
	{
		return (
			<Stack direction={'row'} 
				alignContent='center' 
				alignItems={'center'} 
				marginY={theme.spacing(.5)}
			>
				<Grid container gap={1} justifyContent={'center'} alignContent={'center'} flexGrow={1}></Grid>
				<Grid item>
					<Tooltip title="Remove user from friendlist!" arrow>
						<IconButton
							variant="contained"
							onClick={() => {RemoveFriend(intraid)}}
							sx={{
								color: theme.palette.secondary.light, 
								cursor: 'pointer', 
								'&:hover': { 
									color: theme.palette.error.dark 
								},
							}}
						>
							<PersonOffIcon />
						</IconButton>
					</Tooltip>
				</Grid>
				<Grid item>
					<Tooltip title="Block user!" arrow>
						<IconButton
							variant="contained"
							onClick={() => {BlockFriend(intraid)}}
							sx={{color: theme.palette.secondary.light, 
								cursor: 'pointer', 
								'&:hover': { 
									color: theme.palette.error.dark,
								},
							}}
						>
							<BlockIcon />
						</IconButton>
					</Tooltip>
				</Grid>
			</Stack>
		);
	}

	let redirectFriend = (id:number) =>
	{
		navigate('/profile/' + id.toString());
	}

	const fetchFriendDetails = async (friendId: string) => {
		const friend = await fetchFriend(friendId);
		setFriendDetails((prev) => new Map(prev).set(friendId, friend));
	};

	let friendLine = (intraid:string) => 
	{
		const friend = friendDetails.get(intraid);
		
		if (!friend) {
			fetchFriendDetails(intraid);
			return <Stack></Stack>;
		}
		var namenick = friend.nameNick;
		if (namenick?.length > 10)
		{
			namenick = namenick?.slice(0, 10) + "...";
		}

		return (
			<Stack key={intraid} 
				direction={'row'}
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
					<Button onClick={() => redirectFriend(friend.id)}> 
						<Typography 
							sx={{
								textDecoration: 'none',
								color: theme.palette.secondary.main,
								'&:hover': { 
									color: theme.palette.secondary.dark
								},
								textTransform: 'none',
							}}
						>
							{namenick}
						</Typography>
					</Button>
				</Stack>
				{friendLineButtons(intraid)}
			</Stack>
		);
	};

	let friendCategory = () => 
	{
		return (
			<Stack 
				direction='column'
				bgcolor={theme.palette.primary.main}
				spacing={'0.3em'}
				marginY={'0.3em'}
				sx={{
					minWidth: '250px',
					width: '100%',
					backgroundColor: alpha(theme.palette.background.default, 0.05),
					'&:hover': {
						backgroundColor: alpha(theme.palette.background.default, 0.1),
					},
					'& > *': {
						alignItems: 'center',
						height: '3em',
						color: theme.palette.secondary.main,
						borderRadius: '2em',
						marginY: '0.3em',
						boxShadow: `0px ${theme.spacing(0.5)} ${theme.spacing(0.75)} rgba(0, 0, 0, 0.2)`,
						backgroundColor: alpha(theme.palette.background.default, 0.5),
						transition: 'border-radius 0.2s ease',
						'&:hover': {
							backgroundColor: alpha(theme.palette.background.default, 0.7),
							borderRadius: '0',
						},
					},
				}}
			>
				{friendsList.map((friend: string, index: number) => (
					<React.Fragment key={index}>
						{friendLine(friend)}
					</React.Fragment>
				))}


			</Stack>
		);
	};

	let friendsBox = () => 
	{
		return (
			<Stack
				gap={1}
				border={1}
				borderColor={theme.palette.divider}
				maxHeight={isSmallScreen ? '80vh' : '80vh'}
			>
				<Box
					alignContent={'center'}
					justifyContent={'center'}
					textAlign={'center'}
					marginTop={1}
				>
					<Typography variant="h5" component="h2" align={'center'}>
						Friends
					</Typography>
				</Box>
				<Stack
					divider={<Divider />}
					gap={1}
					border={1}
					borderColor={theme.palette.divider}
					sx={{
						height: '100%',
						overflowY: 'scroll',
					}}
				>
					{friendCategory()}
				</Stack>
			</Stack>
		);
	};

	let gameStatsBox = (data: MatchRatio) =>
	{
		return (
			<Stack
			direction="column"
			flex={{ xs: '1 1 100%', sm: '1 1 33%' }}
			justifyContent="center"
			alignItems="center"
			padding="0.3em"
			>
				<Stack
					gap={1}
					direction="row"
				>
					<Stack
						direction="column"
						textAlign="center"
						alignItems="center"
						justifyContent="center"
						sx={{
							position: 'relative',
							left: '-10px',
						}}
					>
						<Typography>{data.title}</Typography>
						<Typography>{data.wonGames}/{data.totGames}</Typography>
					</Stack>
					<Stack
						direction="column"
						alignItems="center"
						sx={{
							position: 'relative',
							left: '10px',
						}}
					>
						<Tooltip title="Win Ratio" arrow>
						<Cup sx={{ color: (theme) => theme.palette.secondary.main }} />
						</Tooltip>
						<Typography>{
						(data.totGames === 0) ? 0 :	Math.round((data.wonGames / data.totGames) * 100)
						}%</Typography>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	let gameStats = () => 
	{
		return (
			<Box
				sx={{
					width: '100%',
					borderBottom: 2,
					borderColor: 'divider',
					padding: '0.3em',
					bgcolor: (theme) => alpha(theme.palette.background.default, 0.1)
				}}
			>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					width="100%"
					gap={2}
					justifyContent="space-around"
					divider={<Divider orientation="vertical" flexItem />}
				>
					{ratioArr.map((group: MatchRatio, index: number) => (
						<React.Fragment key={index}>
							{gameStatsBox(group)}
						</React.Fragment>
					))}
				</Stack>
			</Box>
		);
	};

	const fetchOpponentDetails = async (intraName: string) => {
		const opponent = await fetchOpponent(intraName);
		setOpponentDetails((prev) => new Map(prev).set(intraName, opponent));
	};

	let gameLine = (data: MatchData) => {
		var opponent: User | undefined;
		var intra: string;
		var nameOther: string;
		var scoreUser: number;
		var scoreOther: number;
		var color: string;
		var idOther: number;
		var ttMessage: string;
		
		if (data.player1 === userProfile?.nameIntra)
		{
			scoreUser = data.player1Score;
			scoreOther = data.player2Score;
			intra = data.player2;
			opponent = opponentDetails.get(intra);
			if (opponent)
			{
				nameOther = opponent.nameNick as string;
				idOther = opponent.id;
			}
		}
		else
		{
			scoreUser = data.player2Score;
			scoreOther = data.player1Score;
			intra = data.player1;
			opponent = opponentDetails.get(intra);
			if (opponent)
			{
				nameOther = opponent.nameNick as string;
				idOther = opponent.id;
			}
		}

		if (!opponent) {
			fetchOpponentDetails(intra);
			return <Stack>Loading...</Stack>;
		}

		if (data.winner === userProfile?.nameIntra)
		{
			color = '#1da517'
			ttMessage = "Won";
			if (data.forfeit)
			{
				color = '#889000';
				ttMessage = "Won by Forfeit";
			}
		}
		else
		{
			color = '#b01515';
			ttMessage = "Lost";
			if (data.forfeit)
			{
				color = '#ff7500';
				ttMessage = "Lost by Forfeit";
			}
		}

		var leftName: string = "10px";
		if (isSmallScreen)
			leftName = "-30px";

		return (
			<Tooltip title={ttMessage} arrow>
				<Stack
					direction={isSmallScreen ? 'column' : 'row'}
					justifyContent="space-around"
					alignItems="center"
					bgcolor={color}
					borderRadius="2em"
					padding="0.3em"
				>
					<Typography 
						style={{ 
							width: '150px', 
							textAlign: 'center' 
						}}
					>
						{data.type}
					</Typography>
					<Typography 
						style={{ 
							width: '100px', 
							textAlign: 'center' 
						}}
					>
						{scoreUser} | {scoreOther}
					</Typography>
					<Button onClick={() => redirectFriend(idOther)}>
						<Typography 
							sx={{
								textDecoration: 'none',
								color: 'blue',
								'&:hover': { 
									color: 'black'
								},
								textTransform: 'none',
							}}
							style={{ 
								position: 'relative', 
								left: {leftName},
								textAlign: 'center' 
							}}
						>
							{nameOther}
						</Typography>
					</Button>
					<Avatar
						sx={{
							width: '40px',
							height: '40px',
							left: '-5px',
							bgcolor: theme.palette.primary.light,
						}}
						src={opponent.image}
					>
					</Avatar>
				</Stack>
			</Tooltip>
		);
	};

	let gameContainer = () => 
	{
		if (matchHistory.length == 0)
		{
			return (
				<Stack
				sx={{
					alignItems: 'center',
					position: 'relative',
					top: '10px',
				}}
			>
				<Typography variant={'h4'}
					sx={{
						fontFamily: 'Georgia, serif',
						fontWeight: 'bold',
						fontStyle: 'italic',
						lineHeight: '5rem',
					}}    
				>
					No matches played yet!
				</Typography>
			</Stack>
			);
		}

		return (
			<Box
				sx={{
					width: '90%',
					position: 'relative',
					left: '40px',
					height: '100%',
					overflowY: 'auto',
					padding: '0.5em'
				}}
			>
				<Stack gap={1} direction="column" width="100%">
					{matchHistory.slice().reverse().map((item: MatchData, index: number) => (
						<React.Fragment key={index}>
							{gameLine(item)}
						</React.Fragment>
					))}
				</Stack>
			</Box>
		);
	};

	let GameBox = () => 
	{
		return (
			<Stack
				width={'100%'}
				padding={'0.3em'}
				maxHeight={isSmallScreen ? '80vh' : '80vh'}
			>
				{gameStats()}
				{gameContainer()}
			</Stack>
		);
	}

	let userInfo = () => 
	{	
		if (userProfile)
		{
			return (
				<Stack
					className="base"
					bgcolor={theme.palette.primary.dark}
				>
					{GetProfilePic()}
					{SetChangePfpButton()}
					{GetUserStatus()}
					{putNickName()}
					{EditNickName()}
					{OtherInfo()}
				</Stack>
			);
		}
		return (<Stack></Stack>);
	};

	let GetProfilePic = () => 
	{
		return (
			<Stack className="imageBase">
				<Avatar
					className="imageSize"
					src={profileImage}
				>
				</Avatar>
			</Stack>
		);
	}
	
	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => 
	{
		const image = event.target.files[0];
		let formdata = new FormData();
		formdata.append("name", "Profile Picture");
		formdata.append("file", image);
		if (image.type.startsWith("image/") && image.size > 0) 
		{
			var newimage = await changePFP(userProfile.id, formdata);
			setProfileImage(newimage);
		}
	}
	
	let SetChangePfpButton = () =>
	{
		return (
			<Tooltip title="Change your Profile Picture!" arrow>
				<IconButton 
					variant="contained" 
					component="label"
					className="pfpButton"				
				>
					<AddToPhotosIcon fontSize="inherit" />
					<input type="file" hidden accept="image/*" onChange={handleFileChange}/>
				</IconButton>
			</Tooltip>
		);
	}

	let GetUserStatus = () =>
	{		
		let status;
		if (whichStatus == UserStatus.Offline)
			status = 'offline';
		else if (whichStatus ==  UserStatus.Online)
			status = 'online';
		else if (whichStatus ==  UserStatus.InGame)
			status = 'inGame';
		
		return (
			<Stack>
				<Box className={`userStatus ${status}`} />
			</Stack>
		);
	}

	let putNickName = () => 
	{
		let size = 'small';
		if (userProfile.nameNick.length > 10)
			size = 'medium';
		if (userProfile.nameNick.length > 18)
			size = 'big';
		if (userProfile.nameNick.length > 25)
			size = 'large';
		
		return (
			<Stack
				className="nicknameBase"
			>
				<Typography variant={'h2'}
					className={`nicknameStyle ${size}`}  
				>
					{userProfile.nameNick.toString()}
				</Typography>
			</Stack>
		);
	}
  
	const CheckChange = () => 
	{
		if (showInputMessage)
			setShowInputMessage(false);
		
		if (showMessage)
			setShowMessage(false);
		
		setShowInput((prev) => !prev);
	};

	const handleNicknameUpdate = async (event: React.KeyboardEvent<HTMLInputElement>): Promise<void> => 
	{
		const key = event.key;
		if (key === 'Enter') 
		{
			const result = await setNewNickname(userProfile.id.toString(), inputValue);
	  
			if (result === "") 
			{
				userProfile.nameNick = inputValue;
				setInputValue("");
				setShowInput(false);
				setShowMessage(false);
			} 
			else 
			{
				setMessageErrorNickname(result);
				setShowMessage(true);
			}
		}
	}

	let EditNickName = () => 
	{
		return (
			<Stack>
				<Tooltip title="Edit Nickname!" arrow>
					<IconButton
						variant="contained"
						onClick={CheckChange}
						sx={{
								fontSize: '30px',
						}}
						className="editNickname"
					>
						<EditIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
				{showInput && (
					<Input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleNicknameUpdate}
					placeholder="Type new nickname..."
					className="nicknameInput"
					/>
				)}
				{showMessage && (	
					<Stack className="showErrorMessage">
						{messageErrorNickname}
					</Stack>
				)}
			</Stack>
		);
	}

	let OtherInfo = () =>
	{
		let top = 'normal';
		if (showInput)
		{
			top = 'showInput';
			if (showMessage)
				top = 'showMessage';
		}

		return (
			<Stack
				direction={'column'}
				justifyContent={'center'}
				padding={'1em'}
				className={`otherInfo ${top}`}
			>
				<Typography>
					<b>Intra name: </b>
					<br />
					{userProfile.nameIntra}
					<br />
					<br />
					<b>Email: </b>
					<br />
					{userProfile.email}
					<br />
				</Typography>
				{TwoFactorToggle()}
				{TwoFactorDialog()}
			</Stack>
		);
	}

	let pageWrapperUser = () => 
	{
		return (
			<Container sx={{ padding: theme.spacing(3) }}>
				<Stack
					width={'100%'}
					overflow={'hidden'}
				>
					{userInfo()}
					{isSmallScreen && <br />}
					<Stack
						direction={isSmallScreen ? 'column' : 'row'}
						bgcolor={theme.palette.primary.dark}
						margin={'1em'}
						minHeight={'60vh'}
					>
						{friendsBox()}
						{GameBox()}
					</Stack>
				</Stack>
			</Container>
		);
	};

	let getUserProfile = async () : Promise<void> =>
	{
		const tmp: User = await getUserFromDatabase(lastSegment, navigate);

		if (!tmp)
			return;

		if (user.id == tmp.id)
		{
			showOwnPage(true);
			setProfileImage(tmp.image);
			setFriendsList(tmp.friends);
			setWhichStatus(tmp.status);
			setMatchHistory(await fetchMatchData(tmp));
			setRatioArr(await fetchRatios(tmp));
			setUserProfile(tmp);
		}
		else 
			showOwnPage(false);
	}

	useEffect(() => 
	{
		getUserProfile().then((number) => 
		{
			setUserProfileNumber(number);
		});

		socket.on('friendAddedIndex', (newList: string[]) => {
			setFriendsList(newList);
		});

		socket.on('friendRemoved', (newlist: string[]) => {
			setFriendsList(newlist);
		});

		socket.on('statusChanged', (tmp: User, status: UserStatus) =>
		{
			setWhichStatus(status);
		});

		const fetch2FAStatus = async () => {
			try {
				const response = await axios.get(import.meta.env.URL_BACKEND_2FA_STATUS + `?intraId=${intraId}`, {withCredentials: true});
				setIs2FAEnabled(response.data.is2FAEnabled);
			} catch (error) {}
		};
		fetch2FAStatus();

	}, [lastSegment, intraId, whichStatus]);

	let whichPage = () =>
	{
		if (userProfileNumber === null) 
			return <Stack>Loading...</Stack>;

		return ownPage ? pageWrapperUser() : <ProfilePageOther />;
	}

	return (
		whichPage()
	);
};

export default ProfilePage;
