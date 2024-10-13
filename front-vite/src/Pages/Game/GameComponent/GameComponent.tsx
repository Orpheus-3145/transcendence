import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GAME_ID_DOM } from './GameData'
import Game from './scenes/Game';
import MainMenu from './scenes/MainMenu';
import Matchmaking from './scenes/Matchmaking';
import Results from './scenes/Results';
import Settings from './scenes/Settings';
import Error from './scenes/Error';


const GameComponent:React.FC = () => {
	const gameRef = useRef<Phaser.Game | null>(null);
	useEffect(() => {
		if (gameRef.current === null) {
			const config: Phaser.Types.Core.GameConfig = {
				type: Phaser.AUTO,
				width: GAME_WIDTH,
				height: GAME_HEIGHT,
				parent: GAME_ID_DOM,
				backgroundColor: 0xe0e0e0,
				scene: [
					MainMenu,
					Game,
					Matchmaking,
					Settings,
					Results,
					Error,
				],
				physics: {
						default: 'arcade',
						arcade: {
								gravity: { x: 0, y: 0 },
								debug: false,
						},
				},
			};

			gameRef.current = new Phaser.Game({ ...config});
		}

		return () => {
			if (gameRef.current) {
				gameRef.current.destroy(true);
				gameRef.current = null;
			}
		};
	}, []);
	return <div id={GAME_ID_DOM} />
};

export default GameComponent;