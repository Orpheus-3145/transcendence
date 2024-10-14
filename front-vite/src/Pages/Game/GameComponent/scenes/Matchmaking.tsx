import { Scene } from 'phaser';
import { GAME } from '../GameData'

export default class Matchmaking extends Scene
{
  background: Phaser.GameObjects.Image = null!;

  constructor () {
    
    super({ key: 'Matchmaking' });
  }

  preload() {

  }

  create () {

    this.background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    this.add.text(400, 150, 'Waiting for playerz ...', {
      fontSize: '32px',
      align: 'center',
      color: '#fff',
    });

		const goHomeButton = this.add.text(GAME.width - 150, GAME.height - 100, 'Home', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();
		goHomeButton.on('pointerover', () => {
			goHomeButton.setStyle({ fill: '#ff0' }); // Change color on hover
		});
		goHomeButton.on('pointerout', () => {
			goHomeButton.setStyle({ fill: '#fff' }); // Change color back when not hovered
		});
		goHomeButton.on('pointerup', () => {
			this.scene.start('MainMenu');
		});
  }
}