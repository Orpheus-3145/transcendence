import React from 'react';
import { Avatar, Box, Stack, Typography, useTheme, Divider, IconButton, Container } from '@mui/material';
import {Input} from '@mui/material'
import { useMediaQuery, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
	AccountCircle as AccountCircleIcon,
	EmojiEvents as Cup,
	PersonAdd as AddIcon,
	Block as BlockIcon,
	VideogameAsset as GameIcon,
	Message as MessageIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser,
	getUserFromDatabase, 
	fetchFriend, 
	addFriend,
	sendMessage,
	blockFriend,
	inviteToGame,
	User} from '../../Providers/UserContext/User';

const ProfilePageOther: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const {user} = useUser();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const location = useLocation();
	const pathSegments = location.pathname.split('/');
	const lastSegment = pathSegments[pathSegments.length - 1]
	const [showInputMessage, setShowInputMessage] = useState(false);
	const [inputMessage, setInputMessage] = useState('');
	const [showInput, setShowInput] = useState(false);
	const [userProfile, setUserProfile] = useState(user);
	const [userProfileNumber, setUserProfileNumber] = useState(0);
	const [isFriend, setIsFriend] = useState(false);
	const [friendsList, setFriendsList] = useState<string[]>([]);
	const [friendDetails, setFriendDetails] = useState<Map<string, User>>(new Map());
	

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
			return <Stack>Loading...</Stack>;
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
				{GetUserStatus()}
				{GetNickName()}
				{ButtonsProfileGrid()}
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
						alignItems: 'center',
						justifyContent: 'center',
						display: 'flex',
						width: '200px',
						height: '200px',
						bgcolor: theme.palette.success.main,
					}}
					src={userProfile.image}
				>
					<AccountCircleIcon sx={{ width: '100%', height: 'auto' }} />
				</Avatar>
			</Stack>
		);
	}

	let GetUserStatus = () =>
	{
		userProfile.status = 'offline';
		
		let color;
		if (user.status == 'offline')
			color = '#df310e';
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
					top: '0px',
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
		if (userProfile.nameNick.length > 20)
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
					top: '-150px',
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

	let ButtonsProfileGrid = () =>
	{
		return (
			<Stack>
				{AddingFriendIcon()}
				{InviteToGameIcon()}
				{SendMessageIcon()}
				{BlockUserIcon()}
			</Stack>
		);
	}

	let AddingFriendIcon = () => 
	{
		if (isFriend)
		{
			return (<Stack></Stack>);
		}

		return (
			<Tooltip title="Add Friend!" arrow>
				<IconButton
					variant="contained"
					onClick={() => AddingFriend()}
							sx={{
								fontSize: '30px',
								top: '-130px',
								left: '425px',
								width: '50px',
								'&:hover': {
									color: '#0c31df',
								},
							}}
				>
					<AddIcon fontSize="inherit"/>
				</IconButton>
			</Tooltip>
		);
	}

	let AddingFriend = () => {
		addFriend(user.id, userProfile.id);
	}

	let InviteToGameIcon = () => 
	{
		var top = '-175px';
		if (isFriend)
		{
			top = '-130px';
		}
		return (
			<Tooltip title="Invite to Game!" arrow>
			<IconButton
				variant="contained"
				onClick={() => InviteToGame()}
				sx={{
					fontSize: '30px',
					top: top,
					left: '495px',
					width: '50px',
					'&:hover': {
						color: '#BF77F6',
					},
				}}
			>
				<GameIcon fontSize="inherit"/>
			</IconButton>
		</Tooltip>
		);
	}

	let InviteToGame = () => {
		inviteToGame(user.id, userProfile.id);
	}

	
	const CheckChangeMessage = () => 
	{
		if (showInput)
		{
			setShowInput(false);
		}
		setShowInputMessage((prev) => !prev);
	};

	const handleKeyDownMessage = (event: React.KeyboardEvent<HTMLInputElement>) => 
	{
		const key = event.key;
	  	if (key === 'Enter') 
	  	{
			if (inputMessage.length > 0)
			{
				sendMessage(user.id, userProfile.id, inputMessage);
				setInputMessage('');
				setShowInputMessage(false);
			}
	 	}
  	}
	
	let SendMessageIcon = () => 
	{
		var top = '-220px';
		var topMessage = '-210px';
		if (isFriend)
		{
			top = '-175px';
			topMessage = '-170px';
		}

		return (
			<Stack>
				<Tooltip title="Send Message!" arrow>
					<IconButton
						variant="contained"
						onClick={CheckChangeMessage}
						sx={{
								fontSize: '30px',
								top: top,
								left: '580px',
								width: '50px',
								'&:hover': {
									color: '#09af07',
								},
						}}
					>
						<MessageIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
				{showInputMessage && (
					<Input
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					onKeyDown={handleKeyDownMessage}
					placeholder="Type a message..."
					sx={{
						position: 'relative',
						top: topMessage,
						left: '470px',
						width: '200px',
						height: '40px',
					}}
					/>
				)}
			</Stack>
		);
	}

	let BlockUser = () => {
		blockFriend(user.id, userProfile.intraid.toString());
	}

	let BlockUserIcon = () =>
	{
		if (isFriend)
		{
			return (<Stack></Stack>);
		}

		let top = '-268px';
		if (showInputMessage)
			top = '-308px';
	
		return (
			<Tooltip title="Block user!" arrow>
				<IconButton 
					onClick={() => BlockUser()}
					sx={{
						fontSize: '30px',
						top: top,
						left: '648px',
						width: '50px',
						'&:hover': {
							color: '#df310e',
						},
					}}
				>
				<BlockIcon fontSize="inherit"/>	
				</IconButton>
			</Tooltip>
		);
	}

	let OtherInfo = () =>
	{
		let top = '-368px';
		if (showInputMessage)
			top = '-408px';
		if (isFriend)
			top = '-278px';
		if (showInputMessage && isFriend)
			top = '-318px';

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

	let pageWrapperOther = () => 
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
		setUserProfile(tmp);
		var friend = await getUserFromDatabase(user.id, navigate);
		setIsFriend(tmp.friends.find((str:string) => str === friend.intraId.toString()));
		setFriendsList(tmp.friends);
	}
		
	let PageWrapper = () =>
	{
		useEffect(() => 
		{
			getUserProfile().then((number) => 
			{
				setUserProfileNumber(number);
			});
		}, [friendsList]);
		
		if (userProfileNumber === null) 
			return <Stack>Loading...</Stack>;
		
		return pageWrapperOther();
	}

	return (
		PageWrapper()
	);
};

export default ProfilePageOther;