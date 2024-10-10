import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
// import StartGame from './main'
// import { AUTO, Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GAME_ID_DOM } from './GameData'
import MainGame from './scenes/MainGame';
// import CreatingGame from './scenes/CreatingGame';

const GameComponent:React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null); // to store the game instance

    useEffect(() => {
      if (gameRef.current === null) {
        const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: GAME_ID_DOM,
        backgroundColor: '#028af8',
        scene: [
            // CreatingGame,
            // Settings,
            // Menu,
            MainGame
        ],
        // physics: {
        //     default: 'arcade',
        //     arcade: {
        //         gravity: { x: 0, y: 0 },
        //         debug: false,
        //     },
        // },
      };
      gameRef.current = new Phaser.Game({ ...config}); //StartGame(GAME_ID_DOM)
    }
    // Initialize Phaser game instance

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);
  return <div id={GAME_ID_DOM} />
};

export default GameComponent;