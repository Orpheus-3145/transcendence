import { io, Socket } from 'socket.io-client';

import { GAME, GAME_BALL, GAME_BAR } from '../Game.data';
import * as GameTypes from '../Types/types';
import Ball from '../GameObjects/Ball';
import Paddle from '../GameObjects/Paddle';
import Field from '../GameObjects/Field';

export default class Game extends Phaser.Scene {

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
	private _socketIO!: Socket;
	private _gameStarted: boolean = false;
	private _mode: GameTypes.GameMode = GameTypes.GameMode.unset;
	private _gameState!: GameTypes.GameState;

  constructor() {
		
		super({ key: 'Game' });
  };

  // Initialize players and key bindings
	init(data: GameTypes.InitData): void {

		this._id = this.registry.get("user42data").id;
		this._nameNick = this.registry.get("user42data").nameNick;
		this._sessionToken = data.sessionToken;
		this._mode = data.mode;

		// Key bindings
		this._cursors = this.input.keyboard!.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
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
		this._righPaddle = new Paddle(this, GAME.width - GAME_BAR.width / 2, GAME.height / 2);
		
		// Create field (handles borders, scoring, etc.)
		this._field = new Field(this);
		
		const initData: GameTypes.InitData = {sessionToken: this._sessionToken, mode: this._mode};
		const playerData: GameTypes.PlayerData = {playerId: this._id, nameNick: this._nameNick};
		
		this.sendMsgToServer('initData', initData);
		this.sendMsgToServer('playerData', playerData);
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

		this._socketIO.on('PlayerDisconnected', (trace: string) => this.scene.start('Errors', {trace}));
		
		this.events.on('shutdown', () => this._socketIO.disconnect(), this);
	};

	sendMsgToServer(msgType: string, content: any) {

		this._socketIO.emit(msgType, content);
	};

  // Frame-by-frame update
	update(): void {

		if (this._gameStarted == false)
			return;

		if (this._keyW.isDown || this._cursors.up.isDown)
			this.sendMsgToServer('playerMove', GameTypes.PaddleDirection.up);
		else if (this._keyS.isDown || this._cursors.up.isDown)
			this.sendMsgToServer('playerMove', GameTypes.PaddleDirection.down);

		// Exit game with ESC
		if (this._keyEsc.isDown)
			this.scene.start('MainMenu');
		
		this.updateGame();
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
