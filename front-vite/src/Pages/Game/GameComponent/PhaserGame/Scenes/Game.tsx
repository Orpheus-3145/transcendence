import { io, Socket } from 'socket.io-client';
import BaseScene from './Base';

import * as GameTypes from '../Types/types';
import Ball from '../GameObjects/Ball';
import PowerUpBall from '../GameObjects/PowerUpBall';
import Paddle from '../GameObjects/Paddle';
import Field from '../GameObjects/Field';

export default class GameScene extends BaseScene {
	
	private _id: number;
	private _nameNick: string;
	private _sessionToken: string;
	private _mode: GameTypes.GameMode;
	private _difficulty: GameTypes.GameDifficulty;
	private _gameState: GameTypes.GameState;
	private _powerUpState: GameTypes.PowerUpPosition | null;
	private _gameStarted: boolean;

	private _gameSizeBackEnd: GameTypes.GameSize;
	private _widthRatio: number;
	private _heightRatio: number;
	
	private _powerUpSelection: Array<GameTypes.PowerUpType>;
	private _powerUpType: GameTypes.PowerUpType;
	private _powerUpActive: { [key: number]: boolean }; // Tracks if a player has the power-up
	
	private _urlWebsocket: string;
	private _socketIO!: Socket;

	// Game objects
	private _ball!: Ball;
	private _leftPaddle!: Paddle;
	private _rightPaddle!: Paddle;
	private _field!: Field;
	private _powerUp!: PowerUpBall | null;
	
	// Key listeners
	private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private _keyW!: Phaser.Input.Keyboard.Key;
	private _keyS!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: 'Game' });
		
		this._id = -1;
		this._nameNick = '';
		this._sessionToken = '';
		this._mode = GameTypes.GameMode.unset;
		this._difficulty = GameTypes.GameDifficulty.unset;
		this._gameState = {
			ball: { x: 0, y: 0 },
			p1: { y: 0 },
			p2: { y: 0 },
			score: { p1: 0, p2: 0 }
		}
		this._powerUpState = null;
		this._gameStarted = false;
		
		this._gameSizeBackEnd = {width: 0, height: 0}
		this._widthRatio = 0;
		this._heightRatio = 0;
		
		this._powerUpSelection = new Array();
		this._powerUpActive = { 0: false, 1: false };
		this._powerUpType = GameTypes.PowerUpType.speedBall;
		
		this._urlWebsocket = import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_SIMULATION;
	}

	// Initialize players and key bindings
	init(data: GameTypes.InitData): void {
		super.init();

		this._id = this.registry.get('user42data').id;
		this._nameNick = this.registry.get('user42data').nameNick;
		this._sessionToken = data.sessionToken;
		this._mode = data.mode;
		this._difficulty = data.difficulty;
		this._powerUpSelection = data.extras;
		this._gameState = {
			ball: { x: 0, y: 0 },
			p1: { y: 0 },
			p2: { y: 0 },
			score: { p1: 0, p2: 0 }
		}
		this._powerUpState = null;
		this._gameStarted = false;

		// Key bindings
		this._cursors =
			this.input.keyboard!.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
		this._keyW = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.W,
		) as Phaser.Input.Keyboard.Key;
		this._keyS = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.S,
		) as Phaser.Input.Keyboard.Key;

		this.setupSocket();
	}

	// Create game objects and establish WebSocket connection
	create(): void {
		super.create()

		if (this._mode === GameTypes.GameMode.single) {
			const initData: GameTypes.InitData = {
				sessionToken: this._sessionToken,
				mode: this._mode,
				difficulty: this._difficulty,
				extras: this._powerUpSelection,
			};
			this.sendMsgToServer('createRoomSinglePlayer', initData);
		}

		const playerData: GameTypes.PlayerData = {
			playerId: this._id,
			nameNick: this._nameNick,
			sessionToken: this._sessionToken,
		};
		this.sendMsgToServer('playerData', playerData); // send data to the backend, adds player
	}

	// Frame-by-frame update
	update(time: number, delta: number): void {
		super.update(time, delta);

		if (this._gameStarted == false) return;

		if (this._keyW.isDown || this._cursors.up.isDown)
			this.sendMsgToServer('playerMovedPaddle', {
				direction: GameTypes.PaddleDirection.up,
				sessionToken: this._sessionToken,
			});
		else if (this._keyS.isDown || this._cursors.down.isDown)
			this.sendMsgToServer('playerMovedPaddle', {
				direction: GameTypes.PaddleDirection.down,
				sessionToken: this._sessionToken,
			});

		this.handlePowerUp(this._leftPaddle, this._powerUpActive[0]);
		this.handlePowerUp(this._rightPaddle, this._powerUpActive[1]);

		// Update score
		this._field.updateScore(this._gameState.score.p1, this._gameState.score.p2);

		// Update ball position using the new method
		this._ball.updatePosition(this._gameState.ball.x, this._gameState.ball.y);

		// Update paddles based on player positions
		this._leftPaddle.updatePosition(this._gameState.p1.y);
		this._rightPaddle.updatePosition(this._gameState.p2.y);
	}

  buildGraphicObjects(): void {
		super.buildGraphicObjects();
		
		if (this._gameStarted === false)
			return ;

		this._ball = new Ball(this, this._gameState.ball.x, this._gameState.ball.y); // Initialize ball with no movement initially

		// Create bars
		const paddleWidthRatio = parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_PADDLE_WIDTH);
		this._leftPaddle = new Paddle(this, 0, this._gameState.p1.y);
		this._rightPaddle = new Paddle(this, this.scale.width - (this.scale.width / paddleWidthRatio), this._gameState.p2.y);

		// Create field (handles borders, scoring, etc.)
		this._field = new Field(this);

		if (this._powerUpState)
			this._powerUp = new PowerUpBall(this, this._powerUpState.x, this._powerUpState.y);
	}

	setupSocket() {
		this._socketIO = io(this._urlWebsocket, { withCredentials: true, transports: ['websocket'] });

		this._socketIO.on('gameStart', (gameSize: GameTypes.GameSize) => {
	
			// adjust position objects because of the new scale
			this._gameSizeBackEnd = gameSize;
			this.resetWindowRatio();
		});

		this._socketIO.on('gameState', (state: GameTypes.GameState) => {
			
			// apply ratio for current window size	
			state.ball.x /= this._widthRatio;
			state.ball.y /= this._heightRatio;
			state.p1.y /= this._heightRatio;
			state.p2.y /= this._heightRatio;
			
			this._gameState = state
			
			if (this._gameStarted === false) {
				this._gameStarted = true;
				this.buildGraphicObjects();
			}
		});

		this._socketIO.on('endGame', (data: { winner: string }) => this.switchScene('Results', data));

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace }));

		// power ups handling
		this._socketIO.on('powerUpUpdate', (state: GameTypes.PowerUpPosition) => {

			state.x /= this._widthRatio;
			state.y /= this._heightRatio;
			
			this._powerUpState = state;
			if (!this._powerUp)	// Create the powerUp object if it doesn't already exist
				this._powerUp = new PowerUpBall(this, this._powerUpState.x, this._powerUpState.y);
			else	// update position
				this._powerUp.updatePosition(this._powerUpState.x, this._powerUpState.y);
		});

		this._socketIO.on('powerUpDeactivated', () => {
			if (this._powerUp) {
				this._powerUp.destroy(); // Remove the power up
				this._powerUp = null; // Reset the reference
				this._powerUpState = null;
			}
		});

		this._socketIO.on('powerUpActivated', (state: GameTypes.PowerUpStatus) => {
			this._powerUpActive[state.player] = state.active;
			this._powerUpType = state.type;
		});

		this.events.on('shutdown', () => this.onPreLeave(), this);
	}

	sendMsgToServer(msgType: string, content?: any) {
		this._socketIO.emit(msgType, content);
	}

	getColour(): number {
		let colour: number = 0;
		if (this._powerUpType === GameTypes.PowerUpType.speedBall)
			colour = 0xff6600;  // Bright orange for speedBall
		else if (this._powerUpType === GameTypes.PowerUpType.speedPaddle)
			colour = 0x66ff33;  // Vibrant green for speedPaddle
		else if (this._powerUpType === GameTypes.PowerUpType.slowPaddle)
			colour = 0x9900cc;  // Calming purple for slowPaddle
		else if (this._powerUpType === GameTypes.PowerUpType.shrinkPaddle)
			colour = 0xff66cc;  // Light pink for shrinkPaddle
		else if (this._powerUpType === GameTypes.PowerUpType.stretchPaddle)
			colour = 0xcc0000;  // Deep red for stretchPaddle
		else
			this.switchScene('Error', {trace: "Error with power up type"});
		return colour;
	}

	handlePowerUp(paddle: Paddle, active: boolean): void {
		if (active === true) {
			paddle.changeColor(this.getColour());
			if (this._powerUpType === GameTypes.PowerUpType.shrinkPaddle)
				paddle.resizeShrink();
			else if (this._powerUpType === GameTypes.PowerUpType.stretchPaddle)
				paddle.resizeStretch();
		}	
		else if (paddle.getColor() != 0xffff00 && active === false) {
			paddle.changeColor(0x0000ff);
			if (this._powerUpType === GameTypes.PowerUpType.shrinkPaddle || this._powerUpType === GameTypes.PowerUpType.stretchPaddle)
				paddle.resizeOriginal();
		}
	}

	resetWindowRatio(): void {

		if (this._gameSizeBackEnd.width * this._gameSizeBackEnd.height === 0)
			this.switchScene('Error', `Invalid resize ratio, got zero value(s): ${this._gameSizeBackEnd.width} : ${this._gameSizeBackEnd.height}`);
		else if (this.scale.width * this.scale.height === 0)
			this.switchScene('Error', `Invalid window size, got zero value(s): ${this.scale.width} : ${this.scale.height}`);
		
		this._widthRatio = this._gameSizeBackEnd.width / this.scale.width;
		this._heightRatio = this._gameSizeBackEnd.height / this.scale.height;
	}

	onPreLeave() {
		this._socketIO.disconnect();
	}
}
