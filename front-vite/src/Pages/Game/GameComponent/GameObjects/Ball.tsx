import { GAME_BALL } from '../GameData'
import Phaser from 'phaser'

export default class Ball extends Phaser.Physics.Arcade.Body {
  private defaultSpeed: number;
  private startPos: Phaser.Math.Vector2;

  constructor( scene: Phaser.Scene, gameObj: Phaser.GameObjects.GameObject, x: number, y: number )
  {

    super(scene.physics.world, gameObj);
    
    scene.physics.world.add(this);

    this.x = x;
    this.y = y;

    this.defaultSpeed = GAME_BALL.start_speed;
    this.startPos = new Phaser.Math.Vector2(this.x, this.y);
    
    this.setBounce(1);
    this.setCollideWorldBounds(true);
  }

  resetPos() {
    this.reset(this.startPos.x, this.startPos.y);
  
    const random_x = Phaser.Math.FloatBetween( Math.sqrt(3) / 2, 1 );		// between [rad(3)/2, 1] = [cos(+-30), cos(0)]
		const random_y = Phaser.Math.FloatBetween( -0.5, 0.5 );							// between [-1/2, 1/2] = [sin(-30), sin(30)]
		const random_direction = Math.random() < 0.5 ? -1 : 1;							// random between -1 and 1
		this.setVelocity( this.defaultSpeed * random_x * random_direction, this.defaultSpeed * random_y);
		
  }
}