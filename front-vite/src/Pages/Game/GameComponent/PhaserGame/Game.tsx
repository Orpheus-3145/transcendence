import Phaser from 'phaser';
import Game from './Scenes/Game';
import MainMenu from './Scenes/MainMenu';
import Matchmaking from './Scenes/Matchmaking';
import Results from './Scenes/Results';
import Settings from './Scenes/Settings';
import Error from './Scenes/Error';
import { GAME } from './Game.data'

function createGame( idDiv: string ): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME.width,
    height: GAME.height,
    parent: idDiv,
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
  
  return new Phaser.Game({ ...config});
}

export default createGame;
