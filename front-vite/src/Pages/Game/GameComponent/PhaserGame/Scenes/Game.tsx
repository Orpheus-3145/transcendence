import { GAME, GAME_BALL, GAME_BAR } from '../Game.data'
import Ball from '../GameObjects/Ball'
import PlayerBar from '../GameObjects/PlayerBar'
import Field from '../GameObjects/Field'

const socket = io('http://localhost:3000');

class Game extends Phaser.Scene {

	// game objects
	private _ball!: Ball;
	private _leftBar!: PlayerBar;
	private _rightBar!: PlayerBar; 
	private _field!: Field;

	// background image
	private _background!: Phaser.GameObjects.Image;

	// key listeners
	private _cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private _keyW!: Phaser.Input.Keyboard.Key;
	private _keyS!: Phaser.Input.Keyboard.Key;
	private _keyEsc!: Phaser.Input.Keyboard.Key;
	
	// player references
	private _idLeft: string = '';
	private _idRight: string = '';

	constructor () {

		super({ key: 'Game' });

	}

	// fired when scene.start('Game') is called, 
	// ids and keybindings are set ('UP', 'DOWN', 'W', 'S','ESC')
	// @param idLeft: left player
	// @param idRight: right player
	init(data: {idLeft: string, idRight: string}): void {

		this._idLeft = data.idLeft;
		this._idRight = data.idRight;

		this._cursors = this.input?.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
		this._keyW = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W) as Phaser.Input.Keyboard.Key;
		this._keyS = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S) as Phaser.Input.Keyboard.Key;
		this._keyEsc = this.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC) as Phaser.Input.Keyboard.Key;
	}

	// loading graphic assets, fired after init()
	preload(): void {

	}

	// run after preload(), creation of the elements of the game
	create(): void {
	
		// sets the background
		this._background = this.add.image(GAME.width / 2, GAME.height / 2, 'background');
		this._background.setDisplaySize(this.scale.width, this.scale.height);

		// ball object
		const shapeBall: Phaser.GameObjects.Arc = this.add.circle(GAME.width / 2, GAME.height / 2, GAME_BALL.radius, 0xff0000);
		this._ball = new Ball(this, shapeBall, GAME.width / 2, GAME.height / 2);

		// left and right bars for the two players
		const shapeLeftBar: Phaser.GameObjects.Rectangle = this.add.rectangle(GAME_BAR.width / 2 * -1, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);
		const shapeRightBar: Phaser.GameObjects.Rectangle = this.add.rectangle(GAME.width - GAME_BAR.width / 2, GAME.height / 2, GAME_BAR.width, GAME_BAR.height, 0xff0000);
		
		this._leftBar = new PlayerBar(this, shapeLeftBar, this._ball, GAME_BAR.width / 2 * -1, GAME.height / 2);
		this._rightBar = new PlayerBar(this, shapeRightBar, this._ball,  GAME.width - GAME_BAR.width / 2, GAME.height / 2);

		// field that contains the game, handles
		// the borders, scoring system, background, ...
		this._field = new Field(this, this._ball, this._idLeft, this._idRight);
		
		// start the game, set everything in position
		this.resetBallAndBars();
	}
	
	// run every frame update, receives key inputs
	// for moving the bars or close the game
	update(): void {
		
		// if ( this._cursors.up.isDown || this._keyW.isDown ) {
		// 	
		// 	this._leftBar.moveUp();
		// 	this._rightBar.moveUp();
		// }
		// else if ( this._cursors.down.isDown || this._keyS.isDown ) {
		// 	
		// 	this._leftBar.moveDown();
		// 	this._rightBar.moveDown();
		// }
		// else if ( this._keyEsc.isDown ) {
		// 	
		// 	this.scene.start('MainMenu');
		// }
		let direction = '';
		if (this._cursors.up.isDown || this._keyW.isDown) {
        	direction = 'up';  // Player moves up
    	}
		else if (this._cursors.down.isDown || this._keyS.isDown) {
			direction = 'down';  // Player moves DOWN
		}

    	// Send the direction to the backend only if there's a movement
    	if (direction) {
        	socket.emit('playerMove', {
            	playerId: this._idLeft, // Assuming this is the left player's movement. You can adjust based on actual player ID.
            	direction: direction
        	});
    	}

    	// Listen for updates from the backend for the paddle positions
    	socket.on('updatePaddlePosition', (data: { playerId: string, newY: number }) => {
        	if (data.playerId === this._idLeft) {
            	this._leftBar.y = data.newY;  // Update the left paddle position
        	}
			else if (data.playerId === this._idRight) {
            	this._rightBar.y = data.newY;  // Update the right paddle position
        	}
    	});

    // Optional: Handle the escape key to exit the game
    	if (this._keyEsc.isDown) {
        	this.scene.start('MainMenu');
    	}
	}

	// run when the game starts and on every new point
	// resets position of ball and bars, fires the ball afterwards
	resetBallAndBars(): void {
		
		this._ball.resetPos();
		this._leftBar.resetPos();
		this._rightBar.resetPos();
		this._ball.startMoving();
	}

	// stop game, goes on error page
	// @param trace: error description
	openErrorpage(trace: string): void {
		
		this.scene.start('Error', {trace: trace});
	}

	// once the maximum is reached the scene is changed
	// into the Result
	// @param idWinner: is of the winner player
	endGame(idWinner: string): void {

		this.scene.start('Results', {idWinner: idWinner});
	}
};

export default Game;
