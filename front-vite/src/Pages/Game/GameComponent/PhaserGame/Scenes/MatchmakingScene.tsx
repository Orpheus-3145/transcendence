import { GAME } from '../Game.data';
import { io, Socket } from 'socket.io-client';

import * as GameTypes from '../Types/types';

export default class MatchmakingScene extends Phaser.Scene {
	private _background!: Phaser.GameObjects.Image;
	private _socketIO!: Socket;
	private _gameInitData: GameTypes.InitData | null = null;

	private _keyEsc!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: 'Matchmaking' });
	}

	// executed when scene.start('Matchmaking') is called
	init(data: GameTypes.InitData): void {
		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;
		this._gameInitData = data;
		this.setupSocket();
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
			.setInteractive()
			.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' })) // Change color on hover
			.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
			.on('pointerup', () => this.scene.start('MainMenu')); // Start the main game

		this._socketIO.emit('waiting', this._gameInitData);
	}

	// run every frame update
	update(): void {
		// Exit game with ESC
		if (this._keyEsc.isDown) this.scene.start('MainMenu');
	}

	setupSocket(): void {
		this._socketIO = io(import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_MATCHMAKING, {
			withCredentials: true,
			transports: ['websocket'],
		});

		this._socketIO.on('ready', (sessionId: string) => {
			this._gameInitData.sessionToken = sessionId;
			this.scene.start('Game', this._gameInitData);
		});

		this._socketIO.on('gameError', (trace: string) => this.scene.start('Error', { trace }));

		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
	}
}
