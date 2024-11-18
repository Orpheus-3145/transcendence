import React, { useState, useEffect } from 'react';
import { Stack, Link, Typography, IconButton, Tooltip, Input } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { getAll, User, UserStatus} from '../../Providers/UserContext/User';
import SearchIcon from '@mui/icons-material/Search';

const AllUsersPage: React.FC = () => {
	const allUsers = getAll();
	const [users, setUsers] = useState<User[]>([]);
	const [showInput, setShowInput] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [showMessage, setShowMessage] = useState(false);
	const [amountUsers, setAmountUsers] = useState<Number>(5);
	const navigate = useNavigate();
	
	useEffect(() => {
		const fetchUsers = async () => {
			const usersList = await getAll();
			setUsers(usersList);
		};

		fetchUsers();
	}, []);

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
				setInputValue('');
				setAmountUsers(5);
				setShowMessage(false);
				setShowInput(false);
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
			setAmountUsers(added);
			setUsers(newlist);
			setInputValue('');
			setShowInput(false);
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
		
		let col = amountUsers;
		if (col > 5)
			col = 5;

		return (
			<ImageList cols={col}>
				{users.map((item: User) => (
					<ImageListItem 
						key={item.image}>
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
