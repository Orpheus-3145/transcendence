import React from 'react';
import { fetchLeaderboard } from '../../Providers/UserContext/User';
import { Stack, Typography, Avatar, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { LeaderboardData, MatchRatio } from '../../Types/User/Interfaces';
import { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';

export const Leaderboard: React.FC = () => {
	const theme = useTheme();
	const navigate = useNavigate();
	const [leaderboard, setLeaderboard] = useState<LeaderboardData[][]>([]);
	const [loading, setLoading] = useState<number | null>(null);

	let redirectUser = (id:number) =>
	{
		navigate('/profile/' + id.toString());
	}

	let pageHeader = () =>
	{
		const typearr: string[] = ["Normal", "Power ups", "All"];

		return (
			<Stack>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="center"
					sx={{
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
				<Grid
					container
					justifyContent="space-between"
					sx={{
						maxWidth: '1200px',
						margin: '0 auto',
					}}
					>
					{typearr.map((type, index) => (
						<Grid item xs={4} textAlign="center" key={index}>
							<Typography
								variant="h2"
								sx={{
									fontFamily: 'Georgia, serif',
								}}
							>
								{type}
							</Typography>
						</Grid>
					))}
				</Grid>
			</Stack>
		);
	}

	let calcRatio = (item: MatchRatio[], type: string) =>
	{
		var ratio: number = 0;
		if (item != undefined)
		{
			for (const a of item) 
			{
				if (a.title === type) 
				{
					ratio = Math.round((a.wonGames / a.totGames) * 100);
					if (Number.isNaN(ratio))
						ratio = 0;
					return (ratio);
				}
			}
		}		
	}

	let initLine = (item: LeaderboardData, type: string, index: number) =>
	{
		var ratio: number | undefined = calcRatio(item.ratio, type);


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
					<Button onClick={() => redirectUser(item.user.id)}>
						<Typography
						sx={{
							textTransform: 'none',
						}}
						>
							{namenick}
						</Typography>
					</Button>
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

	let initTable = (arr: LeaderboardData[], type: string) =>
	{
		if (arr.length === 0)
		{
			return (
				<Stack
					sx={{
						height: '100%',
					}}
					justifyContent={"center"}
					alignItems={"center"}
				>
					<Typography
						variant={'h5'}
						sx={{
							fontFamily: 'Georgia, serif',
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
					width: '300px',
					position: 'relative',
					left: '20px',
					top: '20px',
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
				{arr.map((item: LeaderboardData, index: number) => {
					let color =  "#4b4b4b";
					if (index === 0) color = "#FFD700";
					else if (index === 1) color = "#C0C0C0";
					else if (index === 2) color = "#CD7F32";
					return (
						<Stack
							key={index}
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

	let pageBody = () =>
	{
		const typearr: string[] = ["Normal", "Power ups", "All"];

		return (
			<Grid
				container
				justifyContent="space-between"
				spacing={4}
				sx={{
					maxWidth: '1200px',
					margin: '10px auto 0',
				}}
			>
				{leaderboard.map((arr: LeaderboardData[], index: number) => (
					<Grid item xs={4} key={index} textAlign="center">
						<Stack
							bgcolor={theme.palette.primary.dark}
							sx={{
								borderRadius: "10px",
								height: '500px',
								overflow: "hidden",
							}}
						>
							{initTable(arr, typearr[index])}
						</Stack>
					</Grid>
				))}
			</Grid>
		);
	}

	let leaderBoard = () => {
		return (
			<Stack>
				<Stack bgcolor={theme.palette.primary.dark} height="200px">
					{pageHeader()}
				</Stack>
				{pageBody()}
			</Stack>
		);
	};
	
	let fetchUsers = async () =>
	{
		var arr: LeaderboardData[][] = await fetchLeaderboard();
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

