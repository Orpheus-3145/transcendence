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
  private _idLeft: string = '';
  private _idRight: string = '';

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
  init(data: { idLeft: string, idRight: string }): void {
    this._idLeft = data.idLeft;
    this._idRight = data.idRight;

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

    // //Create ball
    // const shapeBall: Phaser.GameObjects.Arc = this.add.circle(GAME.width / 2, GAME.height / 2, GAME_BALL.radius, 0xff0000);
    // this._ball = new Ball(this, shapeBall, GAME.width / 2, GAME.height / 2);

    // Create left and right paddles
    const shapeLeftBar = this.add.rectangle(GAME_BAR.width / 2 * -1, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);
    const shapeRightBar = this.add.rectangle(GAME.width - GAME_BAR.width / 2, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);

    this._leftBar = new PlayerBar(this, shapeLeftBar, this._ball, GAME_BAR.width / 2 * -1, GAME.height / 2);
    this._rightBar = new PlayerBar(this, shapeRightBar, this._ball, GAME.width - GAME_BAR.width / 2, GAME.height / 2);

    // Create field (handles borders, scoring, etc.)
    this._field = new Field(this, this._ball, this._idLeft, this._idRight);

				
	this._socketIO.on('gameWindow', ( size: { widht: number, height: number}) => {
		console.log(`WINDOWWIDTH: ${size.widith}, WINDOWHEIGHT: ${size.height}`);
	});

	// this._socketIO.on('gameState', (state: { ball: { x: number, y: number, dx: number, dy: number }, player1: { y: number }, player2: { y: number } }) => {
 //  // Update ball position using the new method
 //  this._ball.updatePosition(state.ball.x, state.ball.y);  // Ensure the ball is drawn at the new position
	//
 //  // Optionally, you can also update the velocity
 //  this._ball.updateVelocity(state.ball.dx, state.ball.dy);
	//
 //  // Update paddles based on player positions
 //  this._leftBar.y = state.player1.y ?? this._leftBar.y;  // Update left paddle position (player1)
 //  this._rightBar.y = state.player2.y ?? this._rightBar.y;  // Update right paddle position (player2)
	//
 //  // Logging the positions for debugging
 //  console.log('Left Paddle ID:', this._idLeft, 'Y Position:', state.player1.y);
 //  console.log('Right Paddle ID:', this._idRight, 'Y Position:', state.player2.y);
 //  console.log('Ball Position:', state.ball.x, state.ball.y);  // Debugging ball position
	// });
}

  // Frame-by-frame update
  update(): void {
    let direction = '';

    if (this._cursors.up.isDown || this._keyW.isDown) {
	  direction = 'up'; // Move up
    } else if (this._cursors.down.isDown || this._keyS.isDown) {
      direction = 'down'; // Move down
    }

    // Emit player movement only if a direction is pressed
    if (direction) {
		// console.log(`Emitting playerMove for ${this._idLeft} with direction: ${direction}`);
      	this._socketIO.emit('playerMove', {
        playerId: this._idLeft, // Change to right player ID if needed, which side should the first person be on
        direction
      });
    }

    // Exit game with ESC
    if (this._keyEsc.isDown) {
      this.scene.start('MainMenu');
    }

this._socketIO.on('gameState', (state: { ball: { x: number, y: number, dx: number, dy: number }, player1: { y: number }, player2: { y: number } }) => {
  // Update ball position using the new method
  this._ball.updatePosition(state.ball.x, state.ball.y);  // Ensure the ball is drawn at the new position

  // Optionally, you can also update the velocity
  this._ball.updateVelocity(state.ball.dx, state.ball.dy);

  // Update paddles based on player positions
  this._leftBar.y = state.player1.y ?? this._leftBar.y;  // Update left paddle position (player1)
  this._rightBar.y = state.player2.y ?? this._rightBar.y;  // Update right paddle position (player2)

  // Logging the positions for debugging
  console.log('Left Paddle ID:', this._idLeft, 'Y Position:', state.player1.y);
  console.log('Right Paddle ID:', this._idRight, 'Y Position:', state.player2.y);
  console.log('Ball Position:', state.ball.x, state.ball.y);  // Debugging ball position
	});


  }

  // Reset ball and paddles on game start or score
  resetBallAndBars(): void {
    this._ball.resetPos();
    this._leftBar.resetPos();
    this._rightBar.resetPos();
    this._ball.startMoving();
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

