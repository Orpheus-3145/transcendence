import { Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import TextWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/TextWidget';
import PopupWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Popup';
import ButtonWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Button';
import { GameData, GameResults } from '/app/src/Types/Game/Interfaces';
import { AnimationSelected } from '/app/src/Types/Game/Enum';


export default class ResultsScene extends BaseScene {

	private _winner!: string;
	private _score!: {p1: number, p2: number};
	private _sessionToken!: string | null;
	private _winByForfeit!: boolean;

	private _playAgainBtn: ButtonWidget | null = null;
	private _playAgainPopup!: PopupWidget;
	private _waitingPopup!: PopupWidget;
	private _refusePopup!: PopupWidget;
	private _socketIO!: Socket;

	// for the animated text while waiting
	private _lastUpdate: number = 1;
	private readonly _bufferChars: Array<string> = ["-", "\\", "|", "/", "-", "\\", "|", "/"];
	private _frontIndexBuffer: number = 0;
	private _retroIndexBuffer: number = 0;

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
				winText += '\n[opponent left the game]';
		}
		else
			winText = `You lose!`;
		this._widgets.push(
			new TextWidget(
				this,
				this.scale.width * 0.5,
				this.scale.height * 0.3,
				winText,
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
		
		// go back home btn
		this._widgets.push(new ButtonWidget(
			this,
			this.scale.width * 0.9,
			this.scale.height * 0.9,
			'Home',
			() => this.switchScene('MainMenu'),
			20,
			'#dd0000'
		));
		
		this.createWaitingPopup();
		this.createPlayAgainPopup();
		this.createRefusePopup();

		if (this._winByForfeit === true)
			this._playAgainBtn.hide();
	}

	setupSocket(): void {

		if (this._winByForfeit === true)		// other player left, no need for other connection with websocket
			return;

		this._socketIO!.on('acceptRematch', (data: GameData) => {

			if (this._waitingPopup.visible === true)
				this._waitingPopup.hide();
			if (this._playAgainPopup.visible === true)
				this._playAgainPopup.hide();
			this.switchScene('Game', data);
		});

		this._socketIO!.on('abortRematch', (info: string) => {

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

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace: trace }));

		this.events.on('shutdown', () => this.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any): void {
		this._socketIO!.emit(msgType, content);
	}

	createWaitingPopup(): void {

		this._waitingPopup = new PopupWidget(this, 'waiting for confirmation');
		this._waitingPopup.setDepth(1);
		this._widgets.push(this._waitingPopup);

		// btn to close the popup
		this._waitingPopup.add(new ButtonWidget(
			this,
			this.scale.width / 2 * 0.5,
			this.scale.height / 2 * 0.75,
			'close',
			() => this.switchScene('MainMenu'),
		));
	}

	createPlayAgainPopup(): void {

		this._playAgainPopup = new PopupWidget(this);
		this._playAgainPopup.setDepth(1);
		this._widgets.push(this._playAgainPopup);

		// btn to accept the rematch
		this._playAgainPopup.add(new ButtonWidget(
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
		));

		// btn to refuse the rematch
		this._playAgainPopup.add(new ButtonWidget(
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
		));
	}

	createRefusePopup(): void {
		this._refusePopup = new PopupWidget(this);
		this._refusePopup.setDepth(1);
		this._widgets.push(this._refusePopup);
	
		// btn to close the popup
		this._refusePopup.add(new ButtonWidget(
			this,
			this.scale.width / 2 * 0.5,
			this.scale.height / 2 * 0.75,
			'close',
			() => this.switchScene('MainMenu'),
		));
	}

	update(time: number, delta: number): void {
		super.update(time, delta);

		if (time - this._lastUpdate >= 100) {
			this._lastUpdate = time;
			this._waitingPopup.setTitle(`${this._bufferChars[this._retroIndexBuffer]} waiting for confirmation ${this._bufferChars[this._frontIndexBuffer]}`);
			this._frontIndexBuffer = (this._frontIndexBuffer === this._bufferChars.length - 1) ? 0 : this._frontIndexBuffer + 1;
			this._retroIndexBuffer = (this._retroIndexBuffer === 0) ? this._bufferChars.length - 1 : this._retroIndexBuffer - 1;
		}
	}

	disconnect(data?: any): void {
		if (this._winByForfeit === true)		// other player left, no need for other connection with websocket
			return;
		this._socketIO!.disconnect();
		this.events.off('shutdown');
	}
}
