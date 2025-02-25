import React, { useEffect, useRef } from 'react';
import { useLocation } from "react-router-dom";
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import Phaser from 'phaser';

import { useUser } from '../../../Providers/UserContext/User';
import GameScene from './PhaserGame/Scenes/Game';
import BaseScene from './PhaserGame/Scenes/Base';
import MainMenuScene from './PhaserGame/Scenes/MainMenu';
import MatchmakingScene from './PhaserGame/Scenes/Matchmaking';
import ResultsScene from './PhaserGame/Scenes/Results';
import SettingsScene from './PhaserGame/Scenes/Settings';
import ErrorScene from './PhaserGame/Scenes/Error';


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
	const location = useLocation();
	
	let gameInstance: Phaser.Game | null = null;

	const handleResize = () => {
		if (gameInstance && containerRef.current) {
			
			// resize game window keeping same ratio (16/9)
			const { width, height } = containerRef.current.getBoundingClientRect();
			gameInstance.scale.resize(width, width * 9 / 16);
			
			gameInstance.scene.getScenes(true).forEach( (scene: Phaser.Scene) => {
				// resize all the objects inside of every scene
				if (scene instanceof BaseScene) {
					scene.killChildren();
					if (scene instanceof GameScene)
						scene.resetWindowRatio()

					scene.buildGraphicObjects();
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
					backgroundColor: 0xe0e0e0,
					scene: [MainMenuScene, GameScene, MatchmakingScene, SettingsScene, ResultsScene, ErrorScene],
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

		if ( location && location.state && location.state.info ) {
			gameInstance.scene.stop('MainMenu');
			gameInstance.scene.start('Game', location.state.info);
		}

		// add hook the container of the game is resized
		window.addEventListener('resize', handleResize);

		// passing to game info about user
		gameInstance.registry.set('user42data', playerData);

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
	}, []);

	return (
		<GameBox ref={containerRef}/>
	);
};

export default GameComponent;
