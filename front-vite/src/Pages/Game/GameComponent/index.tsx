import React, { useEffect, useRef } from 'react';
import createGame from './PhaserGame/Game';
import { useUser } from '../../../Providers/UserContext/User';
import GameScene from './PhaserGame/Scenes/GameScene';

const GameComponent: React.FC = () => {
	const gameRef = useRef<Phaser.Game | null>(null);
	const idDiv = 'game-container';
	const playerData = useUser().user;

	useEffect(() => {
		if (gameRef.current === null) gameRef.current = createGame(idDiv);

		gameRef.current.registry.set('user42data', playerData);

		return () => {
			if (gameRef.current) {
				if (gameRef.current.scene.isActive('Game')) {
					const gameScene = gameRef.current?.scene.getScene('Game') as GameScene;

					if (gameScene) gameScene.disconnect();
				}
				gameRef.current.destroy(true);
				gameRef.current = null;
			}
		};
	}, []);

	return <div id={idDiv} />;
};

export default GameComponent;
