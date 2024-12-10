import { GAME } from '../Game.data';
import { io, Socket } from 'socket.io-client';

class Matchmaking extends Phaser.Scene {
	private _background!: Phaser.GameObjects.Image;
	private _socketIO!: Socket;

	constructor() {
		super({ key: 'Matchmaking' });
	}

	// executed when scene.start('Matchmaking') is called
	init(): void {
		this._socketIO = io(import.meta.env.URL_WEBSOCKET + '/' + import.meta.env.WS_NS_MATCHMAKING, {
			withCredentials: true,
			transports: ['websocket'],
		});

		this.events.on('shutdown', () => this._socketIO.disconnect(), this);

		this._socketIO.on('ready', (sessionId) => {
			console.log(`token: ${sessionId}`);
			this.scene.start('Game', { id: 'id1', bot: true });
		});
		this._socketIO.emit('waiting', this.registry.get('user42data'));
	}

	// loading graphic assets, fired after init()
	preload(): void {}

	// run after preload(), creation of the elements of the menu
	create(): void {
		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		this.add.text(400, 150, 'Waiting for playerz ...', {
			fontSize: '32px',
			align: 'center',
			color: '#fff',
		});
		// button for going home
		const goHomeButton = this.add
			.text(GAME.width - 150, GAME.height - 100, 'Home', {
				fontSize: '32px',
				align: 'center',
				color: '#fff',
			})
			.setInteractive();
		// Change color on hover
		goHomeButton.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' }));
		// Change color back when not hovered
		goHomeButton.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' }));
		// Start the main game
		goHomeButton.on('pointerup', () => this.scene.start('MainMenu'));
	}

	// run every frame update
	update(): void {}
}

export default Matchmaking;
