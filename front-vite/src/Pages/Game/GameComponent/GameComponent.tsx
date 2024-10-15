import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import Game from './Scenes/Game';
import MainMenu from './Scenes/MainMenu';
import Matchmaking from './Scenes/Matchmaking';
import Results from './Scenes/Results';
import Settings from './Scenes/Settings';
import Error from './Scenes/Error';
import { GAME } from './GameData'

const GameComponent:React.FC = () => {

	const gameRef = useRef<Phaser.Game | null>(null);

	useEffect(() => {

		if (gameRef.current === null) {

			const config: Phaser.Types.Core.GameConfig = {
				type: Phaser.AUTO,
				width: GAME.width,
				height: GAME.height,
				parent: GAME.idDiv,
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
	return <div id={GAME.idDiv} />
};

export default GameComponent;