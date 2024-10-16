import { GAME } from '../Game.data'

class Matchmaking extends Phaser.Scene {

	// background texture
	private background!: Phaser.GameObjects.Image;

  constructor () {
    
    super({ key: 'Matchmaking' });
  }

	// shots when scene.start('Matchmaking') is called
  init(): void {

  }

	// loading graphic assets, fired after init()
  preload(): void {

  }

	// run after preload(), creation of the elements of the menu
  create (): void {

    this.background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
    this.background.setDisplaySize(this.scale.width, this.scale.height);
    
    this.add.text(400, 150, 'Waiting for playerz ...', {
      fontSize: '32px',
      align: 'center',
      color: '#fff',
    });

    // button for going home
		const goHomeButton = this.add.text(GAME.width - 150, GAME.height - 100, 'Home', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		}).setInteractive();
		// Change color on hover
		goHomeButton.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		goHomeButton.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' }));
		 // Start the main game
		goHomeButton.on('pointerup', () => this.scene.start('MainMenu'));
  }

  // run every frame update
  update(): void {

  }
};

export default Matchmaking;