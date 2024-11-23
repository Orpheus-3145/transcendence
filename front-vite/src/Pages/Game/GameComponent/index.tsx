import React, { useEffect, useRef } from 'react';
import createGame from './PhaserGame/Game';
import { useUser } from '../../../Providers/UserContext/User';

const GameComponent: React.FC = () => {
	const gameRef = useRef<Phaser.Game | null>(null);
	const idDiv = 'game-container';
	const playerData = useUser().user;

	useEffect(() => {
		if (gameRef.current === null) gameRef.current = createGame(idDiv);

		gameRef.current.registry.set('user42data', playerData);

		return () => {
			if (gameRef.current) {
				gameRef.current.destroy(true);
				gameRef.current = null;
			}
		};
	}, []);

	return <div id={idDiv} />;
};

export default GameComponent;
