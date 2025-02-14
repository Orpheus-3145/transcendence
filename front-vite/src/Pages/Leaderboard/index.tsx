import React from 'react';
import { Box, IconButton, Stack, Typography, Avatar } from '@mui/material';
import { User, useUser, getAll, fetchLeaderboard, leaderboardData, matchData, matchRatio } from '../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {  Tooltip } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ClearIcon from '@mui/icons-material/Clear';

export const Leaderboard: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [leaderboard, setLeaderboard] = useState<leaderboardData[][]>([]);
	const [loading, setLoading] = useState<number | null>(null);

	let redirectUser = (id:number) =>
	{
		navigate('/profile/' + id.toString());
	}

	let pageHeader = () =>
	{
		return (
			<Stack>
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
						LEADERBOARD
					</Typography>
				</Stack>
				<Stack 
					direction="row" 				
					alignItems="center"
					justifyContent="center" 
					spacing={10}
				>
					<Typography 
						variant={'h2'}
						sx={{
							fontFamily: 'Georgia, serif',
							position: 'relative',
							left: '-200px',
						}}
					>
						Normal
					</Typography>
					<Typography 
						variant={'h2'}
						sx={{
							fontFamily: 'Georgia, serif',
							position: 'relative',
							left: '-60px',
						}}
					>
						Power ups
					</Typography>
					<Typography 
						variant={'h2'}
						sx={{
							fontFamily: 'Georgia, serif',
							position: 'relative',
							left: '120px',
						}}
					>
						All
					</Typography>
				</Stack>
			</Stack>
		);
	}

	let initLine = (item: leaderboardData, type: string) =>
	{
		var ratio: number = 0;
		if (Array.isArray(item.arrMatches)) 
		{
			for (const a of item.arrMatches) 
			{
				if (a.title === type) 
				{
					ratio = a.rate;
				}
			}
		}

		var namenick: string | null = item.user.nameNick;
		if (namenick != null && namenick?.length > 10)
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
						src={item.user.image}
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
						<a href="" onClick={() => redirectUser(item.user.id)}>{namenick}</a>
					</Typography>
					<Typography>
						{ratio}%
					</Typography>
				</Stack>
			</Stack>
		);			
	}

	let pageBody = (arr: leaderboardData[], type: string) =>
	{
		if (arr.length === 0)
		{
			return (
				<Stack>
					<Typography
						variant={'h5'}
						sx={{
							fontFamily: 'Georgia, serif',
						}}
					>
						No ratio's available
					</Typography>
				</Stack>
			);
		}

		return (
			<Stack
				direction='column'
				bgcolor={theme.palette.primary.main}
				spacing={'0.3em'}
				marginX={'0.8em'}
				sx={{
					width: '250px',
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
				{arr.map((item: leaderboardData) => initLine(item, type))}
			</Stack>		
		);
	}

	let leaderBoard = () =>
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
					direction="row" 
					alignItems="center"
				>
					{pageBody(leaderboard[0], "Normal")}
					{pageBody(leaderboard[1], "Power ups")}
					{pageBody(leaderboard[2], "All")}
				</Stack>
				<br />
			</Stack>
		);
	}

	let fetchUsers = async () =>
	{
		var arr: leaderboardData[][] = await fetchLeaderboard();
		setLeaderboard(arr);
	}

	let pageWrapper = () =>
	{
		useEffect(() => 
		{
			fetchUsers().then((number) => 
			{
				setLoading(number);
			});
		});
			
		if (loading === null) 
			return <Stack>Loading...</Stack>;
	
		return (leaderBoard());	
	}

	return (
		pageWrapper()
	);
};

export default Leaderboard;

