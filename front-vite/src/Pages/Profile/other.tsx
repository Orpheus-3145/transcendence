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
import '../../Styles/other.css'

const ProfilePageOther: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const {user} = useUser();
	const isSmallScreen = useMediaQuery('(max-width:1275px)');
	const location = useLocation();
	const pathSegments = location.pathname.split('/');
	const lastSegment = pathSegments[pathSegments.length - 1]
	const [userProfile, setUserProfile] = useState<User | null>(null);
	const [userProfileNumber, setUserProfileNumber] = useState<Number>(0);
	const [isFriend, setIsFriend] = useState<Boolean>(false);
	const [profileNickname, setProfileNickname] = useState<string>("");
	const [friendsList, setFriendsList] = useState<string[]>([]);
	const [blockedList, setBlockedList] = useState<string[]>([]);
	const [friendDetails, setFriendDetails] = useState<Map<string, User>>(new Map());
	const [opponentDetails, setOpponentDetails] = useState<Map<string, User>>(new Map());
	const [showMessageFR, setShowMessageFR] = useState<Boolean>(false);
	const [showMessageGR, setShowMessageGR] = useState<Boolean>(false);
	const [showMessageUserBlocked, setShowMessageUserBlocked] = useState<Boolean>(false);
	const messageFriendReqSend: string = "Friend request has been send!";
	const messageGameReqSend: string = "Game Invite has been send!";
	const messageUserBlocked: string = "You have been blocked by this user!";
	const [whichStatus, setWhichStatus] = useState<UserStatus>(UserStatus.Offline);
	const [matchHistory, setMatchHistory] = useState<MatchData[]>([]);
	const [ratioArr, setRatioArr] = useState<MatchRatio[]>([]);
	const [modalOpen, setModalOpen] = useState<Boolean>(false);
	const [isBlocked, setIsBlocked] = useState<Boolean>(false);
	const [profileImage, setProfileImage] = useState<string>("");


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
							width: '40px', 
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
					className="baseOther"
					bgcolor={theme.palette.primary.dark}
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
				className="imageBaseOther"
			>
				<Avatar
					className="imageSizeOther"
					src={profileImage}
				>
				</Avatar>
			</Stack>
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
				<Box className={`userStatusOther ${status}`} />
			</Stack>
		);
	}

	let GetNickName = () => 
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
				className="nicknameBaseOther"
			>
				<Typography variant={'h2'}
					className={`nicknameStyleOther ${size}`}  
				>
					{profileNickname}
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

		if (isFriend)
		{
			return (
				<Stack>
					{InviteToGameIcon()}
					{SendMessageIcon()}	
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
		if (blockedList.find((blockedId:string) => blockedId === user.id.toString())) 
		{
			setShowMessageUserBlocked(true);
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
		return (
			<Stack>
				<Tooltip title="Add Friend!" arrow >
					<IconButton
						variant="contained"
						onClick={() => AddingFriend()}
						className="addingFriendIcon"
					>
						<AddIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
				{showMessageFR && (	
					<Stack
						className="showMessageFR"
					>
						{messageHandeler("FR")}
					</Stack>
				)}
				{showMessageUserBlocked && (	
					<Stack
						className="showMessageUserBlocked"
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
		if (showMessageUserBlocked)
			setShowMessageUserBlocked(false);
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
		var topIcon = 'normal';
		var topMessage = 'normal';
		if (isFriend)
		{
			topIcon = 'isFriend';
			if (showMessageGR)
				topMessage = 'isFriend';
		}
		if (showMessageFR || showMessageUserBlocked)
		{
			topIcon = 'showMessage';
		}

		return (
			<Stack>
			<Tooltip title="Invite to Game!" arrow>
				<IconButton
					onClick={handleModalOpen}
					className={`inviteToGameIcon ${topIcon}`}
				>
					<GameIcon fontSize="inherit"/>
				</IconButton>
			</Tooltip>
			{modalOpen && 
				<GameInviteModal 
					open={modalOpen} 
					onClose={(value: number) => InviteToGame(value)} 
				/>
			}
			{showMessageGR && (	
				<Stack
					className={`inviteToGameMessage ${topMessage}`}
				>
					{messageHandeler("GR")}
				</Stack>
			)}
			</Stack>
		);
	}

	let InviteToGame = (value: number) => 
	{
		handleModalClose();
		if (value?.nativeEvent)
		{
			return ;
		}
		if (checkIfBlocked() == true)
			return ;
		if (showMessageUserBlocked)
			setShowMessageUserBlocked(false);
		setShowMessageFR(false);
		setShowMessageGR(true);
		inviteToGame(user.id.toString(), userProfile.id.toString(), value);
	}

	let redirectToChat = () =>
	{
		if (checkIfBlocked() == true)
			return ;
		navigate('/channels', {state: {otherId: userProfile.id.toString()}});
	}
	
	let SendMessageIcon = () => 
	{
		var top = 'normal';
		
		if (isFriend)
		{
			top = 'isFriend';
		}

		if (showMessageGR || showMessageFR || showMessageUserBlocked)
		{
			top = 'showMessage';
			if (isFriend)
			{
				top = 'showMessageFriend';
			}
		}

		return (
			<Stack>
				<Tooltip title="Send Message!" arrow>
					<IconButton
						variant="contained"
						onClick={() => redirectToChat()}
						className={`sendMessageIcon ${top}`}
					>
						<MessageIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
			</Stack>
		);
	}

	let BlockUser = () => {
		user.blocked.push(userProfile.id.toString());
		setIsBlocked(true);
		blockFriend(user.id.toString(), userProfile.id.toString());
	}

	let BlockUserIcon = () =>
	{
		let top = 'normal';
		if ((showMessageFR) || (showMessageGR) || (showMessageUserBlocked))
		{
			top = 'showMessage';
		}
	
		return (
			<Stack>
				<Tooltip title="Block user!" arrow>
					<IconButton 
						onClick={() => BlockUser()}
						className={`blockUserIcon ${top}`}
					>
						<BlockIcon fontSize="inherit"/>	
					</IconButton>
				</Tooltip>
			</Stack>
		);
	}

	let handleUnblock = () =>
	{
		setShowMessageFR(false);
		setShowMessageGR(false);
		setShowMessageUserBlocked(false);
		user.blocked.filter((item: string) => item !== userProfile.id.toString());
		setIsBlocked(false);
		unBlockFriend(user.id.toString(), userProfile.id.toString());
	}
	
	let UnblockButton = () =>
	{
		return (
			<Stack>
				<Tooltip title="Unblock user!" arrow >
					<IconButton
						variant="contained"
						onClick={() => handleUnblock()}
						className="unBlockUserIcon"
					>
						<LockOpenIcon fontSize="inherit"/>
					</IconButton>
				</Tooltip>
			</Stack>	
		);
	}

	let OtherInfo = () =>
	{
		let top: string = 'normal'; //-368px

		if (isFriend)
			top = 'friend'; //-278px
	
		if ((showMessageFR) || (showMessageGR) || (showMessageUserBlocked))
		{
			top = 'showMessage'; //-395px
			if (isFriend)
			{
				top = 'showMessageFriend'; //-305px
			}

		}

		if (isBlocked)
		{
			top = 'blocked'; //-230px
		}

		return (
			<Stack
				direction={'column'}
				justifyContent={'center'}
				padding={'1em'}
				className={`otherInfoOther ${top}`}
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
		const tmp = await getUserFromDatabase(lastSegment, navigate);
		if (!tmp) {
			return
		}
		setUserProfile(tmp);
		if (tmp.friends.find((str:string) => str === user.id.toString()))
			setIsFriend(true);
		else
			setIsFriend(false);
		if (user.blocked.find((str: string) => str === tmp.id.toString()))
			setIsBlocked(true);
		else
			setIsBlocked(false);
		setFriendsList(tmp.friends);
		setWhichStatus(tmp.status);
		setProfileImage(tmp.image);
		setBlockedList(tmp.blocked);
		setProfileNickname(tmp.nameNick);
		setMatchHistory(await fetchMatchData(tmp));
		setRatioArr(await fetchRatios(tmp));
	}
	
	useEffect(() => 
	{
		getUserProfile().then((number) => 
		{
			setUserProfileNumber(number);
		});

		socket.on('friendAddedOther', (newlist: string[]) => 
		{
			setFriendsList(newlist);
			if (newlist.find((item: string) => item === user.id.toString()))
			{
				setShowMessageFR(false);
				setIsFriend(true);
			}
		});

		socket.on('friendRemoved', (newlist: string[]) => 
		{
			setFriendsList(newlist);
			if (newlist.length === 0 || (newlist.find((item: string) => item !== user.id.toString())))
			{
				setIsFriend(false);
			}
		});

		socket.on('statusChanged', (tmp: User, status: UserStatus) =>
		{
			setWhichStatus(status);
		});

		socket.on('updateBlocked', (id: string) =>
		{
			if (user.id.toString() === id)
			{
				var newlist = blockedList;
				newlist.push(id);
				setBlockedList(newlist);
			}
		});

		socket.on('updateUnBlocked', (id: string) =>
		{
			if (user.id.toString() === id)
			{
				var newlist = blockedList.filter((item: string) => item != id);
				setBlockedList(newlist);
				if (showMessageUserBlocked)
					setShowMessageUserBlocked(false);
			}		
		});
		
		socket.on('updateNickname', (newName: string) =>
		{
			setProfileNickname(newName);
		});

		socket.on('updateImage', (newImage: string) =>
		{
			setProfileImage(newImage);
		});

	}, [lastSegment, whichStatus]);

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
