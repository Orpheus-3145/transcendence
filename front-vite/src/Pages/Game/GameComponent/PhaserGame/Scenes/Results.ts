
import { GameMode, InitData } from '../Types/types';
import BaseScene from './Base';
import { io, Socket } from 'socket.io-client';

export default class ResultsScene extends BaseScene {

	// private _id: number;
	// private _nameNick: string;
	// private _playAgain: boolean;
	private _winner!: string;
	private _score!: {p1: number, p2: number};
	private _nextGameData!: InitData;
	private _playAgainPopup!: Phaser.GameObjects.Container;
	private _waitingPopup!: Phaser.GameObjects.Container;
	private _refusePopup!: Phaser.GameObjects.Container;

	private _urlWebsocket: string;
	private _socketIO!: Socket;

	constructor() {
		super({ key: 'Results' });
		
		// this._id = this.registry.get('user42data').id;
		// this._nameNick = this.registry.get('user42data').nameNick;
		// this._playAgain = false;
		this._urlWebsocket = import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_SIMULATION;
	}

	init(data: { winner: string, score: {p1: number, p2: number}, nextGameData: InitData }): void {
		super.init();

		this._winner = data.winner;
		this._score = data.score;
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
		.text(this.scale.width * 0.5, this.scale.height * 0.25, `Player ${this._winner} won!`, {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 30}px`,
			align: 'center',
			color: '#0f0',
			wordWrap: { 
				width: this.scale.width * 0.5,
			},
		})
		.setOrigin(0.5, 0.5);

		this.add
			.text(this.scale.width * 0.5, this.scale.height * 0.1, `${this._score.p1} : ${this._score.p2}`, {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 40}px`,
				align: 'center',
				color: '#0f0',
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
			if (this._nextGameData.mode === GameMode.single)
				this.sendMsgToServer('acceptRematch');
			else if (this._nextGameData.mode === GameMode.multi) {

				this.sendMsgToServer('askForRematch');
				this._waitingPopup.setVisible(true);
			}
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
		.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) 	// Change color back when not hovered
		.on('pointerup', () => this.switchScene('MainMenu')); 				// Start the main game

		this._waitingPopup = this.createWaitingPopup();
		this._waitingPopup.setVisible(false);
		this._playAgainPopup = this.createPlayAgainPopup();
		this._playAgainPopup.setVisible(false);
		this._refusePopup = this.createRefusePopup();
		this._refusePopup.setVisible(false);
	}

	setupSocket(): void {

		this._socketIO = io(import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_REMATCH, {
			withCredentials: true,
			transports: ['websocket'],
		});

		this._socketIO.on('acceptRematch', (data: InitData) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.setVisible(false);
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.setVisible(false);
			this.switchScene('Game', data);
		});

		this._socketIO.on('refuseRematch', (data: InitData) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.setVisible(false);
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.setVisible(false);
			this._refusePopup.setVisible(true);
		});

		this._socketIO.on('askForRematch', () => this._playAgainPopup.setVisible(true));

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace }));

		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any): void {
		this._socketIO.emit(msgType, content);
	}

	createWaitingPopup() {

		const waitingPopup = this.add.container(this.scale.width / 4, this.scale.height / 4);//.setScale(0.5);

		const background = this.add.rectangle(this.scale.width / 4,
				this.scale.height / 4,
				this.scale.width / 2,
				this.scale.height / 2,
				0xfff,
				1)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive()
			.setOrigin(0.5, 0.5);

		const textTitle = this.add.text(background.width * 0.5, background.height * 0.1, 'waiting for other player', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5);

		waitingPopup.add([background, textTitle]);

		this.tweens.add({
			targets: waitingPopup,
			scaleX: 1,
			scaleY: 1,
			alpha: 1,
			duration: 500,
			ease: 'Back.Out',
		});	

		return waitingPopup;
	}

	createPlayAgainPopup() {
		const rematchPopup = this.add.container(this.scale.width / 4, this.scale.height / 4);//.setScale(0.5);

		const background = this.add.rectangle(this.scale.width / 4,
				this.scale.height / 4,
				this.scale.width / 2,
				this.scale.height / 2,
				0xfff,
				1)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive()
			.setOrigin(0.5, 0.5);

		const textTitle = this.add.text(background.width * 0.5, background.height * 0.1, 'user asked to play again', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5);

		const yesButton = this.add.text(background.width * 0.2, background.height * 0.75, 'yes', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) - 10}px`,
				align: 'left',
				color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerdown', () => {
			
			this.sendMsgToServer('acceptRematch');
			this._playAgainPopup.setVisible(false);
		});

		const noButton = this.add.text(background.width * 0.8, background.height * 0.75, 'no', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width) - 10}px`,
			align: 'right',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerdown', () => {

			this.sendMsgToServer('refuseRematch');
			this._playAgainPopup.setVisible(false);
			this.switchScene('MainMenu');
		});

		rematchPopup.add([background, textTitle, yesButton, noButton]);

		this.tweens.add({
			targets: rematchPopup,
			scaleX: 1,
			scaleY: 1,
			alpha: 1,
			duration: 500,
			ease: 'Back.Out',
		});	

		return rematchPopup;
	}

	createRefusePopup() {

		const refusePopup = this.add.container(this.scale.width / 4, this.scale.height / 4);//.setScale(0.5);

		const background = this.add.rectangle(this.scale.width / 4,
				this.scale.height / 4,
				this.scale.width / 2,
				this.scale.height / 2,
				0xfff,
				1)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive()
			.setOrigin(0.5, 0.5);

		const textTitle = this.add.text(background.width * 0.5, background.height * 0.1, 'Rematch rejected', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5);
		
		const closeButton = this.add.text(background.width * 0.5, background.height * 0.75, 'close', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) - 10}px`,
				align: 'left',
				color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerdown', () => refusePopup.setVisible(false));

		refusePopup.add([background, textTitle, closeButton]);

		this.tweens.add({
			targets: refusePopup,
			scaleX: 1,
			scaleY: 1,
			alpha: 1,
			duration: 500,
			ease: 'Back.Out',
		});	

		return refusePopup;
	}

	// showWaitingPopup() {
	// 	console.log('open waiting popup');
	// 	this._waitingPopup.setVisible(true);
	// }

	// hideWaitingPopup() {
	// 	this._waitingPopup.setVisible(false);
	// 	// this._waitingPopup.setScale(0.5);
	// }

	// showPlayAgainPopup() {
	// 	console.log('open play again popup');
	// 	this._playAgainPopup.setVisible(true);
	// }

	// hidePlayAgainPopup() {
	// 	this._playAgainPopup.setVisible(false);
	// 	// this._playAgainPopup.setScale(0.5);
	// }
}
