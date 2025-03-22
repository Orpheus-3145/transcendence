import { Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameData } from '/app/src/Types/Game/Interfaces';
import TextWidget from '../GameObjects/TextWidget';
import PopupWidget from '../GameObjects/Popup';


export default class ResultsScene extends BaseScene {

	private _winner!: string;
	private _score!: {p1: number, p2: number};
	private _sessionToken!: string;

	private _playAgainPopup!: PopupWidget;
	private _waitingPopup!: PopupWidget;
	private _refusePopup!: PopupWidget;
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

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.3,
				`${this._winner} won!`,
				30,
				'#0f0'
		));

		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.1,
				`${this._score.p1} : ${this._score.p2}`,
				40
		));
	
		const playAgainBtn = new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.4,
			'Play again'
		)
		.setInteractive()
		.on('pointerover', () => playAgainBtn.setStyle({ fill: '#ff0' }))	// Change color on hover
		.on('pointerout', () => playAgainBtn.setStyle({ fill: '#fff' }))
		.on('pointerup', () => {

			this.sendMsgToServer('askForRematch', {sessionToken: this._sessionToken});
			// playAgainBtn.visible = false;
			this._waitingPopup.show();
		});
		this._widgets.push(playAgainBtn);
		
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
		this._widgets.push(goHomeButton);
		
		this.createWaitingPopup();
		this.createPlayAgainPopup();
		this.createRefusePopup();
	}

	setupSocket(): void {

		this._socketIO.on('acceptRematch', (data: GameData) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.hide();
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.hide();
			this.switchScene('Game', data);
		});

		this._socketIO.on('abortRematch', (info: string) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.hide();
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.hide();

			this._refusePopup.setTitle(info);
			this._refusePopup.show();
		});

		this._socketIO.on('askForRematch', (info: string) => {

			this._playAgainPopup.setTitle(info);
			this._playAgainPopup.show();
		
		});

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace }));

		this.events.on('shutdown', () => this.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any): void {
		this._socketIO.emit(msgType, content);
	}

	createWaitingPopup(): void {

		this._waitingPopup = new PopupWidget(
			this,
			'waiting for confirmation'
		);
		this._widgets.push(this._waitingPopup);
	}

	createPlayAgainPopup(): void {

		this._playAgainPopup = new PopupWidget(
			this,
			''
		);
		this._widgets.push(this._playAgainPopup);

		this._playAgainPopup.add(new TextWidget(
			this,
			this.scale.width / 2 * 0.2,
			this.scale.height / 2 * 0.75,
			'yes',
			-10,
			'#fff',
			'left'
		)
		.setInteractive()
		.on('pointerdown', () => {
			
			this.sendMsgToServer('acceptRematch', {sessionToken: this._sessionToken});
			this._playAgainPopup.hide();
		}));

		this._playAgainPopup.add(new TextWidget(
			this,
			this.scale.width / 2 * 0.8,
			this.scale.height / 2 * 0.75,
			'no',
			-10,
			'#fff',
			'right'
		)
		.setInteractive()
		.on('pointerdown', () => {

			this.sendMsgToServer('abortRematch', {sessionToken: this._sessionToken});
			this._playAgainPopup.hide();
			this.switchScene('MainMenu');
		}));
	}

	createRefusePopup(): void {
		this._refusePopup = new PopupWidget(
			this,
			''
		);
		this._widgets.push(this._refusePopup);
	
		this._refusePopup.add(new TextWidget(
			this,
			this.scale.width / 2 * 0.5,
			this.scale.height / 2 * 0.75,
			'close',
			-10)
		.setInteractive()
		.on('pointerdown', () => this.switchScene('MainMenu')));
	}

	disconnect(data?: any): void {
		this._socketIO.disconnect();
	}
}
