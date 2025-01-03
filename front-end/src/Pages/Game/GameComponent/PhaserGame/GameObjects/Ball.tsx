import { GAME_BALL } from '../Game.data'

export default class Ball extends Phaser.GameObjects.Graphics {

  private readonly radius: number = GAME_BALL.radius;

  constructor(scene: Phaser.Scene, x: number, y: number) {

    super(scene);
    scene.add.existing(this);  // Add ball to the scene
  };

  // Update position and redraw ball with new coordinates
  updatePosition(x: number, y: number) {

    this.clear();  // Clear previous drawing
    this.setPosition(x, y);  // Update position
    this.fillCircle(0, 0, this.radius);  // Redraw the ball with the same radius
  };
};
