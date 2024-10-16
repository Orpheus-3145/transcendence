import Phaser from 'phaser';
import { GAME } from './Game.data'

import Game from './Scenes/Game';
import MainMenu from './Scenes/MainMenu';
import Matchmaking from './Scenes/Matchmaking';
import Results from './Scenes/Results';
import Settings from './Scenes/Settings';
import Error from './Scenes/Error';

// creates an instance of the game inside the
// React container
// @param idDiv: id of the parent DOM object
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
    },
  };
  
  return new Phaser.Game({ ...config});
}

export default createGame;
