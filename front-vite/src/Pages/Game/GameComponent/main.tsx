import MainGame from './scenes/MainGame';
import CreatingGame from './scenes/CreatingGame';
// import { Menu } from './scenes/Menu';
// import { Settings } from './scenes/Settings';
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GAME_ID_DOM } from './GameData'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: GAME_ID_DOM,
    // backgroundColor: '#028af8',
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

const StartGame = (parent: string) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
