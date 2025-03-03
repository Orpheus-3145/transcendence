import React, { useState, useEffect } from 'react';
import { Stack, Link, Typography, IconButton, Tooltip, Input, useTheme, Divider, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { getAll } from '../../Providers/UserContext/User';
import { User } from '../../Types/User/Interfaces';
import { UserStatus } from '../../Types/User/Enum';
import SearchIcon from '@mui/icons-material/Search';


const AllUsersPage: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const allUsers = getAll();
	const [searchUsers, setSearchUsers] = useState<User[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
	const [offlineUsers, setOfflineUsers] = useState<User[]>([]);
	const [showInput, setShowInput] = useState<Boolean>(false);
	const [inputValue, setInputValue] = useState<string>('');
	const [showMessage, setShowMessage] = useState<Boolean>(false);
	const [showOnline, setShowOnline] = useState<Boolean>(true);
	const [showOffline, setShowOffline] = useState<Boolean>(true);
	const [showSearch, setShowSearch] = useState<Boolean>(false);

	let sortUsers = (arr: User[]) =>
	{
		const online: User[] = [];
		const offline: User[] = [];
		arr.forEach((item: User) => 
		{
			if (item.status === UserStatus.Online || item.status === UserStatus.InGame) 
			{
				online.push(item);
			} 
			else 
			{
				offline.push(item);
			}
		});
		setOnlineUsers(online);
		setOfflineUsers(offline);
		setShowOnline(true);
		setShowOffline(true);
		if (offline.length === 0)
		{
			setShowOffline(false);
		}
		if (online.length === 0)
		{
			setShowOnline(false);
		}
	}

	let redirectToUser = (id: number) => {
		navigate(`/profile/${id}`);
	}
 
	const CheckChange = () => 
	{
		setShowInput((prev) => !prev);
	};
	
	const handleSearch = async (event: React.KeyboardEvent<HTMLInputElement>): Promise<void> => 
	{
		const key = event.key;
		let added = Number(0);
		if (key === 'Enter')
		{
			setSearchUsers([]);
			var newlist: User[] = [];
			let len = Number(-1);
			for (const c of inputValue)
			{
				len++;
			}
			if (len == -1)
			{
				sortUsers((await allUsers));
				setInputValue('');
				setShowMessage(false);
				setShowInput(false);
				setShowSearch(false);
				return ;
			}

			(await allUsers).forEach((item: User) => {
				let name = item.nameNick;
				let numb = Number(-1);
				if (name)
				{
					numb = name.search(inputValue);
				}
				if (numb !== -1)
				{
					newlist.push(item);
					added++;
				}
			});
			
			if (added === 0)
				setShowMessage(true);
			else
				setShowMessage(false);

			setSearchUsers(newlist);
			setInputValue('');
			setShowInput(false);
			setShowSearch(true);
		}
	}

	let pageHeader = () =>
	{
		return (
			<Stack
				direction="row"
				alignItems="center"
				justifyContent="center"
				spacing={2}
				sx={{
					position: 'relative',
					padding: '20px',
				}}
			>
				<Typography
					variant={'h2'}
					sx={{
						fontFamily: 'Georgia, serif',
					}}
				>
					USERS
				</Typography>
				<Tooltip title="Search User!" arrow>
					<IconButton
						variant="contained"
						onClick={CheckChange}
						component="label"
						sx={{
							width: '60px',
							height: '60px',
							fontSize: '40px',
							'&:hover': {
								color: '#09af07',
							},
						}}
					>
						<SearchIcon fontSize="inherit" />
					</IconButton>
				</Tooltip>
				{showInput && (
					<Input
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleSearch}
						placeholder="Type users nickname or leave empty to see everyone"
						sx={{
							width: '400px',
						}}
					/>
				)}
			</Stack>
		);
	}

	let statusToColor = (user:User) =>
	{
		if (user.status == UserStatus.Online)
			return ('green');
		if (user.status == UserStatus.InGame)
			return ('blue');
		return ('red');
	}

	let getOnline = () =>
	{
		if (showOnline)
		{
			return (imageArr(onlineUsers));
		}

		return (
			<Stack alignItems="center">
				<Typography
					variant={'h5'}
					sx={{
						fontFamily: 'Georgia, serif',
					}}
				>
					<br />
					Currently no online users!
				</Typography>
			</Stack>
		);
	}

	let getOffline = () =>
	{
		if (showOffline)
		{
			return (imageArr(offlineUsers));
		}

		return (
			<Stack alignItems="center">
				<Typography
					variant={'h5'}
					sx={{
						fontFamily: 'Georgia, serif',
					}}
				>
					Currently no offline users!
				</Typography>
				<br />
				<br />
			</Stack>
		);
	}

	let imageArr = (arr: User[]) => 
	{
		return (
			<ImageList 
				cols={4} 
				sx={{
					overflowX: 'hidden',
					margin: 0,
					padding: 0,
				}}
			>
				{arr.map((item: User) => 
				(
					<ImageListItem key={item.image}>
						<Stack
						sx={{
							alignItems: 'center',
							spacing: 1,
						}}
						>
							<Avatar
								sx={{
								width: '250px',
								height: '250px',
								bgcolor: theme.palette.primary.light,
								borderRadius: 0,
								}}
								src={item.image}
							/>
							<Link 
								href="" 
								onClick={() => redirectToUser(item.id)} 
								sx={{
								color: statusToColor(item),
								marginTop: '8px',
								textAlign: 'center',
								}}
							>
								{item.nameNick}
							</Link>
						</Stack>
				  </ImageListItem>
				))}
			</ImageList>
		);
	}

	let pageBody = () => 
	{
		if (showMessage)
		{
			return (
				<Stack
				direction="row"
				alignItems="center"
				justifyContent="center"
				spacing={2}
				sx={{
					position: 'relative',
					padding: '20px',
				}}>
					<Typography
						variant={'h4'}
						sx={{
							fontFamily: 'Georgia, serif',
						}}
					>
						No users found with this nickname, try an other...
					</Typography>
				</Stack>
			);
		}

		if (showSearch)
		{
			return (
				<Stack>
					<br />
					{imageArr(searchUsers)}
				</Stack>
			);
		}

		return (
			<Stack>
				<Stack alignItems="center">
					<Typography
						variant="h4"
						sx={{
							fontFamily: 'Georgia, serif',
						}}
					>
						Online
					</Typography>
				</Stack>
				<br />
				{getOnline()}
				<Stack alignItems="center">
					<Typography
						variant="h4"
						sx={{
							fontFamily: 'Georgia, serif',
						}}
					>
						<br />
						Offline
					</Typography>
				</Stack>
				<br />
				{getOffline()}
			</Stack>
		);
	}

	useEffect(() => {
		const fetchUsers = async () => {
			const usersList = await getAll();
			sortUsers(usersList);
		};

		fetchUsers();
	}, [searchUsers]);

	let pageWrapper = () =>
	{
		return (
			<Stack>
				<Stack
					bgcolor={theme.palette.primary.dark}
				>
					{pageHeader()}
				</Stack>
				<br />
				<Stack
					bgcolor={theme.palette.primary.dark}
				>
					{pageBody()}
				</Stack> 
				<br />
			</Stack>
		);
	}

	return (
		pageWrapper()
	);
};

export default AllUsersPage;
