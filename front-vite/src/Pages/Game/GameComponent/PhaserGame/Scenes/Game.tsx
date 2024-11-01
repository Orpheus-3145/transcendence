import { GAME, GAME_BALL, GAME_BAR } from '../Game.data';
import Ball from '../GameObjects/Ball';
import PlayerBar from '../GameObjects/PlayerBar';
import Field from '../GameObjects/Field';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

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

  constructor() {
    super({ key: 'Game' });
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

    // Create ball
    const shapeBall: Phaser.GameObjects.Arc = this.add.circle(GAME.width / 2, GAME.height / 2, GAME_BALL.radius, 0xff0000);
    this._ball = new Ball(this, shapeBall, GAME.width / 2, GAME.height / 2);

    // Create left and right paddles
    const shapeLeftBar = this.add.rectangle(GAME_BAR.width / 2 * -1, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);
    const shapeRightBar = this.add.rectangle(GAME.width - GAME_BAR.width / 2, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);

    this._leftBar = new PlayerBar(this, shapeLeftBar, this._ball, GAME_BAR.width / 2 * -1, GAME.height / 2);
    this._rightBar = new PlayerBar(this, shapeRightBar, this._ball, GAME.width - GAME_BAR.width / 2, GAME.height / 2);

    // Create field (handles borders, scoring, etc.)
    this._field = new Field(this, this._ball, this._idLeft, this._idRight);

    // WebSocket - Listen for game state updates
    socket.on('gameState', (state: { ball: { x: number, y: number }, paddles: { [id: string]: number } }) => {
      this._ball.setPosition(state.ball.x, state.ball.y); // Update ball position
      this._leftBar.y = state.paddles[this._idLeft] || this._leftBar.y;  // Update left paddle
      this._rightBar.y = state.paddles[this._idRight] || this._rightBar.y;  // Update right paddle
    });

    // Reset ball and paddles for a new game
    this.resetBallAndBars();
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
		console.log(`Emitting playerMove for ${this._idLeft} with direction: ${direction}`);
      socket.emit('playerMove', {
        playerId: this._idLeft, // Change to right player ID if needed
        direction
      });
    }

    // Exit game with ESC
    if (this._keyEsc.isDown) {
      this.scene.start('MainMenu');
    }
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

