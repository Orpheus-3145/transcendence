import React from 'react';
import { Avatar, Box, Stack, Typography, useTheme, Divider, Grid, IconButton, Container } from '@mui/material';
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
		User} from '../../Providers/UserContext/User';

const ProfilePage: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const { user } = useUser();
	const location = useLocation();
	const pathSegments = location.pathname.split('/');
	const lastSegment = pathSegments[pathSegments.length - 1]
	const [showInputMessage, setShowInputMessage] = useState(false);
	const [showInput, setShowInput] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [ownPage, showOwnPage] = useState(false);
	const [userProfile, setUserProfile] = useState<User | null>(null);
	const [userProfileNumber, setUserProfileNumber] = useState<number | null>(null);
	const [showMessageNickname, setShowMessageNickname] = useState(false);
	const messageErrorNickname = "Invalid nickname! Maximum of 27 chars and only letters, numbers and spaces are allowed!";
	const [profileImage, setProfileImage] = useState();
	const [friendsList, setFriendsList] = useState<string[]>([]);
	const [friendDetails, setFriendDetails] = useState<Map<string, User>>(new Map());
	
	
	let RemoveFriend = (id:string) => {
		removeFriend(userProfile.id, id);
	}

	let BlockFriend = (id:string) => {
		blockFriend(userProfile.id, id);
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

		return (
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
				{friendsList.map((friendId: string) => friendLine(friendId))}
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

	const stats = [
		{ title: 'Games Played', value: 8, rate: '75%' },
	];

	const vanillaStats = [
		{ title: 'Vanilla Games', value: 25, rate: '75%' },
	];

	const customStats = [
		{ title: 'Custom Games', value: 100, rate: '75%' },
	];

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
					{[stats, vanillaStats, customStats].map((group, index) => (
						<Stack
							key={index}
							direction="column"
							flex={{ xs: '1 1 100%', sm: '1 1 33%' }}
							justifyContent="center"
							alignItems="center"
							padding="0.3em"
						>
							{group.map((stat, idx) => (
								<Stack
									key={idx}
									gap={1}
									direction="row"
									textAlign="center"
									alignItems="center"
									justifyContent="center"
								>
									<Stack
										direction="column"
										textAlign="center"
										alignItems="center"
										justifyContent="center"
									>
										<Typography>{stat.title}</Typography>
										<Typography>{stat.value}</Typography>
									</Stack>
									<Stack
										direction="column"
										textAlign="center"
										alignItems="center"
										justifyContent="center"
									>
										<Cup sx={{ color: (theme) => theme.palette.secondary.main }} />
										<Typography>{stat.rate}</Typography>
									</Stack>
								</Stack>
							))}
						</Stack>
					))}
				</Stack>
			</Box>
		);
	};

	let gameLine = () => 
	{
		return (
			<Stack
				direction={'row'}
				gap={1}
				justifyContent={'space-around'}
				alignContent={'center'}
				textAlign={'center'}
				bgcolor={alpha(theme.palette.background.default, 0.3)}
				borderRadius={'2em'}
				padding={'0.3em'}
			>
				<Typography alignContent={'center'} textAlign={'center'}>Type</Typography>
				<Typography alignContent={'center'} textAlign={'center'}>Custom</Typography>
				<Typography alignContent={'center'} textAlign={'center'}>9:15</Typography>
				<Typography alignContent={'center'} textAlign={'center'}>Opponent Name</Typography>
				<Avatar />
			</Stack>
		);
	};

	let gameContainer = () => 
	{
		return (
			<Box
				sx={{
					width: '100%',
					height: '100%',
					overflowY: 'auto',
					padding: '0.5em'
				}}
			>
				<Stack gap={1} direction="column" width="100%">
					{Array.from({ length: 2 }).map((_, index) => (
						<React.Fragment key={index}>
							{gameLine()}
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
		return (
			<Stack
				justifyContent={'space-between'}
				margin={'1em'}
				bgcolor={theme.palette.primary.dark}
				sx={{
					maxWidth: '1200px',
					maxHeight: '300px',
				}}
			>
				{GetProfilePic()}
				{SetChangePfpButton()}
				{GetUserStatus()}
				{GetNickName()}
				{EditNickName()}
				{OtherInfo()}
			</Stack>
		);
	};

	let GetProfilePic = () => 
	{
		return (
			<Stack
				sx={{
					position: 'relative',
					top: '40px',
					left: '50px',
				}}
			>
				<Avatar
					sx={{
						width: '200px',
						height: '200px',
						bgcolor: theme.palette.primary.light,
					}}
					src={profileImage}
				>
				</Avatar>
			</Stack>
		);
	}
	
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => 
	{
		const image = event.target.files[0];
		let formdata = new FormData();
		formdata.append("name", "Profile Picture");
		formdata.append("file", image);
		if (image.type.startsWith("image/") && image.size > 0) 
		{
			changePFP(userProfile.id, formdata);
			setProfileImage(image);
		}
	}
	
	let SetChangePfpButton = () =>
	{
		return (
			<Tooltip title="Change your Profile Picture!" arrow>
				<IconButton 
					variant="contained" 
					component="label"
					sx={{
						left: '60px',
						top: '-10px',
						width: '60px',
						height: '60px',
						fontSize: '40px',
						'&:hover': {
							color: '#09af07',
						},
					}}				
				>
					<AddToPhotosIcon fontSize="inherit" />
					<input type="file" hidden accept="image/*" onChange={handleFileChange}/>
				</IconButton>
			</Tooltip>
		);
	}

	let GetUserStatus = () =>
	{
		userProfile.status = 'offline';
		
		let color;
		if (user.status == 'offline')
			color = '#df310e';
		else if (user.status == 'idle')
			color = '#cfdf0e';
		else if (user.status == 'online')
			color = '#0fc00c';
		else if (user.status == 'ingame')
			color = '#0dddc4';
		
		return (
			<Stack>
				<Box
				sx={{
					width: 40,
					height: 40,
					backgroundColor: color,
					borderRadius: '50%',
					position: 'relative',
					top: '-60px',
					left: '190px',
				}}
				>
				</Box>
			</Stack>
		);
	}

	let GetNickName = () => 
	{
		let size = '4rem';
		if (userProfile.nameNick.length > 10)
			size = '3rem';
		if (userProfile.nameNick.length > 18)
			size = '2rem';
		if (userProfile.nameNick.lenght > 25)
			size = '1rem';
		
		return (
			<Stack
				sx={{
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					top: '-210px',
					left:'-10px',
				}}
			>
				<Typography variant={'h2'}
					sx={{
						fontFamily: 'Georgia, serif',
						fontWeight: 'bold',
						fontStyle: 'italic',
						fontSize: size,
						lineHeight: '5rem',
						height: '5rem',
						overflow: 'hidden',
						whiteSpace: 'nowrap',
						transition: 'font-size 0.3s ease',
					}}    
				>
					{userProfile.nameNick}
				</Typography>
			</Stack>
		);
	}
  
	const CheckChange = () => 
	{
		if (showInputMessage)
			setShowInputMessage(false);
		
		if (showMessageNickname)
			setShowMessageNickname(false);
		
		setShowInput((prev) => !prev);
	};

	const handleNicknameUpdate = async (event: React.KeyboardEvent<HTMLInputElement>): Promise<void> => 
	{
		const key = event.key;
		if (key === 'Enter') 
		{
			const result = await setNewNickname(userProfile.id, inputValue);
	  
			if (result === 1) 
			{
				userProfile.nameNick = inputValue;
				setInputValue("");
				setShowInput(false);
				setShowMessageNickname(false);
			} 
			else 
			{
				setShowMessageNickname(true);
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
								top: '-190px',
								left: '530px',
								width: '50px',
								'&:hover': {
									color: '#09af07',
								},
						}}
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
					sx={{
						top: '-180px',
						left: '465px',
						width: '200px',
						height: '40px',
					}}
					/>
				)}
				{showMessageNickname && (	
					<Stack
					sx={{
						position: 'relative',
						color: 'red',
						fontSize: '18px',
						top: '-163px',
						left: '200px',
					}}
					>
						{messageErrorNickname}
					</Stack>
				)}
			</Stack>
		);
	}

	let OtherInfo = () =>
	{
		let top = '-290px';
		if (showInput)
		{
			top = '-330px';
			if (showMessageNickname)
				top = '-357px';
		}

		return (
			<Stack
				direction={'column'}
				justifyContent={'center'}
				padding={'1em'}
				sx={{
					width: '100%',
					height: '10px',
					position: 'relative',
					top: top,
					left: '860px',
				}}
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
			</Stack>
		);
	}

	let pageWrapperUser = () => 
	{
		return (
			<Container sx={{ padding: theme.spacing(3) }}>
				<Stack
						maxWidth={'100%'}
						overflow={'hidden'}
				>
					{userInfo()}
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
		const tmp = await getUserFromDatabase(lastSegment, navigate);

		if (user.id == tmp.id)
		{
			showOwnPage(true);
			setProfileImage(tmp.image);
			setFriendsList(tmp.friends);
			setUserProfile(tmp);
		}
		else 
			showOwnPage(false);
	}
	
	let whichPage = () =>
	{
		useEffect(() => 
		{
			getUserProfile().then((number) => 
			{
				setUserProfileNumber(number);
			});
		}, [profileImage, friendsList]);
		
		if (userProfileNumber === null) 
			return <Stack>Loading...</Stack>;
		
		return ownPage ? pageWrapperUser() : <ProfilePageOther />;
	}

	return (
		whichPage()
	);
};

export default ProfilePage;