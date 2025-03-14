import { io, Socket } from 'socket.io-client';

import { GameData } from '/app/src/Types/Game/Interfaces';
import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';


export default class MatchmakingScene extends BaseScene {
	private _socketIO!: Socket;
	private _gameInitData: GameData | null = null;

	constructor() {
		super({ key: 'Matchmaking' });
	}

	init(data: GameData): void {
		super.init()

		this._gameInitData = data;
		
		this.setupSocket();
		this._socketIO.emit('waiting', this._gameInitData);
	}

  buildGraphicObjects(): void {
		super.buildGraphicObjects();

		this.add.text(this.scale.width * 0.5, this.scale.height * 0.3, 'Waiting for playerz ...', {
			fontSize: `${Math.round(this._textFontRatio * this.scale.width) + 10}px`,
			align: 'center',
			color: '#fff',
		})
		.setOrigin(0.5, 0.5);

		const goHomeButton = this.add
			.text(this.scale.width * 0.9, this.scale.height * 0.9, 'Home', {
				fontSize: `${Math.round(this._textFontRatio * this.scale.width)}px`,
				align: 'center',
				color: '#fff',
			})
			.setOrigin(0.5, 0.5)
			.setInteractive()
			.on('pointerover', () => goHomeButton.setStyle({ fill: '#ff0' })) // Change color on hover
			.on('pointerout', () => goHomeButton.setStyle({ fill: '#fff' })) // Change color back when not hovered
			.on('pointerup', () => this.switchScene('MainMenu')); // Start the main game
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

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace }));

		this.events.on('shutdown', () => this.disconnect(), this);
	}

	disconnect(): void {
		this.events.off('shutdown');
		this._socketIO.disconnect();
	}
}
