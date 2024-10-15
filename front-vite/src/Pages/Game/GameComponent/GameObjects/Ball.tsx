import { GAME_BALL } from '../GameData'
import Game from '../Scenes/Game'

class Ball extends Phaser.Physics.Arcade.Body {
  
  private defaultSpeed: number;
  private startPos: Phaser.Math.Vector2;

  constructor( scene: Game, gameObj: Phaser.GameObjects.GameObject, x: number, y: number ) {

    super(scene.physics.world, gameObj);

    scene.physics.world.add(this);

    this.defaultSpeed = GAME_BALL.defaultSpeed;
    this.startPos = new Phaser.Math.Vector2(x, y);
    
    this.setBounce(1);
    this.setCollideWorldBounds(true);
    this.resetPos();
  }

  resetPos() {

    this.reset(this.startPos.x, this.startPos.y);
  
    const random_x = Phaser.Math.FloatBetween( Math.sqrt(3) / 2, 1 );		// between [rad(3)/2, 1] = [cos(+-30), cos(0)]
		const random_y = Phaser.Math.FloatBetween( -0.5, 0.5 );							// between [-1/2, 1/2] = [sin(-30), sin(30)]
		const random_direction = Math.random() < 0.5 ? -1 : 1;							// random between -1 and 1
		this.setVelocity( this.defaultSpeed * random_x * random_direction, this.defaultSpeed * random_y);
  }
};

export default Ball;