import { Socket } from 'dgram';
import { GAME } from '../Game.data'
import { io } from 'socket.io-client';

class Matchmaking extends Phaser.Scene {

	private _background!: Phaser.GameObjects.Image;
	private _wsBackendURL: string = 'http://localhost:4001/matchmaking';		//import.meta.env.ORIGIN_URL_BACK ||
	private _socketIO!: Socket;

	constructor () {

		super({ key: 'Matchmaking' });
	}

	// shots when scene.start('Matchmaking') is called
  init() {

		this._socketIO = io(this._wsBackendURL, {
			withCredentials: true, // Include cookies, if necessary
		});

		this._socketIO.on('message', () => {
				console.log('Ready to play!');
				this.scene.start('Game');
		});
		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
  }

	// loading graphic assets, fired after init()
  preload(): void {}

	// run after preload(), creation of the elements of the menu
  create () {

		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);
    
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
  update(): void {}
};

export default Matchmaking;