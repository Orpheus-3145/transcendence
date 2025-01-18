import { io, Socket } from 'socket.io-client';

import { GAME, GAME_BALL, GAME_PADDLE } from '../Game.data';
import * as GameTypes from '../Types/types';
import Ball from '../GameObjects/Ball';
import PowerUpBall from '../GameObjects/PowerUpBall';
import Paddle from '../GameObjects/Paddle';
import Field from '../GameObjects/Field';

export default class GameScene extends Phaser.Scene {
	// Game objects
	private _ball!: Ball;
	private _leftPaddle!: Paddle;
	private _rightPaddle!: Paddle;
	private _field!: Field;
	private _powerUp!: PowerUpBall | null;

	// Background image
	private _background!: Phaser.GameObjects.Image;

	// Key listeners
	private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private _keyW!: Phaser.Input.Keyboard.Key;
	private _keyS!: Phaser.Input.Keyboard.Key;
	private _keyEsc!: Phaser.Input.Keyboard.Key;

	// Player references
	private _id: number = -1;
	private _nameNick: string = '';
	private _sessionToken: string = '';
	private _socketIO!: Socket;
	private _gameStarted: boolean = false;
	private _mode: GameTypes.GameMode = GameTypes.GameMode.unset;
	private _extras: boolean = false;
	private _gameState!: GameTypes.GameState;

	private _powerUpActive: boolean[] = [false, false]; // Tracks if a player has the power-up
	private _powerUpType: string = "";

	constructor() {
		super({ key: 'Game' });
	}

	// Initialize players and key bindings
	init(data: GameTypes.InitData): void {
	this._sessionToken = data.sessionToken;
		this._id = this.registry.get('user42data').id;
		this._nameNick = this.registry.get('user42data').nameNick;
		this._mode = data.mode;

		this._extras = data.extras;

		// Key bindings
		this._cursors =
			this.input.keyboard!.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
		this._keyW = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.W,
		) as Phaser.Input.Keyboard.Key;
		this._keyS = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.S,
		) as Phaser.Input.Keyboard.Key;
		this._keyEsc = this.input.keyboard!.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC,
		) as Phaser.Input.Keyboard.Key;

		this.setupSocket();
	}

	// Load assets like images or sounds here
	preload(): void {}

	// Create game objects and establish WebSocket connection
	create(): void {
		// Set background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		// Create the ball as an instance of the Ball class
		this._ball = new Ball(this, GAME.width / 2, GAME.height / 2); // Initialize ball with no movement initially

		// Create bars
		this._leftPaddle = new Paddle(this, GAME_PADDLE.width / 2, GAME.height / 2);
		this._rightPaddle = new Paddle(this, GAME.width - GAME_PADDLE.width / 2, GAME.height / 2);

		// Create field (handles borders, scoring, etc.)
		this._field = new Field(this);

		if (this._mode === GameTypes.GameMode.single) {
			
			const initData: GameTypes.InitData = {
				sessionToken: this._sessionToken,
				mode: this._mode,
				extras: this._extras,
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

	setupSocket() {
		this._socketIO = io(import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_SIMULATION, {
			withCredentials: true,
			transports: ['websocket'],
		});

		this._socketIO.on('gameStart', (state: GameTypes.GameState) => {
			this._gameStarted = true;
			this._gameState = state;
		});

		this._socketIO.on('gameState', (state: GameTypes.GameState) => (this._gameState = state));

		this._socketIO.on('endGame', (data: { winner: string }) => this.scene.start('Results', data));

		this._socketIO.on('gameError', (trace: string) => this.scene.start('Error', { trace }));

		// power ups handling
		// Handle SpeedBall appearance
		this._socketIO.on('powerUpUpdate', (state: GameTypes.PowerUpPosition) => {
			console.log(`Printing the pos: ${state.x, state.y}`)
			if (!this._powerUp)	// Create the powerUp object if it doesn't already exist
				this._powerUp = new PowerUpBall(this, state.x, state.y);
			else	// Update the SpeedBall position
				this._powerUp.updatePosition(state.x, state.y);
		});

		// Handle SpeedBall deactivation
		this._socketIO.on('powerUpDeactivated', () => {
			if (this._powerUp) {
				this._powerUp.destroy(); // Remove the power up
				this._powerUp = null; // Reset the reference
			}
		});

		this._socketIO.on('powerUpActivated', (state: GameTypes.PowerUpStatus) => {
			this._powerUpActive[state.player] = state.active;
			this._powerUpType = state.type;
		});

		this.events.on('shutdown', () => this.disconnect(), this);
	}

	sendMsgToServer(msgType: string, content?: any) {
		this._socketIO.emit(msgType, content);
	}

	getColour(): number {
		let colour: number;
		if (this._powerUpType === "speedBall") {
			colour = 0xff6600;  // Bright orange for speedBall
		}
		else if (this._powerUpType === "speedPaddle") {
			colour = 0x66ff33;  // Vibrant green for speedPaddle
		}
		else if (this._powerUpType === "slowPaddle") {
			colour = 0x9900cc;  // Calming purple for slowPaddle
		}
		else if (this._powerUpType === "shrinkPaddle") {
			colour = 0xff66cc;  // Light pink for shrinkPaddle
		}
		else { // this._powerUpType === "stretchPaddle"
			colour = 0xcc0000;  // Deep red for stretchPaddle
		}
		return colour;
	}

	handlePowerUp(paddle: Paddle, active: boolean): void {
		if (active === true) {
			paddle.changeColor(this.getColour());
			if (this._powerUpType === "shrinkPaddle") {
				paddle.resizeShrink();
			}
			else if (this._powerUpType === "stretchPaddle") {
				paddle.resizeStretch();
			}
		}	
		else if (paddle.getColor() != 0xffff00 && active === false) {
			paddle.changeColor(0x0000ff);
			if (this._powerUpType === "shrinkPaddle" || this._powerUpType === "stretchPaddle") {
				paddle.resizeOriginal();
			}
		}
	}


	// Frame-by-frame update
	update(): void {
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

		// Exit game with ESC
		if (this._keyEsc.isDown) {
			this.sendMsgToServer('playerLeftGame');
			this.scene.start('MainMenu');
		}

		this.handlePowerUp(this._leftPaddle, this._powerUpActive[0]);
		this.handlePowerUp(this._rightPaddle, this._powerUpActive[1]);

		this.updateGame();
	}

	updateGame(): void {
		// Update score
		this._field.updateScore(this._gameState.score.p1, this._gameState.score.p2);

		// Update ball position using the new method
		this._ball.updatePosition(this._gameState.ball.x, this._gameState.ball.y);

		// Update paddles based on player positions
		this._leftPaddle.updatePosition(this._gameState.p1.y);
		this._rightPaddle.updatePosition(this._gameState.p2.y);
	}

	disconnect() {

		this._socketIO.disconnect();
	}
}
