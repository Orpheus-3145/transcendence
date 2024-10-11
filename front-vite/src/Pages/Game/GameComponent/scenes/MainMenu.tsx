import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../GameData'

export default class MainMenu extends Scene
{
  background: Phaser.GameObjects.Image = null!;
  
  constructor ()
  {
    super({ key: 'MainMenu' });
  }

  preload()
  {
    this.load.image('background', '/assets/texture/background.jpeg')
  }

  create ()
  {
    this.background = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'background');
    const imgRatio = this.background.width / this.background.height;
    
    const gameWidth = this.sys.game.config.width as number;
    const gameHeight = this.sys.game.config.height as number;
    const gameRatio = gameWidth / gameHeight;

    if (imgRatio > gameRatio) {
      // L'immagine è più larga, adatta in larghezza
      this.background.displayWidth = gameWidth;
      this.background.displayHeight = gameWidth / imgRatio;
    } else {
      // L'immagine è più alta, adatta in altezza
      this.background.displayHeight = gameHeight;
      this.background.displayWidth = gameHeight * imgRatio;
    }

    const singlePlayButton = this.add.text(400, 100, 'Play [singleplayer]', {
      fontSize: '32px',
      align: 'center'
      // fill: '#fff',
    }).setInteractive();
    singlePlayButton.on('pointerover', () => {
      singlePlayButton.setStyle({ fill: '#ff0' }); // Change color on hover
    });
    singlePlayButton.on('pointerout', () => {
      singlePlayButton.setStyle({ fill: '#fff' }); // Change color back when not hovered
    });
    singlePlayButton.on('pointerup', () => { // Handle click events
      this.scene.start('Game'); // Start the main game scene
    });

    const multiPlayButton = this.add.text(400, 150, 'Play [multiplayer]', {
      fontSize: '32px',
      align: 'center'
      // fill: '#fff',
    }).setInteractive();
    multiPlayButton.on('pointerover', () => {
      multiPlayButton.setStyle({ fill: '#ff0' }); // Change color on hover
    });
    multiPlayButton.on('pointerout', () => {
      multiPlayButton.setStyle({ fill: '#fff' }); // Change color back when not hovered
    });
    multiPlayButton.on('pointerup', () => { // Handle click events
      this.scene.start('Matchmaking'); // Start the main game scene
    });

    const settingButton = this.add.text(400, 200, 'Setting', {
      fontSize: '32px',
      align: 'center'
      // fill: '#fff',
    }).setInteractive();
    settingButton.on('pointerover', () => {
      settingButton.setStyle({ fill: '#ff0' }); // Change color on hover
    });
    settingButton.on('pointerout', () => {
      settingButton.setStyle({ fill: '#fff' }); // Change color back when not hovered
    });
    settingButton.on('pointerup', () => { // Handle click events
      this.scene.start('Settings'); // Start the main game scene
    });
  }

  changeScene()
  {
  }
}