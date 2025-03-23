import { io, Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import TextWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/TextWidget';
import ButtonWidget from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Button';
import { GameData } from '/app/src/Types/Game/Interfaces';


export default class MatchmakingScene extends BaseScene {
	private _socketIO!: Socket;
	private _gameInitData: GameData | null = null;
	private _lastUpdate: number = 1;

	// for the animated text while waiting
	private readonly _bufferChars: Array<string> = ["-", "\\", "|", "/", "-", "\\", "|", "/"];
	private _frontIndexBuffer: number = 0;
	private _retroIndexBuffer: number = 0;
	
	private textObject: TextWidget | null = null;

	constructor() {
		super({ key: 'Matchmaking' });
	}

	init(gameData: GameData): void {
		super.init()

		this._gameInitData = gameData;

		this.setupSocket();
		this._socketIO.emit('waiting', this._gameInitData);
	}

	buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this.textObject = new TextWidget(
			this,
			this.scale.width * 0.5,
			this.scale.height * 0.3,
			'',
			20
		)
		this._widgets.push(this.textObject);

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
	}

	update(time: number, delta: number) {
		super.update(time, delta);

		if (time - this._lastUpdate >= 100) {
			this._lastUpdate = time;
			this.textObject!.setText(`${this._bufferChars[this._retroIndexBuffer]}${this._bufferChars[this._retroIndexBuffer]}${this._bufferChars[this._retroIndexBuffer]} Waiting for playerz ${this._bufferChars[this._frontIndexBuffer]}${this._bufferChars[this._frontIndexBuffer]}${this._bufferChars[this._frontIndexBuffer]}`);
			this._frontIndexBuffer = (this._frontIndexBuffer === this._bufferChars.length - 1) ? 0 : this._frontIndexBuffer + 1;
			this._retroIndexBuffer = (this._retroIndexBuffer === 0) ? this._bufferChars.length - 1 : this._retroIndexBuffer - 1;
		}
	}

	setupSocket(): void {
	
		this._socketIO = io(import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_MATCHMAKING, {
			withCredentials: true,
			transports: ['websocket'],
		});

		this._socketIO.on('ready', (sessionId: string) => {
			if (this._gameInitData) {

				this._gameInitData.sessionToken = sessionId;
				this.switchScene('Game', this._gameInitData);
			}
		});

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace: trace }));
		this.events.on('shutdown', () => this.disconnect(), this);
	}

	disconnect(): void {
		this._socketIO.disconnect();
	}
}
