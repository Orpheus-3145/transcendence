import React from 'react';
import { Avatar, Box, Button, Stack, Typography, useTheme, Divider, Grid, IconButton, Container } from '@mui/material';
import {Input} from '@mui/material'
import { useMediaQuery, Tooltip } from '@mui/material';
import { darken, alpha } from '@mui/material/styles';
import {
	AccountCircle as AccountCircleIcon,
	EmojiEvents as Cup,
	PersonAdd as AddIcon,
	Add as Add,
	Block as BlockIcon,
	VideogameAsset as GameIcon,
	Message as MessageIcon,
	PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';
import EditIcon from '@mui/icons-material/Edit';
import { useUser, fetchUserProfile } from '../../Providers/UserContext/User';
import { useLocation } from 'react-router-dom';
import { useRef, useState } from 'react';

const ProfilePage: React.FC = () => {
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const { user } = useUser();
	const location = useLocation();
	const pathSegments = location.pathname.split('/');
	const lastSegment = pathSegments[pathSegments.length - 1]
	const [showInputMessage, setShowInputMessage] = useState(false);
	const [inputMessage, setInputMessage] = useState('');
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [changed, setChanged] = useState(false);
	const [showInput, setShowInput] = useState(false);
	const [inputValue, setInputValue] = useState('');

	let friendLine = (name:string, isUser:boolean) => {
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
					<AccountCircleIcon />
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
						<a href="http://localhost:3000/profile/2">{name}</a>
					</Typography>
				</Stack>
				{friendLineButtons(isUser)}
			</Stack>
		);
	};
	
	let friendLineButtons = (isUser:boolean) => {
		if (isUser == true)
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
									onClick={() => {RemoveFriend}}
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
									onClick={() => {BlockFriend}}
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
		else
		{
			return (
				<Stack></Stack>
			)
		}
	}

	let RemoveFriend = () => {
		console.log("User: " + user.nameNick + " wants to remove this person!");
	} //still need to make it work

	let BlockFriend = () => {
		console.log("User: " + user.nameNick + " wants to block this person!");
	} //still need to make it work

	let strings: string[] = ["apple", "hallo", "cherry"];

	let friendCategory = (isUser:boolean) => {
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
				{strings.map((friendName) => friendLine(friendName, isUser))}
			</Stack>
		);
	};

	let friendsBox = (isUser:boolean) => {
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
					{friendCategory(isUser)}
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

	let gameStats = () => {
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

	let gameLine = () => {
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

	let userInfo = (user:any, isUser: boolean) => 
	{
		if (isUser == true)
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
					{GetProfilePic(user)}
					{SetChangePfpButton(user)}
					{GetUserStatus(user, isUser)}
					{GetNickName(user, isUser)}
					{ButtonsProfileGrid(user, isUser)}
					{OtherInfo(user, isUser)}
				</Stack>
			);
		}
		else
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
					{GetProfilePic(user)}
					{GetUserStatus(user, isUser)}
					{GetNickName(user,isUser)}
					{ButtonsProfileGrid(user, isUser)}
					{OtherInfo(user, isUser)}
				</Stack>
			);
		}
	};

	let GetProfilePic = (user:any) =>
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
						width: '100%',
						height: 'auto',
						minWidth: '115px',
						minHeight: '115px',
						maxHeight: '200px',
						maxWidth: '200px',
						bgcolor: theme.palette.success.main,
					}}
					src={user.image}
				>
					<AccountCircleIcon sx={{ width: '100%', height: 'auto' }} />
				</Avatar>
			</Stack>
		);
	}

	let GetUserStatus = (user:any, isUser: boolean) =>
	{
		user.status = 'offline';
		
		let color, top;
		if (user.status == 'offline')
			color = '#df310e';
		else if (user.status == 'idle')
			color = '#cfdf0e';
		else if (user.status == 'online')
			color = '#0fc00c';
		else if (user.status == 'ingame')
			color = '#0dddc4';

		if (isUser == true)
			top = '-60px';
		else
			top = '0px';
		
		return (
			<Stack>
				<Box
				sx={{
					width: 40,
					height: 40,
					backgroundColor: color,
					borderRadius: '50%',
					position: 'relative',
					top: top,
					left: '190px',
				}}
				>
				</Box>
			</Stack>
		);
	}

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => 
	{
		const files = event.target.files;
		if (files && files.length > 0) {
			setSelectedFile(files[0]);
			user.image = selectedFile;
		}
	}

	const IsChanged = () =>
	{
		setChanged((prev) => !prev);
	}

	let SetChangePfpButton = (user:any) =>
	{
		return (
			<Tooltip title="Change your Profile Picture!" arrow>
				<IconButton 
					variant="contained" 
					component="label"
					onClick={IsChanged}
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
					<input type="file" ref={fileInputRef} hidden onChange={handleFileChange}/>
				</IconButton>
			</Tooltip>
		);
	}

	let GetNickName = (user:any, isUser:boolean) => 
		{
			let top;
			let size = '4rem';
			if (user.nameNick.length > 10)
				size = '3rem';
			if (user.nameNick.length > 20)
				size = '2rem';
			if (user.nameNick.lenght > 25)
				size = '1rem';

			if (isUser == true)
				top = '-210px';
			else
				top = '-150px'

			return (
				<Stack
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
						top: top,
						left: '-15px',
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
						{user.nameNick}
					</Typography>
				</Stack>
			);
		}

	let ButtonsProfileGrid = (user:any, isUser: boolean) =>
	{
		if (isUser == true)
		{
			return (
				<Stack>
					{EditNickName(user)}
				</Stack>
			);

		}
		else
		{
			return (
				<Stack>
					{AddingFriendIcon(user)}
					{InviteToGameIcon(user)}
					{SendMessageIcon(user)}
				</Stack>
			);		
		}
	}
  
	const CheckChange = () => {
		if (showInputMessage)
		{
			setShowInputMessage(false);
		}
		setShowInput((prev) => !prev);
	};

	const handleKeyDownNickname = (event: React.KeyboardEvent<HTMLInputElement>) => {
	  	const key = event.key;
		if (key === 'Enter') 
		{
			if (inputValue.length > 0)
			{
				user.nameNick = inputValue;
				setInputValue("");
				setShowInput(false);
			}
		}
	}

	let EditNickName = (user:any) => {
		return (
			<Tooltip title="Edit Nickname!" arrow
				PopperProps={{
					modifiers: [
					{
						name: 'offset',
						options: {
						offset: [-48, -191],
						},
					},
				],
				}}
			>
				<IconButton
					variant="contained"
					onClick={CheckChange}
					sx={{
							fontSize: '30px',
							top: '-190px',
							left: '500px',
							width: '50px',
							'&:hover': {
								color: '#09af07',
							},
					}}
				>
					<EditIcon fontSize="inherit"/>
				</IconButton>
				{showInput && (
					<Input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDownNickname}
					placeholder="Type new nickname..."
					sx={{
						top: '-140px',
						left: '380px',
					}}
					/>
				)}
			</Tooltip>
		);
	} //still need to make it work

	let AddingFriendIcon = (user:any) => {
		return (
			<Tooltip title="Add Friend!" arrow>
				<IconButton
					variant="contained"
					onClick={() => AddingFriend(user)}
							sx={{
								fontSize: '30px',
								top: '-130px',
								left: '420px',
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

	let AddingFriend = (user:any) => {
		console.log("User: " + user.nameNick + " wants to add person to friendslist!");
	} //still need to make it work

	let InviteToGameIcon = (user:any) => {
		return (
			<Tooltip title="Invite to Game!" arrow>
			<IconButton
				variant="contained"
				onClick={() => InviteToGame(user)}
				sx={{
					fontSize: '30px',
					top: '-175px',
					left: '500px',
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

	let InviteToGame = (user:any) => {
		console.log("User: " + user.nameNick + " wants to invite this person to a game!");
	} //still need to make it work

	
	const CheckChangeMessage = () => {
		if (showInput)
		{
			setShowInput(false);
		}
		setShowInputMessage((prev) => !prev);
	};

	const handleKeyDownMessage = (event: React.KeyboardEvent<HTMLInputElement>) => {
		const key = event.key;
	  	if (key === 'Enter') 
	  	{
			if (inputMessage.length > 0)
			{
				SendMessage(inputMessage)
				setInputMessage('');
				setShowInputMessage(false);
			}
	 	}
  	}

	let SendMessageIcon = (user:any) => {
		return (
			<Tooltip title="Send a Message!" arrow
				PopperProps={{
					modifiers: [
					{
						name: 'offset',
						options: {
						offset: [110, -220],
						},
					},
				],
				}}
			>
				<IconButton
					variant="contained"
					onClick={CheckChangeMessage}
					sx={{
						fontSize: '30px',
						top: '-220px',
						left: '580px',
						width: '50px',
						'&:hover': {
							color: '#f4bf13',
						},
					}}
				>
					<MessageIcon fontSize="inherit"/>
				</IconButton>
				{showInputMessage && (
					<Input
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyDown={handleKeyDownMessage}
						placeholder="Type a message to send..."
						sx={{
							top: '-170px',
							left: '380px',
						}}
					/>
				)}		
			</Tooltip>
		);
	}

	let SendMessage = (message:string) => {
		console.log("User wants to send: '" + message + "' to this person!");
	} //still need to make it work

	let OtherInfo = (user:any, isUser:boolean) =>
	{
		let top;
		if (isUser == true)
			top = '-300px';
		else
			top = '-320px';

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
					left: '830px',
				}}
			>
				<Typography>
					<b>Intra name: </b>
					<br />
					{user.nameIntra}
					<br />
					<br />
					<b>Email: </b>
					<br />
					{user.email}
					<br />
				</Typography>
			</Stack>
		);
	}

	let pageWrapperUser = () => {
		return (
			<Container sx={{ padding: theme.spacing(3) }}>
				<Stack
						maxWidth={'100%'}
						overflow={'hidden'}
				>
					{userInfo(user, true)}
					<Stack
						direction={isSmallScreen ? 'column' : 'row'}
						bgcolor={theme.palette.primary.dark}
						margin={'1em'}
						minHeight={'60vh'}
					>
						{friendsBox(true)}
						{GameBox()}
					</Stack>
				</Stack>
			</Container>
		);
	};

	let pageWrapperOther = () => {
		//need to make it so that the i can get the other pesrsons info
		user.intraId = lastSegment;
		user.nameNick = "nein";
		user.nameIntra = "notdhussain";
		user.nameFirst = "ya";
		user.nameLast = "no";
		user.email = "yano@student.codam.nl";
		user.image = 'default_profile_photo.png';
		user.greeting = 'Hello, I have just landed!';
		user.status = 'online';
		/////

		return (
			<Container sx={{ padding: theme.spacing(3) }}>
				<Stack
						maxWidth={'100%'}
						overflow={'hidden'}
				>
					{userInfo(user, false)}
					<Stack
						direction={isSmallScreen ? 'column' : 'row'}
						bgcolor={theme.palette.primary.dark}
						margin={'1em'}
						minHeight={'60vh'}
					>
						{friendsBox(false)}
						{GameBox()}
					</Stack>
				</Stack>
			</Container>
		);
	};

	const [ownPage, showOwnPage] = useState(false);
	const [otherUser, setOtherUser] = useState(user);
	let bruh = async () =>
	{
		try {
			const tmp = await fetchUserProfile(lastSegment);
			if (!tmp) {
			  console.error('tmp not found');
			  return;
			}
			console.log("user: " + user.id + ", id of segment: " + tmp.id);
			if (user.id == tmp.id) 
			{
			  showOwnPage(true);
			  setOtherUser(user);
			} 
			else 
			{
			  showOwnPage(false);
			  setOtherUser(tmp);
			}
		  } catch (error) {
			console.error('Error fetching user profile:', error);
		  }		
	}

	let whichPage = () =>
	{
		bruh();
		if (ownPage == true)
		{
			if (otherUser.id != user.id)
			{
				console.log("mother ducker not working!");
			}
			else
				console.log("OtherUser is equal to user");
			return (pageWrapperUser());
		}
		else
		{
			if (otherUser.id != user.id)
			{
				console.log("OtherUser is not equal to user, lesh go!");
			}
			else
				console.log("OtherUser is equal to user, F************CK");
			return (pageWrapperOther());
		}
	}

	return (
		whichPage()
	);
};

export default ProfilePage;