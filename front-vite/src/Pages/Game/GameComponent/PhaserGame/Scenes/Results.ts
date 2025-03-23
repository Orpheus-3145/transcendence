import { Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameData } from '/app/src/Types/Game/Interfaces';
import { GameResults } from '../../../../../Types/Game/Interfaces';

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

	init(data: {gameResults: GameResults, animationSelected: AnimationSelected}): void {
		super.init();
		this._winner = data.gameResults.winner;
		this._score = data.gameResults.score;
		this._sessionToken = data.gameResults.sessionToken;
		this._socketIO = data.gameResults.socket;
		if (data.animationSelected !== undefined) {
			this._animationSelected = data.animationSelected;
		}
		this.setupSocket();
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this.add
		.text(this.scale.width * 0.5, this.scale.height * 0.3, `${this._winner} won!`, {
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
		.setName('playAgainBtn')
		.on('pointerover', () => playAgainBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
		.on('pointerout', () => playAgainBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () => {

			this.sendMsgToServer('askForRematch', {sessionToken: this._sessionToken});
			playAgainBtn.visible = false;
			this._waitingPopup.setVisible(true);
		});

		const goHomeButton = this.add
		.text(this.scale.width * 0.9, this.scale.height * 0.9, 'Home', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5)
		.setInteractive()
		.on('pointerover', () => goHomeButton.setStyle({ fill: '#d7263d' })) 	// Change color on hover
		.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) 	// Change color back when not hovered
		.on('pointerup', () => this.switchScene('MainMenu' , {animationSelected: this._animationSelected})); 				// Start the main game

		this._waitingPopup = this.createWaitingPopup();
		this._waitingPopup.setVisible(false);
		this._waitingPopup.setDepth(1);
	
		this._playAgainPopup = this.createPlayAgainPopup();
		this._playAgainPopup.setVisible(false);
		this._playAgainPopup.setDepth(1);

		this._refusePopup = this.createRefusePopup();
		this._refusePopup.setVisible(false);
		this._refusePopup.setDepth(1);
	}

	setupSocket(): void {

		this._socketIO.on('acceptRematch', (data: GameData) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.setVisible(false);
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.setVisible(false);
			this.switchScene('Game', {gameData: data, animationSelected: this._animationSelected});
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

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace: trace , animationSelected: this._animationSelected}));

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

		const textTitle = this.add.text(background.width * 0.5, background.height * 0.1, 'waiting for confirmation', {
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
			this.switchScene('MainMenu', {animationSelected: this._animationSelected});
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

	disconnect(data?: any): void {
		this._socketIO.disconnect();
	}

	destroy(): void {
		super.destroy();
		// this.destroyListener();
	}
}
