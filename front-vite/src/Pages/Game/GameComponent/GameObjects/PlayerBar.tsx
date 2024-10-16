import { GAME_BAR, GAME } from '../GameData'
import Game from '../Scenes/Game'

class PlayerBar extends Phaser.Physics.Arcade.Body {

	private readonly _startPos: Phaser.Math.Vector2;

	// @param scene: Phaser.Scene that contains the bar
	// @param gameObj: graphical object to link to the bar
	// @param ball: ball instance of the game 
	// @param x: x pos
	// @param y: y pos
	constructor( scene: Game, gameObj: Phaser.GameObjects.GameObject, ball: Phaser.Physics.Arcade.Body, x: number, y: number) {

		super(scene.physics.world, gameObj);
		
		scene.physics.world.add(this);
		scene.physics.add.collider(this, ball);

		this._startPos = new Phaser.Math.Vector2(x, y);
		
		// a bar will never react physically to extern
		// effects (will move only because of user input),
		this.setImmovable();
		this.setCollideWorldBounds(true);
		this.resetPos();
	}

	// place bar in its starting position
	// i.e. middle-left or middle-right
	resetPos(): void {

		this.reset(this._startPos.x, this._startPos.y);
	}

	// scroll the bar up (key input received)
	moveUp(): void {

		if (this.y > 0) 
			this.y -= GAME_BAR.defaultSpeed;
	}

	// scroll the bar down (key input received)
	moveDown(): void {

		if ((this.y + this.height) < GAME.height) 
			this.y += GAME_BAR.defaultSpeed;
	}
};

export default PlayerBar;