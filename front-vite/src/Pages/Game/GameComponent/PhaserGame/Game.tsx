import Phaser from 'phaser';
import { GAME } from './Game.data';

import GameScene from './Scenes/GameScene';
import MainMenuScene from './Scenes/MainMenuScene';
import MatchmakingScene from './Scenes/MatchmakingScene';
import ResultsScene from './Scenes/ResultsScene';
import SettingsScene from './Scenes/SettingsScene';
import ErrorScene from './Scenes/ErrorScene';

// creates an instance of the game inside the
// React container
// @param idDiv: id of the parent DOM object
function createGame(idDiv: string): Phaser.Game {
	const config: Phaser.Types.Core.GameConfig = {
		type: Phaser.AUTO,
		width: GAME.width,
		height: GAME.height,
		parent: idDiv,
		backgroundColor: 0xe0e0e0,
		scene: [MainMenuScene, GameScene, MatchmakingScene, SettingsScene, ResultsScene, ErrorScene],
		physics: {
			default: 'arcade',
		},
	};

	return new Phaser.Game({ ...config });
}

export default createGame;
