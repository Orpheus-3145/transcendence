
import { GameMode, InitData } from '../Types/types';
import BaseScene from './Base';
import { io, Socket } from 'socket.io-client';

export default class ResultsScene extends BaseScene {

	// private _id: number;
	// private _nameNick: string;
	private _playAgain: boolean;
	private _winner!: string;
	private _nextGameData!: InitData;

	private _urlWebsocket: string;
	private _socketIO!: Socket;

	constructor() {
		super({ key: 'Results' });
		
		// this._id = this.registry.get('user42data').id;
		// this._nameNick = this.registry.get('user42data').nameNick;
		this._playAgain = false;
		this._urlWebsocket = import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_SIMULATION;
	}

	// fired then scene.start('Results') is called, sets the id
	init(data: { winner: string, nextGameData: InitData }): void {
		super.init();

		this._winner = data.winner;
		this._nextGameData = data.nextGameData

		this.setupSocket();
	}

	// Create game objects and establish WebSocket connection
	create(): void {
		super.create()

		this.sendMsgToServer('joinQueue', this._nextGameData); // send data to the backend, adds player
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.2, `Player ${this._winner} won!`, {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 50}px`,
			align: 'center',
			color: '#0f0',
			wordWrap: { 
				width: this.scale.width * 0.5,
			},
		})
		.setOrigin(0.5, 0.5);
		
			
		const playAgainBtn = this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.4, 'Play again', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => playAgainBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
		.on('pointerout', () => playAgainBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () => {

			playAgainBtn.visible = false;
			this.sendMsgToServer('playAgain');
		});

		const goHomeButton = this.add
		.text(this.scale.width * 0.9, this.scale.height * 0.9, 'Home', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' })) 	// Change color on hover
		.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) 		// Change color back when not hovered
		.on('pointerup', () => this.switchScene('MainMenu')); 							// Start the main game
	}

	setupSocket(): void {

		this._socketIO = io(import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_REMATCH, {
			withCredentials: true,
			transports: ['websocket'],
		});

		this._socketIO.on('readySingleGame', () => this.switchScene('Game'));

		this._socketIO.on('newMultiGame', (sessionId: string) => {

				this._nextGameData.sessionToken = sessionId;
				this.switchScene('Game', this._nextGameData);
		});

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace }));

		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any): void {
		this._socketIO.emit(msgType, content);
	}

	createPopup() {
		// Un contenitore per il popup
		const popup = this.add.container(this.scale.width / 2, this.scale.height / 2);

		// Sfondo del popup
		const background = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8)
				.setStrokeStyle(2, 0xffffff)
				.setOrigin(0.5);

		// Testo del popup
		const text = this.add.text(0, -50, 'Questo è un popup!', {
				font: '20px Arial',
				fill: '#ffffff',
				align: 'center',
		}).setOrigin(0.5);

		// Pulsante per chiudere il popup
		const closeButton = this.add.text(0, 50, 'Chiudi', {
				font: '18px Arial',
				fill: '#ff0000',
		}).setOrigin(0.5)
				.setInteractive()
				.on('pointerdown', () => {
						popup.setVisible(false);
				});

		// Aggiungiamo gli elementi al container
		popup.add([background, text, closeButton]);

		return popup;
}

// Funzione per mostrare il popup
	showPopup() {
		if (this.someCondition) {
				this.popup.setVisible(true);
		}
}
}
