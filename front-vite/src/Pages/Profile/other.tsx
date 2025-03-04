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
	fetchMatchData} from '../../Providers/UserContext/User';
import { addFriend, inviteToGame, sendMessage, socket } from '../../Providers/NotificationContext/Notification';
import { PowerUpSelected } from '../../Types/Game/Enum';
import {	User,
			MatchData,
			MatchRatio, } from '../../Types/User/Interfaces';
import {UserStatus} from '../../Types/User/Enum';

const ProfilePageOther: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const {user} = useUser();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const location = useLocation();
	const pathSegments = location.pathname.split('/');
	const lastSegment = pathSegments[pathSegments.length - 1]
	const [showInputMessage, setShowInputMessage] = useState<Boolean>(false);
	const [inputMessage, setInputMessage] = useState<string>('');
	const [showInput, setShowInput] = useState<Boolean>(false);
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
	const [showMessageBL, setShowMessageBL] = useState<Boolean>(false);
	const [showMessageUserBlocked, setShowMessageUserBlocked] = useState<Boolean>(false);
	const messageFriendReqSend: string = "Friend request has been send!";
	const messageGameReqSend: string = "Game Invite has been send!";
	const messageMessageSend: string = "Message has been send!";
	const messageBlockedSend: string = "User has been blocked!";
	const messageUserBlocked: string = "This user has been blocked! Unblock him before doing the action!";
	const [whichStatus, setWhichStatus] = useState<UserStatus>(UserStatus.Offline);
	const [speedball, setSpeedball] = useState<boolean>(false);
	const [speedpaddle, setSpeedpaddle] = useState<boolean>(false);
	const [slowpaddle, setSlowpaddle] = useState<boolean>(false);
	const [shrinkpaddle, setShrinkpaddle] = useState<boolean>(false);
	const [stretchpaddle, setStretchpaddle] = useState<boolean>(false);
	const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
	const [ratioArr, setRatioArr] = useState<MatchRatio[]>([]);

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

	let gameStatsBox = (data: matchRatio) =>
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
						<Typography>{data.value}</Typography>
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
						<Typography>{data.rate}%</Typography>
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
					{ratioArr.map((group: matchRatio) => (gameStatsBox(group)))}
				</Stack>
			</Box>
		);
	};

const fetchOpponentDetails = async (opponentId: string) => {
		const opponent = await fetchOpponent(opponentId);
		setOpponentDetails((prev) => new Map(prev).set(opponentId, opponent));
	};

	let gameLine = (data: matchData) => 
	{
		var opponent: User | undefined;
		var intra: string;
		var nameOther: string;
		var scoreUser: string;
		var scoreOther: string;
		var color: string;
		var idOther: number;
		if (data.player1 === userProfile.id.toString())
		{
			scoreUser = data.player1Score;
			scoreOther = data.player2Score;
			intra = data.player2;
			opponent = opponentDetails.get(intra);
			if (opponent)
			{
				nameOther = opponent.nameNick;
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
				nameOther = opponent.nameNick;
				idOther = opponent.id;
			}
		}

		if (!opponent) {
			fetchOpponentDetails(intra);
			return <Stack>Loading...</Stack>;
		}

		if (data.whoWon === userProfile.id.toString())
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
					{matchHistory.slice().reverse().map((item: matchData) => gameLine(item))}
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
		if (user.blocked.find((blockedId:string) => blockedId === userProfile.intraId.toString())) 
		{
			setShowMessageUserBlocked(true);
			setShowMessageMS(false);
			setShowMessageFR(false);
			setShowMessageGR(false);
			setShowMessageBL(false);
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
		else if (which == "MS")
		{
			return (messageMessageSend);
		}
		else if (which == "BL")
		{
			return (messageBlockedSend);
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
						left: '310px',
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
		setShowMessageMS(false);
		setShowMessageFR(true);
		setShowMessageGR(false);
		setShowMessageBL(false);
		addFriend(user.id.toString(), userProfile.id.toString());
	}

    const [modalOpen, setModalOpen] = useState<Boolean>(false);

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleModalOpen = () => {
        setModalOpen(true);
    };

	const handleSpeedball = () =>
	{
		if (!speedball)
			setSpeedball(true);
		else
			setSpeedball(false);
	}

	const handleSpeedpaddle = () =>
	{
		if (!speedpaddle)
			setSpeedpaddle(true);
		else
			setSpeedpaddle(false);
	}
		
	const handleSlowpaddle = () =>
	{
		if (!slowpaddle)
			setSlowpaddle(true);
		else
			setSlowpaddle(false);
	}
		
	const handleShrinkpaddle = () =>
	{
		if (!shrinkpaddle)
			setShrinkpaddle(true);
		else
			setShrinkpaddle(false);
	}

	const handleStretchpaddle = () =>
	{
		if (!stretchpaddle)
			setStretchpaddle(true);
		else
			setStretchpaddle(false);
	}

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
            <Modal open={modalOpen} onClose={handleModalClose}>
				<Stack
					bgcolor={theme.palette.primary.dark} 
					width="700px"
					height="450px"
					borderRadius={2} 
					margin="auto" 
					mt="10%"
					display="flex"
					justifyContent="center"
					alignItems="center"
				>
					<Typography 
						variant={'h4'}
						sx={{
							position: 'relative',
							top : '-80px',
						}}
					>
						Game Invitiation
					</Typography>
					<Typography 
						variant={'h5'}
						sx={{
							position: 'relative',
							top : '-40px',
						}}
					>
						Select Power ups or leave empty for a Normal game
					</Typography>
					<Typography variant={'h6'}>
						Power ups:
					</Typography>
					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						sx={{
							position:'relative',
							top: '10px',
						}}
					>
						<Button
							variant={speedball ? 'contained' : 'outlined'}
							onClick={() => handleSpeedball()}
						>
							SpeedBall
						</Button>
						<Button
							variant={speedpaddle ? 'contained' : 'outlined'}
							onClick={() => handleSpeedpaddle()}
						>
							SpeedPaddle
						</Button>
						<Button
							variant={slowpaddle ? 'contained' : 'outlined'}
							onClick={() => handleSlowpaddle()}
						>
							SlowPaddle
						</Button>
						<Button
							variant={shrinkpaddle ? 'contained' : 'outlined'}
							onClick={() => handleShrinkpaddle()}
						>
							ShrinkPaddle
						</Button>
						<Button
							variant={stretchpaddle ? 'contained' : 'outlined'}
							onClick={() => handleStretchpaddle()}
						>
							StretchPaddle
						</Button>
					</Box>
					<Button
						variant={'contained'}
						onClick={() => InviteToGame()}
						sx={{
							position: 'relative',
							top: '60px',
						}}
					>
						Send Invite
					</Button>
				</Stack>
            </Modal>
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

	let calculatePowerups = () =>
	{
		var value = PowerUpSelected.noPowerUp; 
		
		if (speedball)
			value |= PowerUpSelected.speedBall;
		if (speedpaddle)
			value |= PowerUpSelected.speedPaddle;
		if (slowpaddle)
			value |= PowerUpSelected.slowPaddle;
		if (shrinkpaddle)
			value |= PowerUpSelected.shrinkPaddle;
		if (stretchpaddle)
			value |= PowerUpSelected.stretchPaddle;

		return (value);
	}

	let InviteToGame = () => {
		handleModalClose();
		if (checkIfBlocked() == true)
			return ;
		setShowMessageMS(false);
		setShowMessageFR(false);
		setShowMessageGR(true);
		setShowMessageBL(false);

		var powerup = calculatePowerups();
		inviteToGame(user.id.toString(), userProfile.id.toString(), powerup);
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
				if (checkIfBlocked() == true)
					return ;
				setInputMessage('');
				setShowInputMessage(false);
				setShowMessageMS(true);
				setShowMessageFR(false);
				setShowMessageGR(false);
				setShowMessageBL(false);
				sendMessage(user.id.toString(), userProfile.id.toString(), inputMessage);
			}
	 	}
  	}
	
	let SendMessageIcon = () => 
	{
		var top = '-220px';
		var topInputMessage = '-210px';
		var topMessage = '-155px';
		
		if (isFriend)
		{
			top = '-175px';
			topInputMessage = '-170px';
		}
		if (showInputMessage)
		{
			topMessage = '-195px'
			if (isFriend)
			{
				topMessage = '-150px';
			}
		}
		else
		{
			topMessage = '-110px';
			if (!isFriend)
			{
				topMessage = '-157px';
			}
		}

		if (showMessageGR || showMessageFR || showMessageUserBlocked)
		{
			top = '-247px';
			topInputMessage = '-237px';
			if (isFriend)
			{
				top = '-202px';
				topInputMessage = '-197px';
			}
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
				{showInputMessage && (
					<Input
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					onKeyDown={handleKeyDownMessage}
					placeholder="Type a message..."
					sx={{
						position: 'relative',
						top: topInputMessage,
						left: '475px',
						width: '200px',
						height: '40px',
					}}
					/>
				)}
		        {showMessageMS && (	
					<Stack
					sx={{
						position: 'relative',
						color: 'green',
						fontSize: '18px',
						top: topMessage,
						left: '455px',
					}}
					>
						{messageHandeler("MS")}
					</Stack>
				)}
			</Stack>
		);
	}

	let BlockUser = () => {
		if (checkIfBlocked() == true)
			return ;
		setShowMessageMS(false);
		setShowMessageFR(false);
		setShowMessageGR(false);
		setShowMessageBL(true);
		blockFriend(user.id.toString(), profileIntraId.toString());
		user.blocked.push(profileIntraId.toString());
	}

	let BlockUserIcon = () =>
	{
		if (isFriend)
		{
			return (<Stack></Stack>);
		}
		let top = '-268px';
		let topShowMessageBl = '-201px';
		if (showInputMessage)
		{
			top = '-308px';
			topShowMessageBl = '-241px';
		}
		if ((showMessageFR) || (showMessageGR) || (showMessageMS) || (showMessageUserBlocked))
		{
			top = '-295px';
			if (showInputMessage)
			{
				top = '-335px';
			}

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
				{showMessageBL && (	
					<Stack
					sx={{
						position: 'relative',
						color: 'red',
						fontSize: '18px',
						top: topShowMessageBl,
						left: '470px',
					}}
					>
						{messageHandeler("BL")}
					</Stack>
				)}
			</Stack>
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
		if ((showMessageBL) || (showMessageFR) || (showMessageGR) || (showMessageMS) || (showMessageUserBlocked))
		{
			top = '-395px';
			if (showInputMessage)
				top = '-435px';
			if (isFriend)
			{
				top = '-305px';
				if (showInputMessage)
				{
					top = '-345px';
				}
			}

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
