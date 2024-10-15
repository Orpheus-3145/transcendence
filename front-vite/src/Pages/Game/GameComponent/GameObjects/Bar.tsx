import { GAME_BAR, GAME } from '../GameData'
import Game from '../Scenes/Game'

class Bar extends Phaser.Physics.Arcade.Body {

  private defaultSpeed: number;
	private startPos: Phaser.Math.Vector2;

		constructor( scene: Game, gameObj: Phaser.GameObjects.GameObject, x: number, y: number, ball: Phaser.Physics.Arcade.Body) {

			super(scene.physics.world, gameObj);
			
			scene.physics.world.add(this);
			scene.physics.add.collider(this, ball);

			this.defaultSpeed = GAME_BAR.defaultSpeed
			this.startPos = new Phaser.Math.Vector2(x, y);
			
			this.setImmovable();
			this.setCollideWorldBounds(true);
			this.resetPos();
		}

		resetPos() {

			this.reset(this.startPos.x, this.startPos.y);
		}

		moveUp() {

			if (this.y > 0) 
				this.y -= this.defaultSpeed;
		}

		moveDown() {

			if ((this.y + this.height) < GAME.height) 
				this.y += this.defaultSpeed;
		}
};

export default Bar;