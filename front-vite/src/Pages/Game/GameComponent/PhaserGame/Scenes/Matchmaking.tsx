import { GAME } from '../Game.data';
import { io, Socket } from 'socket.io-client';

import * as GameTypes from '../Types/types';


export default class Matchmaking extends Phaser.Scene {

	private _background!: Phaser.GameObjects.Image;
	private _socketIO!: Socket;
	private _extras: boolean = false

  private _keyEsc!: Phaser.Input.Keyboard.Key;

	constructor () {

		super({ key: 'Matchmaking' });
	}

	// executed when scene.start('Matchmaking') is called
  init(extras: boolean): void {

		this._keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
		this._extras = extras
		this.setupSocket();
	};

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

		this._socketIO.emit('waiting');
  };

  // run every frame update
  update(): void {
	
		// Exit game with ESC
		if (this._keyEsc.isDown)
			this.scene.start('MainMenu');
	};

	setupSocket(): void {

		this._socketIO = io(
			import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_MATCHMAKING, 
			{
				withCredentials: true,
				transports: ['websocket'],
			},
		);
		
		this._socketIO.on('ready', (sessionId: string) => {
			
			const sessionData: GameTypes.InitData = {sessionToken: sessionId, mode: GameTypes.GameMode.multi, extras: this._extras};
			this.scene.start('Game', sessionData);
		});

		// this._socketIO.on('PlayerAlreadyPlaying', (trace: string) => this.scene.start('Errors', {trace})); // Adding check on the same player logging in twice?

		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
	};
};
