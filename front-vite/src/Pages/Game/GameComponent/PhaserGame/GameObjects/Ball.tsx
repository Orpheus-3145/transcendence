import { GAME_BALL } from '../Game.data'
import Game from '../Scenes/Game'

// class Ball extends Phaser.GameObjects.Graphics {
//   
//  //  // starting position of the ball (middle of the game)
// 	// private readonly _startPos: Phaser.Math.Vector2;
//
//   constructor( scene: Game, gameObj: Phaser.GameObjects.GameObject, x: number, y: number ) {
//
//     // create basic Phaser.Body instance
//     super(scene.physics.world, gameObj);
//
//     scene.physics.world.add(this);
//
//     this._startPos = new Phaser.Math.Vector2(x, y);
//     
//     // ball bounces 'normally', cannot escape the field, placed it in the middle
//     this.setBounce(1);
//     this.setCollideWorldBounds(true);
//     this.resetPos();
//   }
//
//   // set the ball in the middle of the game
//   resetPos(): void {
//
//     this.reset(this._startPos.x, this._startPos.y);
//   }
//   
//   // spin the ball towards a random player in a random direction
//   startMoving(): void {
//     
//     const random_x = Phaser.Math.FloatBetween( Math.sqrt(3) / 2, 1 );		// between [rad(3)/2, 1] = [cos(+-30), cos(0)]
//     const random_y = Phaser.Math.FloatBetween( -0.5, 0.5 );							// between [-1/2, 1/2] = [sin(-30), sin(30)]
//     const random_direction = Math.random() < 0.5 ? -1 : 1;							// random between -1 and 1
//     
//     this.setVelocity( GAME_BALL.defaultSpeed * random_x * random_direction, GAME_BALL.defaultSpeed * random_y);
//   }
// };


class Ball extends Phaser.GameObjects.Graphics {
  private velocity: Phaser.Math.Vector2;
  private radius: number = 12.5;  // Hardcoded radius, no need to pass it from backend

  constructor(scene: Phaser.Scene, x: number, y: number, dx: number, dy: number) {
    super(scene);

    this.fillStyle(0xff0000, 1); 
    this.fillCircle(x, y, this.radius);  // Draw circle with hardcoded radius

    scene.add.existing(this);  // Add ball to the scene
  }

  // Update position and redraw ball with new coordinates
  updatePosition(x: number, y: number) {
    this.clear();  // Clear previous drawing
    this.setPosition(x, y);  // Update position
    this.fillCircle(0, 0, this.radius);  // Redraw the ball with the same radius
  }
}
export default Ball;

