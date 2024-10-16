import React, { useEffect, useRef } from 'react';
import createGame from './PhaserGame/Game';

const GameComponent:React.FC = () => {

	const gameRef = useRef<Phaser.Game | null>(null);
	const idDiv = 'game-container';

	useEffect(() => {

		if (gameRef.current === null)
			gameRef.current = createGame(idDiv);

		return () => {
			if (gameRef.current) {
				gameRef.current.destroy(true);
				gameRef.current = null;
			}
		};

	}, []);

	return <div id={idDiv} />
};

export default GameComponent;