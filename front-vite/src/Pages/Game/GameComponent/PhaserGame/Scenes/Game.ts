import { io, Socket } from 'socket.io-client';

import BaseScene from '/app/src/Pages/Game/GameComponent/PhaserGame/Scenes/Base';
import Ball from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Ball';
import PowerUp from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/PowerUp';
import Paddle from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Paddle';
import Field from '/app/src/Pages/Game/GameComponent/PhaserGame/GameObjects/Field';
import { GameDifficulty, GameMode, PaddleDirection, PowerUpSelected, PowerUpType } from '/app/src/Types/Game/Enum';
import { GameState, GameSize, GameData, PlayerData, PowerUpPosition, PowerUpStatus } from '/app/src/Types/Game/Interfaces';


export default class GameScene extends BaseScene {

	private _id!: number;
	private _nameNick!: string;
	private _sessionToken!: string;
	private _mode!: GameMode;
	private _difficulty!: GameDifficulty;
	private _gameState!: GameState;
	private _powerUpState!: PowerUpPosition | null;
	private _gameStarted!: boolean;
	private _keepConnectionOpen!: boolean;
	private _lastUpdate: number = 1;				// for idle time
	
	private _gameSizeBackEnd!: GameSize;
	private _widthRatio!: number;
	private _heightRatio!: number;

	private _powerUpSelection!: PowerUpSelected;
	private _powerUpType!: PowerUpType | null;
	private _powerUpActive!: { [key: number]: boolean }; // Tracks if a player has the power-up

	private _urlWebsocket: string;
	private _socketIO!: Socket;

	// Game objects
	private _ball!: Ball;
	private _leftPaddle!: Paddle;
	private _rightPaddle!: Paddle;
	private _field!: Field;
	private _powerUp!: PowerUp | null;

	// Key listeners
	private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private _keyW!: Phaser.Input.Keyboard.Key;
	private _keyS!: Phaser.Input.Keyboard.Key;

	constructor() {
		super({ key: 'Game' });

		this._urlWebsocket = import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_SIMULATION;
	}

	// Initialize players and key bindings
	init(gameData: GameData): void {
		super.init();

		this._id = this.registry.get('user42data').intraId;
		this._nameNick = this.registry.get('user42data').nameNick;

		this._sessionToken = gameData.sessionToken;
		this._mode = gameData.mode;
		this._difficulty = gameData.difficulty;
		this._powerUpSelection = gameData.extras;

		this._gameState = {
			ball: { x: 0, y: 0 },
			p1: { y: 0 },
			p2: { y: 0 },
			score: { p1: 0, p2: 0 }
		}
		this._powerUpState = null;
		this._gameStarted = false;
		this._keepConnectionOpen = false;

		this._gameSizeBackEnd = {width: 0, height: 0}
		this._widthRatio = 0;
		this._heightRatio = 0;

		this._powerUpActive = { 0: false, 1: false };
		this._powerUpType = null;

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

		if (this._mode === GameMode.single) {
			const initData: GameData = {
				sessionToken: this._sessionToken,
				mode: this._mode,
				difficulty: this._difficulty,
				extras: this._powerUpSelection,
			};
			this.sendMsgToServer('createRoomSinglePlayer', initData);
		}

		const playerData: PlayerData = {
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
				direction: PaddleDirection.up,
				sessionToken: this._sessionToken,
			});
		else if (this._keyS.isDown || this._cursors.down.isDown)
			this.sendMsgToServer('playerMovedPaddle', {
				direction: PaddleDirection.down,
				sessionToken: this._sessionToken,
			});

		if (time - this._lastUpdate >= 1000) {
			this._lastUpdate = time;
			const playerData: PlayerData = {
				playerId: this._id,
				nameNick: this._nameNick,
				sessionToken: this._sessionToken,
			};
			this.sendMsgToServer('playerIsActive', playerData);
		}

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

		// Create ball
		this._ball = new Ball(this, this._gameState.ball.x, this._gameState.ball.y); // Initialize ball with no movement initially
		this._widgets.push(this._ball);

		if (this._animation)
			this._animation.setBall(this._ball); // Pass the ball to the animation

		// Create player and opponent's paddles
		this._leftPaddle = new Paddle(this, 0, this._gameState.p1.y);
		this._widgets.push(this._leftPaddle);
	
		const paddleWidthRatio = parseInt(import.meta.env.GAME_WIDTH) / parseInt(import.meta.env.GAME_PADDLE_WIDTH);
		this._rightPaddle = new Paddle(this, this.scale.width - (this.scale.width / paddleWidthRatio), this._gameState.p2.y);
		this._widgets.push(this._rightPaddle);

		// Create field (i.e. the score)
		this._field = new Field(this);
		this._widgets.push(this._field);

		if (this._powerUpState) {
			this._powerUp = new PowerUp(this, this._powerUpState.x, this._powerUpState.y);
			this._widgets.push(this._powerUp);
		}
	}

	setupSocket(): void {
		this._socketIO = io(this._urlWebsocket, { withCredentials: true, transports: ['websocket'] });

		this._socketIO.on('gameStart', (gameSize: GameSize) => {
	
			// adjust position objects because of the new scale
			this._gameSizeBackEnd = gameSize;
			this.resetWindowRatio();
		});

		this._socketIO.on('gameState', (state: GameState) => {
			
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

		this._socketIO.on('endGame', (winner: string) => this.endGame(winner));
		this._socketIO.on('endGameByForfeit', (winner: string) => this.endGame(winner, true));

		this._socketIO.on('gameError', (trace: string) => this.switchScene('Error', { trace: trace }));

		// power ups handling
		this._socketIO.on('powerUpUpdate', (state: PowerUpPosition) => {

			state.x /= this._widthRatio;
			state.y /= this._heightRatio;
			
			this._powerUpState = state;
			if (!this._powerUp)	// Create the powerUp object if it doesn't already exist
				this._powerUp = new PowerUp(this, this._powerUpState.x, this._powerUpState.y);
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

		this._socketIO.on('powerUpActivated', (state: PowerUpStatus) => {
			this._powerUpActive[state.player] = state.active;
			this._powerUpType = state.type;
		
			if(state.player == 0)
				this.handlePowerUp(this._leftPaddle, state.active);
			else
				this.handlePowerUp(this._rightPaddle, state.active);
	
		});

		this.events.on('shutdown', () => this.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any): void {
		this._socketIO.emit(msgType, content);
	}

	// Change the colour of the paddke
	getColour(): number {
		let colour: number = 0xD3D3D3;
		if (this._powerUpType === PowerUpType.speedBall)
			colour = 0xff6600;  // Bright orange
		else if (this._powerUpType === PowerUpType.speedPaddle)
			colour = 0x66ff33;  // Green
		else if (this._powerUpType === PowerUpType.slowPaddle)
			colour = 0x9900cc;  // Purple
		else if (this._powerUpType === PowerUpType.shrinkPaddle)
			colour = 0xff66cc;  // Light pink
		else if (this._powerUpType === PowerUpType.stretchPaddle)
			colour = 0xcc0000;  // Deep red
		else
			this.switchScene('Error', {trace: `Error with power up type: ${this._powerUpType} not existing` });
		return colour;
	}

	handlePowerUp(paddle: Paddle, active: boolean): void {
		if (active === true) {
			paddle.changeColor(this.getColour());
			if (this._powerUpType === PowerUpType.shrinkPaddle)
				paddle.resizeShrink();
			else if (this._powerUpType === PowerUpType.stretchPaddle)
				paddle.resizeStretch();
		}	
		else if (paddle.getColor() != 0xffff00 && active === false) {
			paddle.changeColor(0xD3D3D3);
			if (this._powerUpType === PowerUpType.shrinkPaddle || this._powerUpType === PowerUpType.stretchPaddle)
				paddle.resizeOriginal();
		}
	}

	resetWindowRatio(): void {

		if (this._gameSizeBackEnd.width * this._gameSizeBackEnd.height === 0)
			this.switchScene('Error', {trace: `Invalid resize ratio, got zero value(s) w:${this._gameSizeBackEnd.width}, h: ${this._gameSizeBackEnd.height}` });
		else if (this.scale.width * this.scale.height === 0)
			this.switchScene('Error', {trace: `Invalid window size, got zero value(s) w: ${this.scale.width}, h: ${this.scale.height}` });
		
		this._widthRatio = this._gameSizeBackEnd.width / this.scale.width;
		this._heightRatio = this._gameSizeBackEnd.height / this.scale.height;
	}

	endGame(winner: string, winByForfeit= false): void {

		// stay connected to websocket if the win was not caused by forfeit, because the next scene needs it
		this._keepConnectionOpen = !winByForfeit;
		this.switchScene('Results', {
			winner: winner,
			score: this._gameState.score,
			sessionToken: (winByForfeit === false) ? this._sessionToken : null,
			socket: (winByForfeit === false) ? this._socketIO : null,
			winByForfeit: winByForfeit
		});
	}

	disconnect(): void {
		this.events.off('shutdown');
		if (this._keepConnectionOpen === false)
			this._socketIO.disconnect();
	}
}
