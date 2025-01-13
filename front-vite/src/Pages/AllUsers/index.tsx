import React, { useState, useEffect } from 'react';
import { Stack, Link, Typography, IconButton, Tooltip, Input } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { getAll, User, UserStatus} from '../../Providers/UserContext/User';
import SearchIcon from '@mui/icons-material/Search';
import { off } from 'process';

const AllUsersPage: React.FC = () => {
	const allUsers = getAll();
	const [users, setUsers] = useState<User[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
	const [offlineUsers, setOfflineUsers] = useState<User[]>([]);
	const [showInput, setShowInput] = useState<Boolean>(false);
	const [inputValue, setInputValue] = useState<string>('');
	const [showMessage, setShowMessage] = useState<Boolean>(false);
	const [showOnline, setShowOnline] = useState<Boolean>(true);
	const [showOffline, setShowOffline] = useState<Boolean>(true);
	const [showSearch, setShowSearch] = useState<Boolean>(false);
	const navigate = useNavigate();
	
	useEffect(() => {
		const fetchUsers = async () => {
			const usersList = await getAll();
			setUsers(usersList);
			sortUsers(usersList);
		};

		fetchUsers();
	}, [onlineUsers, offlineUsers, users, showOnline, showOffline]);

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
			setUsers([]);
			var newlist: User[] = [];
			let len = Number(-1);
			for (const c of inputValue)
			{
				len++;
			}
			if (len == -1)
			{
				setUsers((await allUsers));
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
			
			if (added == 0)
				setShowMessage(true);
			else
				setShowMessage(false);
	
			setUsers(newlist);
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
			return (
				<ImageList cols={4}>
					{onlineUsers.map((item: User) => 
					(
						<ImageListItem key={item.image}>
							<img
								src={item.image}
								alt={item.nameNick}
								loading="lazy"
							/>
							<Link 
								href="" 
								onClick={() => redirectToUser(item.id)} 
								sx={{ 
									color: statusToColor(item)
								}}
							>
								{item.nameNick}
							</Link>
						</ImageListItem>
					))}
				</ImageList>
			);
		}

		return (
			<Stack alignItems="center">
				<Typography
					variant={'h5'}
					sx={{
						fontFamily: 'Georgia, serif',
					}}
				>
					Currently no online users!
				</Typography>
			</Stack>
		);
	}

	let getOffline = () =>
	{
		if (showOffline)
		{
			return (
				<ImageList cols={4}>
					{offlineUsers.map((item: User) => 
					(
						<ImageListItem key={item.image}>
							<img
								src={item.image}
								alt={item.nameNick}
								loading="lazy"
							/>
							<Link 
								href="" 
								onClick={() => redirectToUser(item.id)} 
								sx={{ 
									color: statusToColor(item)
								}}
							>
								{item.nameNick}
							</Link>
						</ImageListItem>
					))}
				</ImageList>
			);
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
			</Stack>
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
					<ImageList cols={4}>
					{users.map((item: User) => 
					(
						<ImageListItem key={item.image}>
							<img
								src={item.image}
								alt={item.nameNick}
								loading="lazy"
							/>
							<Link 
								href="" 
								onClick={() => redirectToUser(item.id)} 
								sx={{ 
									color: statusToColor(item)
								}}
							>
								{item.nameNick}
							</Link>
						</ImageListItem>
					))}
					</ImageList>
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
				{getOnline()}
				<br />
				<Stack alignItems="center">
					<Typography
						variant="h4"
						sx={{
							fontFamily: 'Georgia, serif',
						}}
					>
						Offline
					</Typography>
				</Stack>
				{getOffline()}
			</Stack>
		);
	}

	let pageWarpper = () =>
	{
		return (
			<Stack>
				{pageHeader()}
				{pageBody()}
			</Stack>
		)
	}

	return (
		pageWarpper()
	);
};

export default AllUsersPage;
