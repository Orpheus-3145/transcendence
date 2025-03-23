import { io, Socket } from 'socket.io-client';

import { GameData } from '/app/src/Types/Game/Interfaces';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import TextWidget from '../GameObjects/TextWidget';
import ButtonWidget from '../GameObjects/Button';


export default class MatchmakingScene extends BaseScene {
	private _socketIO!: Socket;
	private _gameInitData: GameData | null = null;
	private _lastUpdate: number = 1;
	private readonly _bufferChars: Array<string> = ["-", "\\", "|", "/", "-", "\\", "|", "/"];
	private _frontIndexBuffer: number = 0;
	private _retroIndexBuffer: number = 0;
	
	private textObject: TextWidget | null = null;

	constructor() {
		super({ key: 'Matchmaking' });
	}

	init(data: {gameData: GameData, animationSelected: AnimationSelected}): void {
		super.init()

		this._gameInitData = data.gameData;
		if (data.animationSelected !== undefined) {
			this._animationSelected = data.animationSelected;
		}
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
				this.switchScene('Game', {gameData: this._gameInitData, animationSelected: this._animationSelected});
			}
		});

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace: trace, animationSelected: this._animationSelected}));
		this.events.on('shutdown', () => this.disconnect(), this);
	}

	disconnect(): void {
		this._socketIO.disconnect();
	}
}
