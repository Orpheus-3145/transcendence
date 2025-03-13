import React from 'react';
import { Avatar, Box, Stack, Typography, useTheme, Divider, IconButton, Container, Modal, ButtonGroup, Button } from '@mui/material';
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
	blockFriend,
	fetchRatios,
	fetchOpponent,
	fetchMatchData,
	unBlockFriend} from '../../Providers/UserContext/User';
import { addFriend, inviteToGame, sendMessage, socket } from '../../Providers/NotificationContext/Notification';
import { PowerUpSelected } from '../../Types/Game/Enum';
import {	User,
			MatchData,
			MatchRatio, } from '../../Types/User/Interfaces';
import {UserStatus} from '../../Types/User/Enum';
import { GameInviteModal } from '../Game/inviteModal';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const ProfilePageOther: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const {user} = useUser();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const location = useLocation();
	const pathSegments = location.pathname.split('/');
	const lastSegment = pathSegments[pathSegments.length - 1]
	const [userProfile, setUserProfile] = useState<User | null>(null);
	const [userProfileNumber, setUserProfileNumber] = useState<Number>(0);
	const [isFriend, setIsFriend] = useState<Boolean>(false);
	const [friendsList, setFriendsList] = useState<string[]>([]);
	const [friendDetails, setFriendDetails] = useState<Map<string, User>>(new Map());
	const [opponentDetails, setOpponentDetails] = useState<Map<string, User>>(new Map());
	const [profileIntraId, setProfileIntraId] = useState<Number>(0);
	const [showMessageFR, setShowMessageFR] = useState<Boolean>(false);
	const [showMessageGR, setShowMessageGR] = useState<Boolean>(false);
	const [showMessageMS, setShowMessageMS] = useState<Boolean>(false);
	const [showMessageUserBlocked, setShowMessageUserBlocked] = useState<Boolean>(false);
	const messageFriendReqSend: string = "Friend request has been send!";
	const messageGameReqSend: string = "Game Invite has been send!";
	const messageMessageSend: string = "Message has been send!";
	const messageUserBlocked: string = "You have been blocked by this user!";
	const [whichStatus, setWhichStatus] = useState<UserStatus>(UserStatus.Offline);
	const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
	const [ratioArr, setRatioArr] = useState<MatchRatio[]>([]);
	const [powerupValue, setPowerupValue] = useState<PowerUpSelected>(0);
	const [modalOpen, setModalOpen] = useState<Boolean>(false);
	const [isBlocked, setIsBlocked] = useState<Boolean>(false);


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
		var namenick = friend.nameNick;
		if (namenick?.length > 10)
		{
			namenick = namenick?.slice(0, 10) + "...";
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
						<a href="" onClick={() => redirectFriend(friend.id)}>{namenick}</a>
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
					{ratioArr.map((group: MatchRatio) => (gameStatsBox(group)))}
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

		if (data.player1 === userProfile?.nameNick)
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

		if (data.whoWon === userProfile?.nameNick)
			color = '#1da517'
		else
			color = '#b01515';
		return (
			<Stack
				direction="row"
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
					Game Type: {data.type}
				</Typography>
				<Typography 
					style={{ 
						width: '100px', 
						textAlign: 'center' 
					}}
				>
					Score: {scoreUser} | {scoreOther}
				</Typography>
				<Typography 
					sx={{
						'& a': {
							textDecoration: 'none',
							color: 'blue',
							'&:hover': { 
								color: 'black'
							}
						},
					}}
					style={{ 
						width: '0px',
						position: 'relative', 
						left: '10px',
						textAlign: 'center' 
					}}
				>
					<a href="" onClick={() => redirectFriend(idOther)}>{nameOther}</a>
				</Typography>
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
					{matchHistory.slice().reverse().map((item: MatchData) => gameLine(item))}
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
		}
		return (
			<Stack></Stack>
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
		let color;
		if (whichStatus == UserStatus.Offline)
			color = '#df310e';
		else if (whichStatus == UserStatus.Online)
			color = '#0fc00c';
		else if (whichStatus == UserStatus.InGame)
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
		if (userProfile.nameNick.length > 25)
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
					left:'10px',
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
		if (isBlocked)
		{
			return (
				<Stack>
					{UnblockButton()}
				</Stack>
			)
		}
		return (
			<Stack>
				{AddingFriendIcon()}
				{InviteToGameIcon()}
				{SendMessageIcon()}
				{BlockUserIcon()}
			</Stack>
		);
	}

	let checkIfBlocked = () =>
	{
		if (userProfile.blocked.find((blockedId:string) => blockedId === user.intraId.toString())) 
		{
			setShowMessageUserBlocked(true);
			setShowMessageMS(false);
			setShowMessageFR(false);
			setShowMessageGR(false);
			return (true);
		}
		return (false);
	}

	let messageHandeler = (which:string) =>
	{
		if (which == "FR")
		{
			return (messageFriendReqSend);
		}
		else if (which == "GR")
		{
			return (messageGameReqSend)
		}
		return ("ERROR: something went wrong, try again!");
	}

	let AddingFriendIcon = () => 
	{
		if (isFriend)
		{
			return (<Stack></Stack>);
		}

		return (
			<Stack>
				<Tooltip title="Add Friend!" arrow >
					<IconButton
						variant="contained"
						onClick={() => AddingFriend()}
						sx={{
							fontSize: '30px',
							top: '-130px',
							left: '435px',
							width: '50px',
							'&:hover': {
								color: '#0c31df',
							},
						}}
					>
						<AddIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
				{showMessageFR && (	
					<Stack
					sx={{
						position: 'relative',
						color: 'green',
						fontSize: '18px',
						top: '-64px',
						left: '440px',
					}}
					>
						{messageHandeler("FR")}
					</Stack>
				)}
				{showMessageUserBlocked && (	
					<Stack
					sx={{
						position: 'relative',
						color: 'red',
						fontSize: '18px',
						top: '-64px',
						left: '430px',
					}}
					>
						{messageUserBlocked}
					</Stack>
				)}
			</Stack>	
		);
	}

	let AddingFriend = () => 
	{
		if (checkIfBlocked() == true)
			return ;
		setShowMessageFR(true);
		setShowMessageGR(false);
		addFriend(user.id.toString(), userProfile.id.toString());
	}

	const handleModalClose = () => {
			setModalOpen(false);
	};

	const handleModalOpen = () => {
			setModalOpen(true);
	};

	let InviteToGameIcon = () => 
	{
		var top = '-175px';
		var topMessage = '-110px';
		if (isFriend)
		{
			top = '-130px';
			if (showMessageGR)
				topMessage = '-67px';
		}
		if (showMessageFR || showMessageUserBlocked)
		{
			top = '-202px';
		}

		return (
			<Stack>
			<Tooltip title="Invite to Game!" arrow>
				<IconButton
					variant="contained"
					onClick={handleModalOpen}
					sx={{
						fontSize: '30px',
						top: top,
						left: '505px',
						width: '50px',
						'&:hover': {
							color: '#BF77F6',
						},
					}}
				>
					<GameIcon fontSize="inherit"/>
				</IconButton>
			</Tooltip>
			{modalOpen && 
				<GameInviteModal 
					open={modalOpen} 
					onClose={() => InviteToGame()} 
					setValue={(revalue: PowerUpSelected) => {setPowerupValue(revalue)}} 
				/>
			}
			{showMessageGR && (	
				<Stack
				sx={{
					position: 'relative',
					color: 'green',
					fontSize: '18px',
					top: topMessage,
					left: '445px',
				}}
				>
					{messageHandeler("GR")}
				</Stack>
			)}
			</Stack>
		);
	}

	let InviteToGame = () => {
		handleModalClose();
		if (checkIfBlocked() == true)
			return ;
		setShowMessageFR(false);
		setShowMessageGR(true);
		(false);

		inviteToGame(user.id.toString(), userProfile.id.toString(), powerupValue);
	}

	let redirectToChat = () =>
	{
		navigate('/channels', {state: {otherId: userProfile.id.toString()}});
	}
	
	let SendMessageIcon = () => 
	{
		var top = '-220px';
		
		if (isFriend)
		{
			top = '-175px';
		}

		if (showMessageGR || showMessageFR || showMessageUserBlocked)
		{
			top = '-247px';
			if (isFriend)
			{
				top = '-202px';
			}
		}

		return (
			<Stack>
				<Tooltip title="Send Message!" arrow>
					<IconButton
						variant="contained"
						onClick={() => redirectToChat()}
						sx={{
								fontSize: '30px',
								top: top,
								left: '590px',
								width: '50px',
								'&:hover': {
									color: '#09af07',
								},
						}}
					>
						<MessageIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
			</Stack>
		);
	}

	let BlockUser = () => {
		user.blocked.push(profileIntraId.toString());
		setIsBlocked(true);
		blockFriend(user.id.toString(), profileIntraId.toString());
	}

	let BlockUserIcon = () =>
	{
		if (isFriend)
		{
			return (<Stack></Stack>);
		}
		let top = '-268px';
		if ((showMessageFR) || (showMessageGR) || (showMessageMS) || (showMessageUserBlocked))
		{
			top = '-295px';
		}
	
		return (
			<Stack>
				<Tooltip title="Block user!" arrow>
					<IconButton 
						onClick={() => BlockUser()}
						sx={{
							fontSize: '30px',
							top: top,
							left: '658px',
							width: '50px',
							'&:hover': {
								color: '#df310e',
							},
						}}
					>
						<BlockIcon fontSize="inherit"/>	
					</IconButton>
				</Tooltip>
			</Stack>
		);
	}

	let handleUnblock = () =>
	{
		user.blocked.filter((item: string) => item !== profileIntraId.toString());
		setIsBlocked(false);
		unBlockFriend(user.id.toString(), profileIntraId.toString());
	}
	
	let UnblockButton = () =>
	{
		return (
			<Stack>
				<Tooltip title="Unblock user!" arrow >
					<IconButton
						variant="contained"
						onClick={() => handleUnblock()}
						sx={{ 
							position: 'relative',
							top: '-100px',
							fontSize: '30px',
							left: '550px',
							width: '50px',
							'&:hover': {
								color: '#0c31df',
							},
						}}
					>
						<LockOpenIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
			</Stack>	
		);
	}

	let OtherInfo = () =>
	{
		let top = '-368px';

		if (isFriend)
			top = '-278px';
	
		if ((showMessageFR) || (showMessageGR) || (showMessageMS) || (showMessageUserBlocked))
		{
			top = '-395px';
			if (isFriend)
			{
				top = '-305px';
			}

		}

		if (isBlocked)
		{
			top = '-230px';
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
		setProfileIntraId(tmp.intraId);
		setUserProfile(tmp);
		setIsFriend(tmp.friends.find((str:string) => str === user.intraId.toString()));
		if (user.blocked.find((str: string) => str === tmp.intraId.toString()))
			setIsBlocked(true);
		else
			setIsBlocked(false);
		setFriendsList(tmp.friends);
		setWhichStatus(tmp.status);
		setMatchHistory(await fetchMatchData(tmp));
		setRatioArr(await fetchRatios(tmp));
	}
	
	useEffect(() => 
	{
		getUserProfile().then((number) => 
		{
			setUserProfileNumber(number);
		});

		socket.on('friendAdded', (newFriend: string) => {
			var newlist = friendsList;
			if (!friendsList.includes(newFriend, 0))
			{
				newlist.push(newFriend);
				setFriendsList(newlist);
			}
		});
		
	}, [lastSegment]);

	let PageWrapper = () =>
	{		
		if (userProfileNumber === null) 
			return <Stack>Loading...</Stack>;
		if (!userProfile)
			return <Stack>Loading...</Stack>;
 
		return pageWrapperOther();
	}

	return (
		PageWrapper()
	);
};

export default ProfilePageOther;
