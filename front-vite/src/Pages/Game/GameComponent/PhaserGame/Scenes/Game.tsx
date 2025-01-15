import { io, Socket } from 'socket.io-client';

import { GAME, GAME_BALL, GAME_BAR } from '../Game.data';
import * as GameTypes from '../Types/types';
import Ball from '../GameObjects/Ball';
import SpeedBall from '../GameObjects/SpeedBall';
import Paddle from '../GameObjects/Paddle';
import Field from '../GameObjects/Field';

export default class Game extends Phaser.Scene {

	// Game objects
	private _ball!: Ball;
	private _leftPaddle!: Paddle;
	private _rightPaddle!: Paddle;
	private _field!: Field;
	private _speedBall!: SpeedBall | null;

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
	// private _powerUpActive: boolean = false;
 	private _powerUpActive: { [key: number]: boolean } = { 0: false, 1: false }; // Tracks if a player has the power-up
  constructor() {
		
		super({ key: 'Game' });
  };

  // Initialize players and key bindings
	init(data: GameTypes.InitData): void {

		this._id = this.registry.get("user42data").id;
		this._nameNick = this.registry.get("user42data").nameNick;
		this._sessionToken = data.sessionToken;
		this._mode = data.mode;
		this._extras = data.extras;

		// Key bindings
		this._cursors = this.input.keyboard!.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
		// this._keyArrowUp = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP) as Phaser.Input.Keyboard.Key;
		this._keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
		this._keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
		this._keyEsc = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
  
		this.setupSocket();
	};

  // Load assets like images or sounds here
	preload(): void {};

	// Create game objects and establish WebSocket connection
	create(): void {

		// Set background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		// Create the ball as an instance of the Ball class
		this._ball = new Ball(this, GAME.width / 2, GAME.height / 2);  // Initialize ball with no movement initially

		// Create bars
		this._leftPaddle = new Paddle(this, GAME_BAR.width / 2, GAME.height / 2);
		this._rightPaddle = new Paddle(this, GAME.width - GAME_BAR.width / 2, GAME.height / 2);

		// Create field (handles borders, scoring, etc.)
		this._field = new Field(this);

		const initData: GameTypes.InitData = {sessionToken: this._sessionToken, mode: this._mode, extras: this._extras};
		const playerData: GameTypes.PlayerData = {playerId: this._id, nameNick: this._nameNick, sessionToken: this._sessionToken};

		this.sendMsgToServer('initData', initData);
		this.sendMsgToServer('playerData', playerData); // send data to the backend, adds player
	};

	setupSocket() {

		this._socketIO = io(
			import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_SIMULATION,
			{
				withCredentials: true,
				transports: ['websocket']
			}
		);

		this._socketIO.on('gameStart', (state: GameTypes.GameState) => {

			this._gameStarted = true;
			this._gameState = state;
		});

		this._socketIO.on('gameState', (state: GameTypes.GameState) => this._gameState = state);
		
		this._socketIO.on('endGame', (winner: string) => this.scene.start('Results', {winner}));

		this._socketIO.on('PlayerDisconnected', (trace: string) => this.scene.start('Error', {trace}));
		
		// Handle SpeedBall appearance
		this._socketIO.on('speedBallUpdate', (state: GameTypes.PowerUp) => {
		if (!this._speedBall) {
			// Create the SpeedBall object if it doesn't already exist
			this._speedBall = new SpeedBall(this, state.x, state.y);
		} else {
			// Update the SpeedBall position
			this._speedBall.updatePosition(state.x, state.y);
		}
		});

		    // Handle SpeedBall deactivation
		this._socketIO.on('speedBallDeactivated', () => {
		if (this._speedBall) {
			this._speedBall.destroy(); // Remove the SpeedBall from the scene
			this._speedBall = null; // Reset the reference
		}
		});
		this._socketIO.on('powerUpActivated', (state: GameTypes.PowerUpStatus) => {
			this._powerUpActive[state.player] = state.active
		});
		this.events.on('shutdown', () => this._socketIO.disconnect(), this);

	};

	sendMsgToServer(msgType: string, content: any) {
		this._socketIO.emit(msgType, content);
	};

	setPaddleColour(paddle: Paddle, active: boolean): void {
		if (active === true) {
			paddle.changeColor(0xffff00);
		}
		else if (paddle.getColor() === 0xffff00 && active === false) {
			paddle.changeColor(0x0000ff);
		}
		// console.log('Changing paddle color:', paddle, 'to:', color);
		// console.log('Ball color remains unchanged:', this._ball.getColor());

	}

	// Frame-by-frame update
	update(): void {

		if (this._gameStarted === false)
			return;

		if (this._keyW.isDown || this._cursors.up.isDown)
			this.sendMsgToServer('playerMove', {direction: GameTypes.PaddleDirection.up, sessionToken: this._sessionToken});
		else if (this._keyS.isDown || this._cursors.down.isDown)
			this.sendMsgToServer('playerMove', {direction: GameTypes.PaddleDirection.down, sessionToken: this._sessionToken});

		// Exit game with ESC
		if (this._keyEsc.isDown) {
			this.sendMsgToServer('playerLeft', {sessionToken: this._sessionToken});
			this.scene.start('MainMenu');
			// this.scene.start('Error', "random!")
		}
	
		console.log("Power-up state update: ", this._powerUpActive);
		this.setPaddleColour(this._leftPaddle, this._powerUpActive[0])
		this.setPaddleColour(this._rightPaddle, this._powerUpActive[1])
		this.updateGame();
  };

	updateGame(): void {
	
		// Update score
		this._field.updateScore(this._gameState.score.p1, this._gameState.score.p2);

		// Update ball position using the new method
		this._ball.updatePosition(this._gameState.ball.x, this._gameState.ball.y);

		// Update paddles based on player positions
		this._leftPaddle.updatePosition(this._gameState.p1.y);
		this._rightPaddle.updatePosition(this._gameState.p2.y);
	};
};
