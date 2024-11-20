import { GAME, GAME_BALL, GAME_BAR } from '../Game.data';
import Ball from '../GameObjects/Ball';
import Paddle from '../GameObjects/Paddle';
import Field from '../GameObjects/Field';
import { io, Socket } from 'socket.io-client';

export interface GameState { 
	ball: { 
		x: number, 
		y: number
	}, 
	player1: { 
		y: number 
	}, player2: { 
		y: number
	},
	score: {
		p1: number, 
		p2: number}
};

export enum GameMode {
  single = 'single',
  multi = 'multi',
  unset = 'unset',
};

class Game extends Phaser.Scene {

	// Game objects
  private _ball!: Ball;
  private _leftPaddle!: Paddle;
  private _righPaddle!: Paddle;
  private _field!: Field;

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
	private _mode: GameMode = GameMode.unset;
	private _socketIO!: Socket;
	private _gameState!: GameState;
	private _gameStarted: boolean = false;

  constructor() {
		
		super({ key: 'Game' });
  };

  // Initialize players and key bindings
	init(data: {sessionId: string, mode: GameMode}): void {

		this._id = this.registry.get("user42data").id;
		this._nameNick = this.registry.get("user42data").nameNick;
		this._sessionToken = data.sessionId;
		this._mode = data.mode;

		// Key bindings
		this._cursors = this.input.keyboard.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
		this._keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
		this._keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
		this._keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
  
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
		this._righPaddle = new Paddle(this, GAME.width - GAME_BAR.width / 2, GAME.height / 2);
		
		// Create field (handles borders, scoring, etc.)
		this._field = new Field(this);

		this._socketIO.emit('playerInfo', {playerNick: this._id, nameNick: this._nameNick});
		this._socketIO.emit('initData', {sessionToken: this._sessionToken, mode: this._mode});
	};

	setupSocket() {

		this._socketIO = io(
			import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_SIMULATION,
			{
				withCredentials: true,
				transports: ['websocket']
			}
		);

		this._socketIO.on('gameStart', (state: GameState) => {

			this._gameStarted = true;
			this._gameState = state;
		});

		this._socketIO.on('gameState', (state: GameState) => this._gameState = state);
		
		this._socketIO.on('endGame', (winner: string) => this.scene.start('Results', {winner}));

		this._socketIO.on('PlayerDisconnected', (trace: string) => this.scene.start('Errors', {trace}));
		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
	};

  // Frame-by-frame update
	update(): void {

		if (this._gameStarted == false)
			return;
	
		this.emitPaddleMovement();
		
		// Exit game with ESC
		if (this._keyEsc.isDown) {
			this.scene.start('MainMenu');
		}
		this.updateGame();
  };

	emitPaddleMovement(): void {
		let direction = '';

		if (this._cursors.up.isDown || this._keyW.isDown) {
			direction = 'up'; // Move up
		} else if (this._cursors.down.isDown || this._keyS.isDown) {
			direction = 'down'; // Move down
		}

		// Emit player movement only if a direction is pressed
		if (direction) {
			this._socketIO.emit('playerMove', {
				playerNick: this._nameNick, // Change to right player ID if needed, which side should the first person be on
				direction: direction
			});
		}
	};

	updateGame(): void {
	
		// Update score
		this._field.updateScore(this._gameState.score.p1, this._gameState.score.p2);

		// Update ball position using the new method
		this._ball.updatePosition(this._gameState.ball.x, this._gameState.ball.y);

		// Update paddles based on player positions
		this._leftPaddle.updatePosition(this._gameState.player1.y);
		this._righPaddle.updatePosition(this._gameState.player2.y);
	};
};

export default Game;

