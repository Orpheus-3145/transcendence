import React, { useContext, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import Phaser from 'phaser';

import { useUser } from '/app/src/Providers/UserContext/User';
import { GameDataContext } from '/app/src/Providers/GameContext/Game';
import GameScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Game';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import MainMenuScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/MainMenu';
import MatchmakingScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Matchmaking';
import ResultsScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Results';
import SettingsScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Settings';
import ErrorScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Error';
import BackgroundSelectionScene from './PhaserGame/Scenes/BackgroundSelection';


const GameBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.primary.main,
	width: '100%',
	display: 'flex',				 			// Enable flexbox
	justifyContent: 'center', 		// Center horizontally
	alignItems: 'center', 				// Center vertically
	position: 'relative',
}));

const GameComponent: React.FC = () => {

	const containerRef = useRef<HTMLDivElement | null>(null);
	const playerData = useUser().user;
	const { gameData } = useContext(GameDataContext)!;

	let gameInstance: Phaser.Game | null = null;

	const handleResize = () => {
		if (gameInstance && containerRef.current) {

			// resize game window keeping same ratio (16/9)
			const { width, height } = containerRef.current.getBoundingClientRect();
			const old_width = gameInstance.scale.width;
			const old_height = gameInstance.scale.height;
			gameInstance.scale.resize(width, width * 9 / 16);

			gameInstance.scene.getScenes(true).forEach( (scene: Phaser.Scene) => {
				// resize all the objects inside of every scene
				if (scene instanceof BaseScene) {
					scene.resizeObects(old_width, old_height);
					if (scene instanceof GameScene)
						scene.resetWindowRatio();
				}
			});
		}
	}

	useEffect(() => {

		if (gameInstance === null) {

			const cnt = containerRef.current!;
			const { width, height } = cnt.getBoundingClientRect();

			const config: Phaser.Types.Core.GameConfig = {
					type: Phaser.AUTO,
					width: width,
					height: width * 9 / 16,
					parent: containerRef.current,
					// backgroundColor: 0xe0e0e0,
					backgroundColor: 0x000000,
					scene: [MainMenuScene, GameScene, MatchmakingScene, SettingsScene, ResultsScene, ErrorScene, BackgroundSelectionScene],
					physics: {
						default: 'arcade',
					},
					scale: {
						autoCenter: Phaser.Scale.CENTER_BOTH,
					},
					fps: {
						target: 60,
						forceSetTimeOut: true,
					},
					autoFocus: true,
					render: {
						antialias: true,
					},
					input: {
						keyboard: true,
						mouse: true,
						touch: true,
						gamepad: true
					}
			};

			gameInstance = new Phaser.Game({ ...config });
		}

		// passing to game info about user
		gameInstance.registry.set('user42data', playerData);
		// passign data in case a game invitation was accepted
		if ( gameData )
			gameInstance.registry.set('gameInvitationData', gameData);
		
		// add hook the container of the game is resized
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);

			if (gameInstance) {
				const scenesToDisconnect = ['Matchmaking', 'Game', 'Results'];
				for (const sceneName of scenesToDisconnect) {
					if (gameInstance.scene.isActive(sceneName)) {	// if game is running client needs to be disconnected
						const gameScene = gameInstance.scene.getScene(sceneName) as BaseScene;
						if (gameScene)
							gameScene.disconnect();
					}
				}
				gameInstance.destroy(true);
				gameInstance = null;
			}
		};
	}, [gameData]);

	return (
		<GameBox ref={containerRef}/>
	);
};

export default GameComponent;
