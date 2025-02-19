import React from 'react';
import { Stack, Typography, Avatar } from '@mui/material';
import {  fetchLeaderboard, fetchRatios, leaderboardData, matchData, matchRatio } from '../../Providers/UserContext/User';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';


export const Leaderboard: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [leaderboard, setLeaderboard] = useState<leaderboardData[][]>([]);
	const [loading, setLoading] = useState<number | null>(null);
	const [tmpRatio, setTmpRatio] = useState<matchRatio[]>([])

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

	let initLine = (item: leaderboardData, type: string, index: number) =>
	{
		var ratio: number = 0;
		if (item.ratio != undefined)
		{
			for (const a of item.ratio) 
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
			<Stack 
				direction={'row'}
				sx={{
					width: '250px',
					cursor: 'pointer',
					justifyContent: 'flex-start',
					paddingX: '1em',
					alignItems: 'center',
					height: '73px',
					position: 'relative',
				}}
			>
				<Stack direction={'row'} 
					spacing={2} 
					alignContent='center' 
					alignItems={'center'}
				>
					<Typography>
						{index}
					</Typography>
					<Avatar
						sx={{
							width: '40px',
							height: '40px',
							bgcolor: theme.palette.primary.light,
						}}
						src={item.user.image}
					>
					</Avatar>
					<Typography 
						sx={{
							'& a': {
								textDecoration: 'none',
								color: 'white',
								'&:hover': { 
									color: 'grey'
								}
							},
						}}
					>
						<a href="" onClick={() => redirectUser(item.user.id)}>{namenick}</a>
					</Typography>
					<Typography
						sx={{
							color: 'white',
						}}
					>
						{ratio}%
					</Typography>
				</Stack>
			</Stack>
		);			
	}

	let initTable = (arr: leaderboardData[], type: string) =>
	{
		if (arr.length === 0)
		{
			return (
				<Stack>
					<Typography
						variant={'h5'}
						sx={{
							fontFamily: 'Georgia, serif',
							position: 'relative',
							left: '45px',
						}}
					>
						No stats available
					</Typography>
				</Stack>
			);
		}

		return (
			<Stack
				direction="column"
				spacing={'0.6em'}
				marginX={'0.8em'}
				sx={{
					width: '250px',
					position: 'relative',
					left: '10px',
					'& > *': {
						alignItems: 'center',
						height: '4em',
						borderRadius: '2em',
						transition: 'border-radius 0.2s ease',
						'&:hover': {
							borderRadius: '0',
						},
					},
				}}
			>
				{arr.map((item: leaderboardData, index: number) => {
					
					let color =  "#4b4b4b";
					if (index === 0) color = "#FFD700";
					else if (index === 1) color = "#C0C0C0";
					else if (index === 2) color = "#CD7F32";
					return (
						<Stack
							sx={{
								backgroundColor: alpha(color, 0.8),
								'&:hover': {
									backgroundColor: alpha(color, 0.7),
								},
							}}
						>
							{initLine(item, type, index + 1)}
						</Stack>
					);
				})}
			</Stack>
		);
		
	}

	let pageBody = (arr: leaderboardData[], type: string[], left: string[], index: number) =>
	{
		return (
				<Stack
					direction="row" 
					alignItems="center"
					height='450px'
				>
					<Stack
						direction="row" 
						alignItems="center"
						height='400px'
						width='300px'
						bgcolor={theme.palette.primary.dark}
						sx={{
							position: 'relative',
							left: left[index],
							borderRadius: "10px",
							overflow: "hidden",
						}}
					>
						{initTable(arr, type[index])}
					</Stack>
				</Stack>
		);
	}

	let leaderBoard = () =>
	{
		const typearr: string[] = ["Normal", "Power ups", "All"];
		const leftarr: string[] = ['80px', '240px', '380px'];
		return (
			<Stack>
				<Stack
				bgcolor={theme.palette.primary.dark}
				height='200px'
				>
					{pageHeader()}
				</Stack>
				<br />
				<Stack
					direction="row" 
					alignItems="center"
					height='450px'
				>
					{leaderboard.map((arr: leaderboardData[], index: number) => pageBody(arr, typearr, leftarr, index))}
				</Stack>
			</Stack>
		);
	}

	let fetchUsers = async () =>
	{
		var arr: leaderboardData[][] = await fetchLeaderboard();
		setLeaderboard(arr);
	}


	useEffect(() => 
	{
		fetchUsers().then((number) => 
		{
			setLoading(number);
		});
	}, []);
	
	let pageWrapper = () =>
	{
			
		if (loading === null) 
			return <Stack>Loading...</Stack>;
	
		return (leaderBoard());	
	}

	return (
		pageWrapper()
	);
};

export default Leaderboard;

