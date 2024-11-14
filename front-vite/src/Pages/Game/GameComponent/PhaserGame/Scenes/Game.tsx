import { GAME, GAME_BALL, GAME_BAR } from '../Game.data';
import Ball from '../GameObjects/Ball';
import PlayerBar from '../GameObjects/PlayerBar';
import Field from '../GameObjects/Field';
import { io, Socket } from 'socket.io-client';

class Game extends Phaser.Scene {
  // Game objects
  private _ball!: Ball;
  private _leftBar!: PlayerBar;
  private _rightBar!: PlayerBar;
  private _field!: Field;

  // Background image
  private _background!: Phaser.GameObjects.Image;

  // Key listeners
  private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private _keyW!: Phaser.Input.Keyboard.Key;
  private _keyS!: Phaser.Input.Keyboard.Key;
  private _keyEsc!: Phaser.Input.Keyboard.Key;


  // Player references
	private _id: string = '';
	private _bot: boolean = false;
	private _socketIO: Socket;

  constructor() {
    super({ key: 'Game' });
	this._socketIO = io(
			import.meta.env.URL_WS_BACKEND + import.meta.env.WS_NS_SIMULATION,
			{
				withCredentials: true, // Include cookies, if necessary
				transports: ['websocket']
			}
		);

		this._socketIO.connect();
		console.log(this._socketIO);
		this._socketIO.on('connect', () => {console.log('Connected');});
		this._socketIO.on('message', () => {console.log('Ready to play!');});
  }

  // Initialize players and key bindings
  init(data: { id: string, bot: boolean}): void {
	this._id = data.id;
	this._bot = data.bot;

    // Key bindings
    this._cursors = this.input.keyboard.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this._keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
    this._keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
    this._keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
  }

  // Load assets
  preload(): void {
    // Load assets like images or sounds here
  }

  // Create game objects and establish WebSocket connection
  create(): void {
	console.log("Game scene started!");
    // Set background
    this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
    this._background.setDisplaySize(this.scale.width, this.scale.height);

    // Create the ball as an instance of the Ball class
    this._ball = new Ball(this, GAME.width / 2, GAME.height / 2, 0, 0);  // Initialize ball with no movement initially
	this._leftBar = new PlayerBar(this, GAME_BAR.width / 2, GAME.height / 2);
	this._rightBar = new PlayerBar(this, GAME.width - GAME_BAR.width / 2, GAME.height / 2);

    // Create field (handles borders, scoring, etc.)
    this._field = new Field(this);
	// FE should send it to the BE	
	this._socketIO.emit('gameData', {
		windowWidth: GAME.width,
		windowHeight: GAME.height,
		paddleWidth: GAME_BAR.width, 
		paddleHeight: GAME_BAR.height,
		bot: this._bot
	});
}

  // Frame-by-frame update
  update(): void {

	this.emitPaddleMovement();
	
    // Exit game with ESC
    if (this._keyEsc.isDown) {
      this.scene.start('MainMenu');
    }
	this.updateGameState();

  }

	checkScore(score1: number, score2: number) {
		if (score1 == 10){
		this.endGame('player1');
		}
		else if (score2 == 10){
		this.endGame('player2');
		}
	}

	updateGameState(): void {
	this._socketIO.on('gameState', (state: { ball: { x: number, y: number, dx: number, dy: number }, player1: { y: number }, player2: { y: number }, score: {player1: number, player2: number} }) => {
	// Update ball position using the new method
	this._ball.updatePosition(state.ball.x, state.ball.y);  // Ensure the ball is drawn at the new position
	this._field.setScore(state.score.player1, state.score.player2);
	this.checkScore(state.score.player1, state.score.player2);
	// Update paddles based on player positions
	this._leftBar.updatePosition(state.player1.y);
	this._rightBar.updatePosition(state.player2.y);
	});
	}

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
        playerId: this._id, // Change to right player ID if needed, which side should the first person be on
        direction
      });
    }
	}

  // Navigate to error page
  openErrorpage(trace: string): void {
    this.scene.start('Error', { trace });
  }

  // End game and show results
  endGame(idWinner: string): void {
    this.scene.start('Results', { idWinner });
  }
}

export default Game;

