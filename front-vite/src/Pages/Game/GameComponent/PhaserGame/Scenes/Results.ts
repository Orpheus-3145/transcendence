import { Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import { GameData } from '/app/src/Types/Game/Interfaces';
import TextWidget from '../GameObjects/TextWidget';
import PopupWidget from '../GameObjects/Popup';
import ButtonWidget from '../GameObjects/Button';


export default class ResultsScene extends BaseScene {

	private _winner!: string;
	private _score!: {p1: number, p2: number};
	private _sessionToken!: string;

	private _playAgainBtn: ButtonWidget | null = null;
	private _playAgainPopup!: PopupWidget;
	private _waitingPopup!: PopupWidget;
	private _refusePopup!: PopupWidget;
	private _socketIO!: Socket;

	private _lastUpdate: number = 1;
	private readonly _bufferChars: Array<string> = ["-", "\\", "|", "/", "-", "\\", "|", "/"];
	private _frontIndexBuffer: number = 0;
	private _retroIndexBuffer: number = 0;

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
	
		this._playAgainBtn = new ButtonWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.5,
			'PLAY AGAIN',
			() => {

				this.sendMsgToServer('askForRematch', {sessionToken: this._sessionToken});
				this._playAgainBtn!.hide();
				this._waitingPopup.show();
			},
			40,
			'#00ff00'
		)
		this._widgets.push(this._playAgainBtn!);
		
		const goHomeButton = new ButtonWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home',
			() => this.switchScene('MainMenu'),
			20,
			'#dd0000'
		)
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

			this._playAgainBtn!.hide();
			if (this._waitingPopup.visible === true)
				this._waitingPopup.hide();
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.hide();

			this._refusePopup.setTitle(info);
			this._refusePopup.show();
		});

		this._socketIO.on('askForRematch', (info: string) => {

			this._playAgainBtn!.hide();
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

		this._waitingPopup = new PopupWidget(this, 'waiting for confirmation');
		const closeBtn = new ButtonWidget(
			this,
			this.scale.width / 2 * 0.5,
			this.scale.height / 2 * 0.75,
			'close',
			() => this.switchScene('MainMenu'),
		);
		this._waitingPopup.add(closeBtn);
		this._widgets.push(this._waitingPopup);
	}

	createPlayAgainPopup(): void {

		this._playAgainPopup = new PopupWidget(this);
		this._widgets.push(this._playAgainPopup);

		const yesBtn = new ButtonWidget(
			this,
			this.scale.width / 2 * 0.2,
			this.scale.height / 2 * 0.75,
			'yes',
			() => {
			
				this.sendMsgToServer('acceptRematch', {sessionToken: this._sessionToken});
				this._playAgainPopup.hide();
			},
			0,
			'#ffffff',
			'left'
		);
		this._playAgainPopup.add(yesBtn);

		const noBtn = new ButtonWidget(
			this,
			this.scale.width / 2 * 0.8,
			this.scale.height / 2 * 0.75,
			'no',
			() => {
				this.sendMsgToServer('abortRematch', {sessionToken: this._sessionToken});
				this._playAgainPopup.hide();
				this.switchScene('MainMenu');
			},
			0,
			'#ffffff',
			'right'
		);
		this._playAgainPopup.add(noBtn);
	}

	createRefusePopup(): void {
		this._refusePopup = new PopupWidget(this);
		this._widgets.push(this._refusePopup);
	
		const closeBtn = new ButtonWidget(
			this,
			this.scale.width / 2 * 0.5,
			this.scale.height / 2 * 0.75,
			'close',
			() => this.switchScene('MainMenu'),
		);
		this._refusePopup.add(closeBtn);
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		if (time - this._lastUpdate >= 100) {
			this._lastUpdate = time;
			this._waitingPopup.setTitle(`${this._bufferChars[this._retroIndexBuffer]} waiting for confirmation ${this._bufferChars[this._frontIndexBuffer]}`);
			this._frontIndexBuffer = (this._frontIndexBuffer === this._bufferChars.length - 1) ? 0 : this._frontIndexBuffer + 1;
			this._retroIndexBuffer = (this._retroIndexBuffer === 0) ? this._bufferChars.length - 1 : this._retroIndexBuffer - 1;
		}
	}

	// resizeObects(old_width: number, old_height: number): void {

	// 	super.resizeObects(old_width, old_height);
		
	// 	const w_ratio = this.scale.width / old_width;
	// 	const h_ratio = this.scale.height / old_height;
		
	// 	this._waitingPopup.setPosition(this.scale.width / 4 * w_ratio, this.scale.height / 4 * h_ratio);
  //   this._waitingPopup.setDisplaySize(this.scale.width / 2 * w_ratio, this.scale.height / 2 * h_ratio);
	// 	this._playAgainPopup.setPosition(this._playAgainPopup.x * w_ratio, this._playAgainPopup.y * h_ratio);
  //   this._playAgainPopup.setDisplaySize(this._playAgainPopup.width * w_ratio, this._playAgainPopup.height * h_ratio);
	// 	this._refusePopup.setPosition(this._refusePopup.x * w_ratio, this._refusePopup.y * h_ratio);
  //   this._refusePopup.setDisplaySize(this._refusePopup.width * w_ratio, this._refusePopup.height * h_ratio);
	// }

	disconnect(data?: any): void {
		this._socketIO.disconnect();
	}
}
