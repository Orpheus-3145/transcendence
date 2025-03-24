import { Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameData } from '/app/src/Types/Game/Interfaces';


export default class ResultsScene extends BaseScene {

	private _winner!: string;
	private _score!: {p1: number, p2: number};
	private _sessionToken!: string | null;
	private _winByForfeit!: boolean;

	private _playAgainPopup!: Phaser.GameObjects.Container;
	private _waitingPopup!: Phaser.GameObjects.Container;
	private _refusePopup!: Phaser.GameObjects.Container;
	private _socketIO!: Socket | null;

	constructor() {
		super({ key: 'Results' });
	}

		init(data: { winner: string, score: {p1: number, p2: number}, sessionToken: string | null, socket: Socket | null, winByForfeit: boolean }): void {
		super.init();

		this._winner = data.winner;
		this._score = data.score;
		this._winByForfeit = data.winByForfeit;
		this._sessionToken = data.sessionToken;
		this._socketIO = data.socket;

		this.setupSocket();
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		let winText: string = '';
		if (this._winner === this.registry.get('user42data').nameNick) {
			winText = `You won!`;
			if (this._winByForfeit)
				winText += ' [opponent left the game]';
		}
		else
			winText = `You lose!`;
		this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.3, winText, {
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
	
		if (this._winByForfeit === false) {

			const playAgainBtn = this.add
			.text(this.scale.width * 0.5, this.scale.height * 0.45, 'Play again', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff',
			})
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.setName('playAgainBtn')
			.on('pointerover', () => playAgainBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
			.on('pointerout', () => playAgainBtn.setStyle({ fill: '#fff' }))
			.on('pointerup', () => {
	
				this.sendMsgToServer('askForRematch', {sessionToken: this._sessionToken});
				playAgainBtn.visible = false;
				this._waitingPopup.setVisible(true);
			});
		}

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

		if (this._winByForfeit === true)		// other player left, no need for other connection with websocket
			return;

		this._socketIO!.on('acceptRematch', (data: GameData) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.setVisible(false);
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.setVisible(false);
			this.switchScene('Game', data);
		});

		this._socketIO!.on('abortRematch', (info: string) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.setVisible(false);
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.setVisible(false);

			(this.children.getByName('playAgainBtn') as Phaser.GameObjects.Text).visible = false;

			(this._refusePopup.getByName('textTitle') as Phaser.GameObjects.Text).setText(info);
			this._refusePopup.setVisible(true);
		});

		this._socketIO!.on('askForRematch', (info: string) => {
			(this.children.getByName('playAgainBtn') as Phaser.GameObjects.Text).visible = false;

			(this._playAgainPopup.getByName('textTitle') as Phaser.GameObjects.Text).setText(info);
			this._playAgainPopup.setVisible(true);
		
		});

		this._socketIO!.on('gameError', (trace: string) => this.switchScene('Error', { trace }));

		this.events.on('shutdown', () => this.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any): void {
		this._socketIO!.emit(msgType, content);
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

		const textTitle = this.add.text(background.width * 0.5, background.height * 0.1, 'waiting for confirmation', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5);

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

		const textTitle = this.add.text(background.width * 0.5, background.height * 0.1, '/', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setName('textTitle')
		.setOrigin(0.5, 0.5);

		const yesButton = this.add.text(background.width * 0.2, background.height * 0.75, 'yes', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) - 10}px`,
				align: 'left',
				color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerdown', () => {
			
			this.sendMsgToServer('acceptRematch', {sessionToken: this._sessionToken});
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

		const textTitle = this.add.text(background.width * 0.5, background.height * 0.1, '/', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setName('textTitle')
		.setOrigin(0.5, 0.5);
	
		const closeButton = this.add.text(background.width * 0.5, background.height * 0.75, 'go home', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width) - 10}px`,
				align: 'left',
				color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerdown', () => this.switchScene('MainMenu'));

		refusePopup.add([background, textTitle, closeButton]);

		return refusePopup;
	}

	disconnect(data?: any): void {
		if (this._winByForfeit === true)		// other player left, no need for other connection with websocket
			return;
		this._socketIO!.disconnect();
		this.events.off('shutdown');
	}
}
