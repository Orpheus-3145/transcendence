import React from 'react';
import { Avatar, Box, Stack, Typography, useTheme, Divider, IconButton, Container, Modal, ButtonGroup, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { PowerUpSelected } from '../../Types/Game/Enum';

interface SettingsModalProps {
	open: boolean;
	onClose: (value: PowerUpSelected) => void;
}

export const GameInviteModal: React.FC<SettingsModalProps>  = ({ 
	open,
	onClose,
}) => {
	const theme = useTheme();
	const [speedball, setSpeedball] = useState<boolean>(false);
	const [speedpaddle, setSpeedpaddle] = useState<boolean>(false);
	const [slowpaddle, setSlowpaddle] = useState<boolean>(false);
	const [shrinkpaddle, setShrinkpaddle] = useState<boolean>(false);
	const [stretchpaddle, setStretchpaddle] = useState<boolean>(false);

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

	let calculatePowerups = () => {
		var tmpValue = PowerUpSelected.noPowerUp; 
		
		if (speedball)
			tmpValue |= PowerUpSelected.speedBall;
		if (speedpaddle)
			tmpValue |= PowerUpSelected.speedPaddle;
		if (slowpaddle)
			tmpValue |= PowerUpSelected.slowPaddle;
		if (shrinkpaddle)
			tmpValue |= PowerUpSelected.shrinkPaddle;
		if (stretchpaddle)
			tmpValue |= PowerUpSelected.stretchPaddle;
	
		onClose(tmpValue);
	}

	return (
			<Modal open={open} onClose={onClose}>
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
						onClick={() => calculatePowerups()}
						sx={{
							position: 'relative',
							top: '60px',
						}}
					>
						Send Invite
					</Button>
				</Stack>
			</Modal>		
	);
}