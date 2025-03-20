import { Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameData } from '/app/src/Types/Game/Interfaces';
import TextWidget from '../GameObjects/TextWidget';


export default class ResultsScene extends BaseScene {

	private _winner!: string;
	private _score!: {p1: number, p2: number};
	private _sessionToken!: string;

	private _playAgainPopup!: Phaser.GameObjects.Container;
	private _waitingPopup!: Phaser.GameObjects.Container;
	private _refusePopup!: Phaser.GameObjects.Container;
	private _socketIO!: Socket;

	constructor() {
		super({ key: 'Results' });
	}

		init(data: { winner: string, score: {p1: number, p2: number}, sessionToken: string, socket: Socket }): void {
		super.init();

		this._winner = data.winner;
		this._score = data.score;
		this._sessionToken = data.sessionToken;
		this._socketIO = data.socket;

		this.setupSocket();
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.3,
			`${this._winner} won!`,
			30
		);

		new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.1,
			`${this._score.p1} : ${this._score.p2}`,
			40
		);
	
		const playAgainBtn = new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.4,
			'Play again'
		)
		.setInteractive()
		.setName('playAgainBtn')
		.on('pointerover', () => playAgainBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
		.on('pointerout', () => playAgainBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () => {

			this.sendMsgToServer('askForRematch', {sessionToken: this._sessionToken});
			playAgainBtn.visible = false;
			this._waitingPopup.setVisible(true);
		});

		const goHomeButton = new TextWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home'
		)
		.setInteractive()
		.on('pointerover', () => goHomeButton.setStyle({ fill: '#FFA500' })) // Change color on hover
		.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
		.on('pointerup', () => this.switchScene('MainMenu')); // Start the main game

		this._waitingPopup = this.createWaitingPopup();
		this._waitingPopup.setVisible(false);
	
		this._playAgainPopup = this.createPlayAgainPopup();
		this._playAgainPopup.setVisible(false);

		this._refusePopup = this.createRefusePopup();
		this._refusePopup.setVisible(false);
	}

	setupSocket(): void {

		this._socketIO.on('acceptRematch', (data: GameData) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.setVisible(false);
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.setVisible(false);
			this.switchScene('Game', data);
		});

		this._socketIO.on('abortRematch', (info: string) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.setVisible(false);
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.setVisible(false);

			(this.children.getByName('playAgainBtn') as Phaser.GameObjects.Text).visible = false;

			(this._refusePopup.getByName('textTitle') as Phaser.GameObjects.Text).setText(info);
			this._refusePopup.setVisible(true);
		});

		this._socketIO.on('askForRematch', (info: string) => {
			(this.children.getByName('playAgainBtn') as Phaser.GameObjects.Text).visible = false;

			(this._playAgainPopup.getByName('textTitle') as Phaser.GameObjects.Text).setText(info);
			this._playAgainPopup.setVisible(true);
		
		});

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace }));

		this.events.on('shutdown', () => this.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any): void {
		this._socketIO.emit(msgType, content);
	}

	createWaitingPopup() {

		const waitingPopup = this.add.container(this.scale.width / 4, this.scale.height / 4);

		const background = this.add.rectangle(this.scale.width / 4,
				this.scale.height / 4,
				this.scale.width / 2,
				this.scale.height / 2,
				0xfff,
				1)
			.setStrokeStyle(2, 0xffffff)
			.setInteractive()
			.setOrigin(0.5, 0.5);

		const textTitle = new TextWidget(
			this,
			background.width * 0.5,
			background.height * 0.1,
			'waiting for confirmation'
		);

		waitingPopup.add([background, textTitle]);

		return waitingPopup;
	}

	createPlayAgainPopup() {
		const rematchPopup = this.add.container(this.scale.width / 4, this.scale.height / 4);

		const background = this.add.rectangle(this.scale.width / 4,
			this.scale.height / 4,
			this.scale.width / 2,
			this.scale.height / 2,
			0xfff,
			1)
		.setStrokeStyle(2, 0xffffff)
		.setInteractive()
		.setOrigin(0.5, 0.5);

		const textTitle = new TextWidget(
			this,
			background.width * 0.5,
			background.height * 0.1,
			'/'
		);

		const yesButton = new TextWidget(
			this,
			background.width * 0.2,
			background.height * 0.75,
			'yes',
			-10,
			'#fff',
			'left'
		)
		.setInteractive()
		.on('pointerdown', () => {
			
			this.sendMsgToServer('acceptRematch', {sessionToken: this._sessionToken});
			this._playAgainPopup.setVisible(false);
		});

		const noButton = new TextWidget(
			this,
			background.width * 0.8,
			background.height * 0.75,
			'no',
			-10,
			'#fff',
			'right'
		)
		.setInteractive()
		.on('pointerdown', () => {

			this.sendMsgToServer('abortRematch', {sessionToken: this._sessionToken});
			this._playAgainPopup.setVisible(false);
			this.switchScene('MainMenu');
		});

		rematchPopup.add([background, textTitle, yesButton, noButton]);

		return rematchPopup;
	}

	createRefusePopup() {

		const refusePopup = this.add.container(this.scale.width / 4, this.scale.height / 4);

		const background = this.add.rectangle(this.scale.width / 4,
			this.scale.height / 4,
			this.scale.width / 2,
			this.scale.height / 2,
			0xfff,
			1)
		.setStrokeStyle(2, 0xffffff)
		.setInteractive()
		.setOrigin(0.5, 0.5);

		const textTitle = new TextWidget(
			this,
			background.width * 0.5,
			background.height * 0.1,
			'/'
		)
		.setName('textTitle')
	
		const closeButton = new TextWidget(
			this,
			background.width * 0.5,
			background.height * 0.75,
			'close',
			-10)
		.setInteractive()
		.on('pointerdown', () => refusePopup.setVisible(false));

		refusePopup.add([background, textTitle, closeButton]);

		return refusePopup;
	}

	disconnect(data?: any): void {
		this._socketIO.disconnect();
	}
}
