import { GAME_BALL } from '../Game.data';

export default class SpeedBall extends Phaser.GameObjects.Graphics {
  private readonly radius: number = GAME_BALL.radius;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene);

    // Add this graphics object to the scene
    scene.add.existing(this);

    // Set position and draw the initial circle
    this.setPosition(x, y);
    this.fillStyle(0xffff00, 1); // Yellow fill color
    this.fillCircle(0, 0, this.radius);
  }

  // Update position and redraw ball with new coordinates
  updatePosition(x: number, y: number) {
    this.clear(); // Clear previous drawing
    this.fillStyle(0xffff00, 1); // Reset fill color
    this.fillCircle(0, 0, this.radius); // Redraw the ball
    this.setPosition(x, y); // Update position
  }

	destroy(): void {
	this.clear(); // Clear graphics (optional, not strictly necessary since destroy will handle cleanup)
	super.destroy(); // Call the parent class's destroy method
	}

}
