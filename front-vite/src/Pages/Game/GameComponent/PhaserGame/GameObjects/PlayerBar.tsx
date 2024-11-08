import { GAME_BAR, GAME } from '../Game.data'
import Game from '../Scenes/Game'

// class PlayerBar extends Phaser.Physics.Arcade.Body {
//
// 	private readonly _startPos: Phaser.Math.Vector2;
//
// 	// @param scene: Phaser.Scene that contains the bar
// 	// @param gameObj: graphical object to link to the bar
// 	// @param ball: ball instance of the game 
// 	// @param x: x pos
// 	// @param y: y pos
// 	constructor( scene: Game, gameObj: Phaser.GameObjects.GameObject, ball: Phaser.Physics.Arcade.Body, x: number, y: number) {
//
// 		super(scene.physics.world, gameObj);
// 		
// 		scene.physics.world.add(this);
// 		scene.physics.add.collider(this, ball);
//
// 		this._startPos = new Phaser.Math.Vector2(x, y);
// 		
// 		// a bar will never react physically to extern
// 		// effects (will move only because of user input),
// 		this.setImmovable();
// 		this.setCollideWorldBounds(true);
// 		this.resetPos();
// 	}
//
// 	// place bar in its starting position
// 	// i.e. middle-left or middle-right
// 	resetPos(): void {
//
// 		this.reset(this._startPos.x, this._startPos.y);
// 	}
//
// 	// scroll the bar up (key input received)
// 	moveUp(): void {
//
// 		if (this.y > 0) 
// 			this.y -= GAME_BAR.defaultSpeed;
// 	}
//
// 	// scroll the bar down (key input received)
// 	moveDown(): void {
//
// 		if ((this.y + this.height) < GAME.height) 
// 			this.y += GAME_BAR.defaultSpeed;
// 	}
// };


class PlayerBar {

  // private readonly _startPos: Phaser.Math.Vector2;
  private _graphic: Phaser.GameObjects.Rectangle;

  // @param scene: Phaser.Scene that contains the bar
  // @param x: x pos
  // @param y: y pos
  constructor(scene: Game, x: number, y: number) {
    this._startPos = new Phaser.Math.Vector2(x, y);

    // Create a graphical rectangle to represent the player bar
    this._graphic = scene.add.rectangle(x, y, GAME_BAR.width, GAME_BAR.height, 0x0f0); // A green bar

    // Optional: Set some default properties for the bar
    this._graphic.setOrigin(0.5, 0.5); // Set origin to the center (for easier positioning)
    this._graphic.setDepth(1); // Ensure the bar is drawn above other elements (optional)
  }

  // Update the position of the bar based on backend data
  updatePosition(y: number): void {
    this._graphic.y = y; // Set the y position from backend data
  }

  // Optionally, reset the position if you need to reset to the start position
  resetPos(): void {
    this._graphic.setPosition(this._startPos.x, this._startPos.y);
  }
}

export default PlayerBar;


